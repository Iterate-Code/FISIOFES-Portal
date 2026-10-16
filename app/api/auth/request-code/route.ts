import { and, count, eq, gte } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../../db'
import { otpCodes } from '../../../../db/schema'
import { jsonError } from '../../../../lib/api'
import {
  CODE_TTL_MS,
  CODE_WINDOW_MS,
  MAX_CODES_PER_WINDOW,
  generateCode,
  hashCode,
} from '../../../../lib/auth'
import { isValidPhone, normalizePhone } from '../../../../lib/booking-rules'
import { sendCode } from '../../../../lib/otp-delivery'

const bodySchema = z.object({ phone: z.string().trim().min(7).max(20) })

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Escribe tu número de WhatsApp.')
  const phone = normalizePhone(parsed.data.phone)
  if (!isValidPhone(phone)) return jsonError('Escribe un número de WhatsApp válido.')

  const secret = process.env.AUTH_SECRET
  if (!secret) return jsonError('El ingreso no está disponible por ahora.', 503)

  const db = getDb()
  const now = Date.now()
  const since = new Date(now - CODE_WINDOW_MS).toISOString()
  const [recent] = await db
    .select({ total: count() })
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gte(otpCodes.createdAt, since)))
  if ((recent?.total ?? 0) >= MAX_CODES_PER_WINDOW) {
    return jsonError(
      'Ya te enviamos varios códigos. Espera unos minutos e inténtalo de nuevo.',
      429,
    )
  }

  const code = generateCode()
  const id = crypto.randomUUID()
  await db.insert(otpCodes).values({
    id,
    phone,
    codeHash: await hashCode(code, phone, secret),
    expiresAt: new Date(now + CODE_TTL_MS).toISOString(),
    createdAt: new Date(now).toISOString(),
  })

  try {
    const delivery = await sendCode(phone, code)
    // Same answer for registered and new numbers, so the endpoint cannot be used to look people up.
    return Response.json({ sent: true, ...delivery })
  } catch (error) {
    console.error('OTP delivery failed:', error instanceof Error ? error.message : error)
    await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, id))
    return jsonError('No pudimos enviar el código. Inténtalo de nuevo en unos minutos.', 502)
  }
}
