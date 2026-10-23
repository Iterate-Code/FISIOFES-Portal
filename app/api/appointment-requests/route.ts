import { and, count, desc, eq } from 'drizzle-orm'
import { getDb } from '../../../db'
import { appointmentRequests, clients } from '../../../db/schema'
import { jsonError, requireAdmin } from '../../../lib/api'
import { requestSchema, validateRequestRules } from '../../../lib/appointment-request'
import { getSessionClient } from '../../../lib/auth-session'
import { CATALOG } from '../../../lib/catalog'

const MAX_PENDING_PER_CLIENT = 5

export async function POST(request: Request) {
  const client = await getSessionClient(request)
  if (!client) return jsonError('Inicia sesión para solicitar tu cita.', 401)

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Revisa los datos de tu solicitud.')
  const input = parsed.data
  if (!CATALOG.some((category) => category.slug === input.serviceSlug)) {
    return jsonError('Ese servicio no existe.')
  }
  const ruleError = validateRequestRules(input)
  if (ruleError) return jsonError(ruleError)

  const db = getDb()
  const [pending] = await db
    .select({ total: count() })
    .from(appointmentRequests)
    .where(
      and(eq(appointmentRequests.clientId, client.id), eq(appointmentRequests.status, 'pending')),
    )
  if ((pending?.total ?? 0) >= MAX_PENDING_PER_CLIENT) {
    return jsonError(
      'Ya tienes varias solicitudes en espera. El equipo te contactará pronto por WhatsApp.',
      429,
    )
  }

  const id = crypto.randomUUID()
  await db.insert(appointmentRequests).values({
    id,
    clientId: client.id,
    serviceSlug: input.serviceSlug,
    branch: input.branch,
    schedule: input.schedule,
    preferredDate: input.preferredDate ?? null,
    note: input.note || null,
    createdAt: new Date().toISOString(),
  })
  return Response.json({ id }, { status: 201 })
}

export async function GET() {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const rows = await getDb()
    .select({
      id: appointmentRequests.id,
      serviceSlug: appointmentRequests.serviceSlug,
      branch: appointmentRequests.branch,
      schedule: appointmentRequests.schedule,
      preferredDate: appointmentRequests.preferredDate,
      note: appointmentRequests.note,
      status: appointmentRequests.status,
      createdAt: appointmentRequests.createdAt,
      clientName: clients.name,
      clientPhone: clients.phone,
    })
    .from(appointmentRequests)
    .innerJoin(clients, eq(clients.id, appointmentRequests.clientId))
    .orderBy(desc(appointmentRequests.createdAt))
    .limit(200)
  return Response.json({ requests: rows })
}
