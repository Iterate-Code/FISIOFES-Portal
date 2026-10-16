import { eq } from 'drizzle-orm'
import { getDb } from '../../../../db'
import { sessions } from '../../../../db/schema'
import { SESSION_COOKIE, readCookie, sessionCookie, sha256Hex } from '../../../../lib/auth'
import { isSecureRequest } from '../../../../lib/auth-session'

export async function POST(request: Request) {
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE)
  if (token) {
    await getDb()
      .delete(sessions)
      .where(eq(sessions.tokenHash, await sha256Hex(token)))
  }
  return Response.json(
    { ok: true },
    { headers: { 'set-cookie': sessionCookie('', 0, isSecureRequest(request)) } },
  )
}
