import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../../db'
import { clients, otpCodes, sessions } from '../../../../db/schema'
import { jsonError } from '../../../../lib/api'
import {
  MAX_CODE_ATTEMPTS,
  SESSION_TTL_MS,
  codeState,
  generateToken,
  hashCode,
  normalizeCode,
  safeEqual,
  sessionCookie,
  sha256Hex,
} from '../../../../lib/auth'
import { isSecureRequest } from '../../../../lib/auth-session'
import { attributionSchema } from '../../../../lib/attribution'
import { isValidPhone, normalizePhone } from '../../../../lib/booking-rules'

const bodySchema = z.object({
  phone: z.string().trim().min(7).max(20),
  code: z.string().trim().min(4).max(12),
  name: z.string().trim().min(2).max(120).optional(),
  consent: z.boolean().optional(),
  attribution: attributionSchema,
})

const INVALID = 'El código no es correcto o ya venció. Pide uno nuevo.'

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Revisa tu número y el código.')
  const phone = normalizePhone(parsed.data.phone)
  const code = normalizeCode(parsed.data.code)
  if (!isValidPhone(phone) || !code) return jsonError('Revisa tu número y el código.')

  const secret = process.env.AUTH_SECRET
  if (!secret) return jsonError('El ingreso no está disponible por ahora.', 503)

  const db = getDb()
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), eq(otpCodes.consumed, false)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1)
  if (!row || codeState(row) !== 'ok') return jsonError(INVALID, 400)

  const matches = safeEqual(row.codeHash, await hashCode(code, phone, secret))
  if (!matches) {
    await db
      .update(otpCodes)
      .set({ attempts: sql`${otpCodes.attempts} + 1` })
      .where(eq(otpCodes.id, row.id))
    const left = Math.max(0, MAX_CODE_ATTEMPTS - row.attempts - 1)
    return jsonError(left > 0 ? `Código incorrecto. Te quedan ${left} intentos.` : INVALID, 400)
  }

  const [existing] = await db.select().from(clients).where(eq(clients.phone, phone)).limit(1)
  let client = existing
  if (!client) {
    // First visit: the code is valid, but we still need the name and the data consent.
    if (!parsed.data.name || parsed.data.consent !== true) {
      return Response.json({ needsProfile: true })
    }
    const now = new Date().toISOString()
    const [created] = await db
      .insert(clients)
      .values({
        name: parsed.data.name,
        phone,
        consentAt: now,
        updatedAt: now,
        sourceChannel: parsed.data.attribution?.channel ?? null,
        sourceContent: parsed.data.attribution?.content ?? null,
      })
      .returning()
    client = created
  }
  if (!client.active) return jsonError('Tu cuenta está desactivada. Escríbenos para ayudarte.', 403)

  // Single use: only one concurrent request can flip consumed from false to true.
  const consumed = await db
    .update(otpCodes)
    .set({ consumed: true })
    .where(and(eq(otpCodes.id, row.id), eq(otpCodes.consumed, false)))
    .returning({ id: otpCodes.id })
  if (!consumed.length) return jsonError(INVALID, 400)

  const token = generateToken()
  const now = Date.now()
  await db.insert(sessions).values({
    tokenHash: await sha256Hex(token),
    clientId: client.id,
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    createdAt: new Date(now).toISOString(),
  })

  return Response.json(
    { client: { id: client.id, name: client.name, phone: client.phone } },
    {
      headers: {
        'set-cookie': sessionCookie(token, SESSION_TTL_MS / 1000, isSecureRequest(request)),
      },
    },
  )
}
