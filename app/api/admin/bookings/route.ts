import { and, asc, eq, gte } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../../db'
import { bookings, classSlots, clients, followups } from '../../../../db/schema'
import { jsonError, requireAdmin } from '../../../../lib/api'
import { getCalendarSetup } from '../../../../lib/calendar'
import { eventTitle } from '../../../../lib/calendar/parse'
import { bogotaDate } from '../../../../lib/booking-dates'
import { followupForAttendance } from '../../../../lib/journey'

export async function GET() {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString()
  const rows = await getDb()
    .select({
      id: bookings.id,
      status: bookings.status,
      calendarSync: bookings.calendarSync,
      createdAt: bookings.createdAt,
      clientName: clients.name,
      clientPhone: clients.phone,
      service: classSlots.service,
      date: classSlots.date,
      time: classSlots.time,
    })
    .from(bookings)
    .innerJoin(clients, eq(clients.id, bookings.clientId))
    .innerJoin(classSlots, eq(classSlots.id, bookings.slotId))
    .where(gte(classSlots.startsAt, since))
    .orderBy(asc(classSlots.startsAt))
    .limit(300)
  const setup = getCalendarSetup()
  return Response.json({
    bookings: rows,
    calendar: setup
      ? {
          connected: true,
          mock: setup.mock,
          readCalendars: setup.readIds.length,
          writes: Boolean(setup.writeId),
        }
      : { connected: false, mock: false, readCalendars: 0, writes: false },
  })
}

const retrySchema = z.object({ id: z.string().min(1) })

/** Retries the Google Calendar mirror of a booking whose sync failed. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const parsed = retrySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Datos inválidos.')
  const setup = getCalendarSetup()
  if (!setup?.writeId) return jsonError('El calendario de escritura no está configurado.', 409)

  const db = getDb()
  const [row] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      calendarSync: bookings.calendarSync,
      clientName: clients.name,
      service: classSlots.service,
      startsAt: classSlots.startsAt,
    })
    .from(bookings)
    .innerJoin(clients, eq(clients.id, bookings.clientId))
    .innerJoin(classSlots, eq(classSlots.id, bookings.slotId))
    .where(and(eq(bookings.id, parsed.data.id)))
    .limit(1)
  if (!row) return jsonError('Reserva no encontrada.', 404)
  if (row.status !== 'confirmed') return jsonError('Solo se sincronizan reservas confirmadas.', 409)
  if (row.calendarSync === 'ok') return jsonError('Esta reserva ya está en el calendario.', 409)

  try {
    const start = new Date(row.startsAt)
    const eventId = await setup.client.createEvent(setup.writeId, {
      summary: eventTitle(row.service, row.clientName),
      description: 'Reserva hecha desde el portal de Fisiofes.',
      startIso: start.toISOString(),
      endIso: new Date(start.getTime() + 3_600_000).toISOString(),
      bookingId: row.id,
    })
    await db
      .update(bookings)
      .set({ calendarEventId: eventId, calendarSync: 'ok' })
      .where(eq(bookings.id, row.id))
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Calendar retry failed:', error instanceof Error ? error.message : error)
    return jsonError('No pudimos escribir en el calendario. Revisa los permisos.', 502)
  }
}

const attendanceSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['attended', 'no_show', 'confirmed']),
})

/**
 * Marks attendance. Attended or no-show creates one follow-up task for the team; switching
 * between them replaces the pending automatic task, and going back to "confirmed" skips it.
 */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const parsed = attendanceSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Datos inválidos.')
  const db = getDb()
  const [row] = await db
    .select({ id: bookings.id, status: bookings.status, phone: clients.phone })
    .from(bookings)
    .innerJoin(clients, eq(clients.id, bookings.clientId))
    .where(eq(bookings.id, parsed.data.id))
    .limit(1)
  if (!row) return jsonError('Reserva no encontrada.', 404)
  if (row.status === 'cancelled') return jsonError('La reserva está cancelada.', 409)

  const now = new Date().toISOString()
  await db
    .update(bookings)
    .set({
      status: parsed.data.status,
      attendedAt: parsed.data.status === 'confirmed' ? null : now,
    })
    .where(eq(bookings.id, row.id))

  const autoKinds = ['post_clase', 'inasistencia']
  const related = await db.select().from(followups).where(eq(followups.bookingId, row.id))
  for (const item of related.filter((f) => autoKinds.includes(f.kind) && f.status === 'pending')) {
    await db
      .update(followups)
      .set({ status: 'skipped', doneAt: now })
      .where(eq(followups.id, item.id))
  }
  if (parsed.data.status !== 'confirmed') {
    const plan = followupForAttendance(parsed.data.status, bogotaDate(new Date()))
    await db.insert(followups).values({
      id: crypto.randomUUID(),
      phone: row.phone,
      kind: plan.kind,
      bookingId: row.id,
      dueDate: plan.dueDate,
      note: plan.note,
      createdAt: now,
    })
  }
  return Response.json({ ok: true })
}
