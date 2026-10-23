import { desc, eq } from 'drizzle-orm'
import { getDb } from '../../../../db'
import { clients } from '../../../../db/schema'
import { jsonError, requireAdmin } from '../../../../lib/api'
import { normalizePhone } from '../../../../lib/booking-rules'

export async function GET() {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const rows = await getDb().select().from(clients).orderBy(desc(clients.updatedAt)).limit(500)
  return Response.json({ clients: rows.map(({ accessPinHash: _, ...client }) => client) })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const payload = (await request.json()) as {
    name?: string
    phone?: string
    email?: string
    planService?: 'pilates' | 'training' | 'dual'
    credits?: number
    expiresAt?: string
  }
  const phone = normalizePhone(payload.phone ?? '')
  const credits = Math.max(0, Math.floor(Number(payload.credits ?? 0)))
  if (
    !payload.name?.trim() ||
    !/^\+57\d{10}$/.test(phone) ||
    !['pilates', 'training', 'dual'].includes(payload.planService ?? '') ||
    !/^\d{4}-\d{2}-\d{2}$/.test(payload.expiresAt ?? '')
  ) {
    return jsonError('Datos del cliente o plan inválidos.')
  }
  const values = {
    name: payload.name.trim(),
    phone,
    email: payload.email?.trim() || null,
    planService: payload.planService!,
    creditsTotal: credits,
    creditsRemaining: credits,
    planExpiresAt: payload.expiresAt!,
    active: true,
    updatedAt: new Date().toISOString(),
  }
  const db = getDb()
  const [existing] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.phone, phone))
    .limit(1)
  const [client] = existing
    ? await db.update(clients).set(values).where(eq(clients.id, existing.id)).returning()
    : await db.insert(clients).values(values).returning()
  const { accessPinHash: _, ...safeClient } = client
  return Response.json({ client: safeClient }, { status: existing ? 200 : 201 })
}
