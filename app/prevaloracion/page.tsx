import Link from '@/components/native-link'
import { ArrowLeft } from 'lucide-react'
import { PrescreeningWizard } from '@/components/prescreening/prescreening-wizard'

export const metadata = { title: 'Pre-valoración' }

export default function PrevaloracionPage() {
  return (
    <main id="contenido" className="prescreen-page">
      <header className="member-header">
        <Link href="/" className="brand-lockup">
          <img src="/fisiofes-logo.svg" alt="Fisiofes" />
        </Link>
        <Link href="/" className="text-link">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
      </header>
      <div className="prescreen-intro">
        <p className="eyebrow">PRE-VALORACIÓN</p>
        <p className="prescreen-lede">
          Responde unas preguntas cortas, sin prisa. Toma unos 2 minutos y nos ayuda a recomendarte
          el mejor punto de partida. No hay respuestas correctas ni incorrectas.
        </p>
      </div>
      <PrescreeningWizard />
    </main>
  )
}
