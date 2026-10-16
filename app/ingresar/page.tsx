import Link from '@/components/native-link'
import { ArrowLeft } from 'lucide-react'
import { LoginExperience } from '@/components/login-experience'

export const metadata = { title: 'Ingresar' }

export default function IngresarPage() {
  return (
    <main className="login-page">
      <header className="member-header">
        <Link href="/" className="brand-lockup">
          <img src="/fisiofes-logo.svg" alt="Fisiofes" />
        </Link>
        <Link href="/" className="text-link">
          <ArrowLeft size={17} /> Volver
        </Link>
      </header>
      <div className="login-layout">
        <aside>
          <p className="eyebrow">UN SOLO LUGAR</p>
          <h2>
            Menos mensajes.
            <br />
            <em>Más claridad.</em>
          </h2>
          <div className="portal-list">
            <span>
              01 <strong>Próximas citas</strong>
            </span>
            <span>
              02 <strong>Clases disponibles</strong>
            </span>
            <span>
              03 <strong>Plan y sesiones usadas</strong>
            </span>
            <span>
              04 <strong>Progreso y recomendaciones</strong>
            </span>
          </div>
        </aside>
        <LoginExperience />
      </div>
    </main>
  )
}
