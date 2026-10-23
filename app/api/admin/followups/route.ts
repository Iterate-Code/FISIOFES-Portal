import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../../db'
import { followups } from '../../../../db/schema'
import { jsonError, requireAdmin } from '../../../../lib/api'
import { isValidPhone, normalizePhone } from '../../../../lib/booking-rules'
import { loadJourney } from '../../../../lib/journey-data'

/** Follow-ups by due date, with the name of the person and an overdue flag. */
export async function GET() {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const journey = await loadJourney()
  const names = new Map(journey.people.map((person) => [person.facts.phone, person.facts.name]))
  const rows = await getDb().select().from(followups).orderBy(asc(followups.dueDate)).limit(1000)
  return Response.json({
    today: journey.today,
    followups: rows.map((row) => ({
      ...row,
      name: names.get(row.phone) ?? row.phone,
      overdue: row.status === 'pending' && row.dueDate < journey.today,
    })),
  })
}

const createSchema = z.object({
  phone: z.string().trim().min(7).max(20),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(500).optional(),
})

/** Manual follow-up for any person, registered or not. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Revisa el teléfono y la fecha.')
  const phone = normalizePhone(parsed.data.phone)
  if (!isValidPhone(phone)) return jsonError('Teléfono inválido.')
  const row = {
    id: crypto.randomUUID(),
    phone,
    kind: 'manual' as const,
    dueDate: parsed.data.dueDate,
    note: parsed.data.note || null,
    createdAt: new Date().toISOString(),
  }
  await getDb().insert(followups).values(row)
  return Response.json({ followup: row }, { status: 201 })
}

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'done', 'skipped']),
  note: z.string().trim().max(500).optional(),
})

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Datos inválidos.')
  const updated = await getDb()
    .update(followups)
    .set({
      status: parsed.data.status,
      doneAt: parsed.data.status === 'pending' ? null : new Date().toISOString(),
      ...(parsed.data.note !== undefined ? { note: parsed.data.note || null } : {}),
    })
    .where(eq(followups.id, parsed.data.id))
    .returning({ id: followups.id, status: followups.status })
  if (!updated.length) return jsonError('Seguimiento no encontrado.', 404)
  return Response.json({ followup: updated[0] })
}
