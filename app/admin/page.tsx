import { requireChatGPTUser, chatGPTSignOutPath } from '../chatgpt-auth'
import { AdminDashboard } from '../../components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
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
