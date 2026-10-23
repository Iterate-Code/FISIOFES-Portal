import { z } from 'zod'
import { jsonError } from '../../../../lib/api'
import { safeEqual, sessionCookie } from '../../../../lib/auth'
import { isSecureRequest } from '../../../../lib/auth-session'
import { DEMO_ADMIN_COOKIE, demoAdminToken, isDemo } from '../../../../lib/demo'

const bodySchema = z.object({ key: z.string().min(1).max(200) })

/** Demo deployments only: exchanges the demo admin key for a cookie that unlocks /admin. */
export async function POST(request: Request) {
  if (!isDemo()) return jsonError('No disponible.', 404)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  const expected = process.env.DEMO_ADMIN_KEY
  const token = await demoAdminToken()
  if (!parsed.success || !expected || !token || !safeEqual(parsed.data.key, expected)) {
    return jsonError('La clave no es correcta.', 401)
  }
  // The cookie is the same name as the session cookie format; HttpOnly + 12 hours.
  const cookie = sessionCookie(token, 12 * 3600, isSecureRequest(request)).replace(
    /^fisiofes_session=/,
    `${DEMO_ADMIN_COOKIE}=`,
  )
  return Response.json({ ok: true }, { headers: { 'set-cookie': cookie } })
}
