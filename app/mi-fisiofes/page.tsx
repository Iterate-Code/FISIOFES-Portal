import Link from '@/components/native-link'
import { ArrowLeft } from 'lucide-react'
import { AccountView } from '@/components/account-view'

export const metadata = { title: 'Mi Fisiofes' }

export default function MiFisiofesPage() {
  return (
    <main id="contenido" className="login-page">
      <header className="member-header">
        <Link href="/" className="brand-lockup">
          <img src="/fisiofes-logo.svg" alt="Fisiofes" />
        </Link>
        <Link href="/" className="text-link">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
      </header>
      <div className="login-layout account-layout">
        <AccountView />
      </div>
    </main>
  )
}
