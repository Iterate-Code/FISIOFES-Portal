// Public demo deployment (DEMO_MODE=1). Never set this variable on the real site.
// Effects: login codes are shown on screen, the calendar is simulated, new accounts get a
// sample plan, a "test version" banner is shown, search engines are told not to index it,
// and /admin opens with a demo key instead of the managed-hosting sign-in.
import { hashCode } from './auth'

export function isDemo(): boolean {
  return process.env.DEMO_MODE === '1'
}

export const DEMO_ADMIN_COOKIE = 'fisiofes_demo_admin'

/** Value of the demo admin cookie, derived from the demo key and the server secret. */
export async function demoAdminToken(): Promise<string | null> {
  const key = process.env.DEMO_ADMIN_KEY
  const secret = process.env.AUTH_SECRET
  if (!isDemo() || !key || !secret) return null
  return hashCode(key, 'demo-admin', secret)
}
