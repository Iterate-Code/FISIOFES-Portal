import { z } from 'zod'
import { getDb } from '../../../../db'
import { otpCodes } from '../../../../db/schema'
import { jsonError, requireAdmin } from '../../../../lib/api'
import { generateCode, hashCode } from '../../../../lib/auth'
import { isValidPhone, normalizePhone } from '../../../../lib/booking-rules'

const bodySchema = z.object({ phone: z.string().trim().min(7).max(20) })

// Manual codes live 24 hours: the team sends them by their own means and the client may
// not log in right away.
const MANUAL_CODE_TTL_MS = 24 * 3_600_000

/** Admin-only: creates a one-time login code for a phone number. Shown once, never stored in clear. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Escribe el número de WhatsApp del cliente.')
  const phone = normalizePhone(parsed.data.phone)
  if (!isValidPhone(phone)) return jsonError('Escribe un número de WhatsApp válido.')
  const secret = process.env.AUTH_SECRET
  if (!secret) return jsonError('AUTH_SECRET no está configurada.', 503)

  const code = generateCode()
  const now = Date.now()
  await getDb()
    .insert(otpCodes)
    .values({
      id: crypto.randomUUID(),
      phone,
      codeHash: await hashCode(code, phone, secret),
      expiresAt: new Date(now + MANUAL_CODE_TTL_MS).toISOString(),
      createdAt: new Date(now).toISOString(),
    })
  return Response.json({ phone, code, expiresAt: new Date(now + MANUAL_CODE_TTL_MS).toISOString() })
}
