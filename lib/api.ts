import { headers } from 'next/headers'
import { readCookie } from './auth'
import { DEMO_ADMIN_COOKIE, demoAdminToken } from './demo'

export function jsonError(error: string, status = 400, details?: Record<string, unknown>) {
  return Response.json({ error, ...details }, { status })
}

export async function requireAdmin() {
  const requestHeaders = await headers()
  const email = requestHeaders.get('oai-authenticated-user-email')?.toLowerCase()
  const configured = process.env.FISIOFES_ADMIN_EMAIL?.toLowerCase()
  if (email && configured && email === configured) return true
  // Demo deployments: the demo admin cookie issued by /api/demo/admin-login.
  const token = await demoAdminToken()
  return Boolean(token && readCookie(requestHeaders.get('cookie'), DEMO_ADMIN_COOKIE) === token)
}
