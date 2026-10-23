import Link from '@/components/native-link'
import { ArrowLeft } from 'lucide-react'
import { ClassesSchedule } from '@/components/classes/classes-schedule'

export const metadata = { title: 'Clases' }

export default function ClasesPage() {
  return (
    <main id="contenido" className="classes-page">
      <header className="member-header">
        <Link href="/" className="brand-lockup">
          <img src="/fisiofes-logo.svg" alt="Fisiofes" />
        </Link>
        <Link href="/" className="text-link">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
      </header>
      <ClassesSchedule />
    </main>
  )
}
