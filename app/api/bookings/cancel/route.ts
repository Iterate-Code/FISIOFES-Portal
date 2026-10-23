import { eq, sql } from 'drizzle-orm'
import { getDb } from '../../../../db'
import { bookings, classSlots, clients } from '../../../../db/schema'
import { jsonError } from '../../../../lib/api'
import { getCalendarSetup } from '../../../../lib/calendar'
import { validateCancellation } from '../../../../lib/booking-rules'

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string }
  if (!token) return jsonError('Falta el código de cancelación.')
  const db = getDb()
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.cancellationToken, token))
    .limit(1)
  if (!booking) return jsonError('Reserva no encontrada.', 404)
  if (booking.status === 'cancelled')
    return Response.json({ cancelled: true, creditRefunded: booking.creditRefunded })
  const [slot] = await db
    .select()
    .from(classSlots)
    .where(eq(classSlots.id, booking.slotId))
    .limit(1)
  if (!slot) return jsonError('Clase no encontrada.', 404)
  const policy = validateCancellation(slot.startsAt)
  if (!policy.allowed) return jsonError('Esta clase ya comenzó y no puede cancelarse.', 409)

  await db
    .update(bookings)
    .set({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      creditRefunded: policy.refundCredit,
    })
    .where(eq(bookings.id, booking.id))
  await db
    .update(classSlots)
    .set({ bookedCount: Math.max(0, slot.bookedCount - 1) })
    .where(eq(classSlots.id, slot.id))
  if (policy.refundCredit) {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, booking.clientId))
      .limit(1)
    if (client)
      await db
        .update(clients)
        .set({
          creditsRemaining: sql`${clients.creditsRemaining} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(clients.id, client.id))
  }
  // Remove the mirrored event. Best effort: the booking is already cancelled in the portal.
  const setup = getCalendarSetup()
  if (setup?.writeId && booking.calendarEventId) {
    try {
      await setup.client.deleteEvent(setup.writeId, booking.calendarEventId)
    } catch (error) {
      console.error('Calendar delete failed:', error instanceof Error ? error.message : error)
    }
  }
  return Response.json({ cancelled: true, creditRefunded: policy.refundCredit })
}
