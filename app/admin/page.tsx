import { requireChatGPTUser, chatGPTSignOutPath } from '../chatgpt-auth'
import { headers } from 'next/headers'
import { AdminDashboard } from '../../components/admin-dashboard'
import { DemoAdminGate } from '../../components/demo-admin-gate'
import { readCookie } from '../../lib/auth'
import { DEMO_ADMIN_COOKIE, demoAdminToken, isDemo } from '../../lib/demo'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (isDemo()) {
    const token = await demoAdminToken()
    const cookie = readCookie((await headers()).get('cookie'), DEMO_ADMIN_COOKIE)
    return token && cookie === token ? <AdminDashboard userName="Demo" /> : <DemoAdminGate />
  }
  const user = await requireChatGPTUser('/admin')
  const allowed = user.email.toLowerCase() === process.env.FISIOFES_ADMIN_EMAIL?.toLowerCase()
  if (!allowed)
    return (
      <main id="contenido" className="login-page">
        <section className="login-card">
          <h1>Acceso restringido</h1>
          <p>Esta cuenta no está autorizada para administrar Fisiofes.</p>
          <a className="button button-primary" href={chatGPTSignOutPath('/admin')} target="_top">
            Cambiar de cuenta
          </a>
        </section>
      </main>
    )
  return <AdminDashboard userName={user.displayName} />
}
