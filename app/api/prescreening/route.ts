import { and, count, desc, eq, gte } from 'drizzle-orm'
import { getDb } from '../../../db'
import { prescreenings } from '../../../db/schema'
import { jsonError, requireAdmin } from '../../../lib/api'
import { isValidPhone, normalizePhone } from '../../../lib/booking-rules'
import { QUESTIONNAIRE_VERSION, submissionSchema, triage } from '../../../lib/prescreening'

const MAX_PER_PHONE_PER_HOUR = 3

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = submissionSchema.safeParse(body)
  if (!parsed.success) return jsonError('Revisa tus respuestas e inténtalo de nuevo.')

  const phone = normalizePhone(parsed.data.phone)
  if (!isValidPhone(phone)) return jsonError('Escribe un número de WhatsApp válido.')

  const db = getDb()
  const since = new Date(Date.now() - 3_600_000).toISOString()
  const [recent] = await db
    .select({ total: count() })
    .from(prescreenings)
    .where(and(eq(prescreenings.phone, phone), gte(prescreenings.createdAt, since)))
  if ((recent?.total ?? 0) >= MAX_PER_PHONE_PER_HOUR) {
    return jsonError('Ya recibimos tus respuestas. Un integrante del equipo te contactará.', 429)
  }

  // Triage always runs on the server so a client cannot downgrade its own red flags.
  const outcome = triage(parsed.data.answers)
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  await db.insert(prescreenings).values({
    id,
    name: parsed.data.name,
    phone,
    answers: JSON.stringify(parsed.data.answers),
    route: outcome.route,
    redFlags: JSON.stringify(outcome.redFlags),
    recommendedSlug: outcome.recommendedSlug,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    consentAt: now,
    // Stored with CURRENT_TIMESTAMP format elsewhere; ISO is fine for the range query above.
    createdAt: now,
  })

  return Response.json({ id, outcome }, { status: 201 })
}

export async function GET() {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const rows = await getDb()
    .select()
    .from(prescreenings)
    .orderBy(desc(prescreenings.createdAt))
    .limit(200)
  return Response.json({ prescreenings: rows })
}
