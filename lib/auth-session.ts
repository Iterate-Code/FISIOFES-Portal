import { and, eq, gt } from 'drizzle-orm'
import { getDb } from '../db'
import { clients, sessions } from '../db/schema'
import { SESSION_COOKIE, readCookie, sha256Hex } from './auth'

/** Client behind the session cookie of this request, or null. */
export async function getSessionClient(request: Request) {
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE)
  if (!token) return null
  const db = getDb()
  const tokenHash = await sha256Hex(token)
  const [row] = await db
    .select({ client: clients })
    .from(sessions)
    .innerJoin(clients, eq(clients.id, sessions.clientId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date().toISOString())))
    .limit(1)
  if (!row || !row.client.active) return null
  return row.client
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}
