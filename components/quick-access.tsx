import Link from '@/components/native-link'
import { CalendarDays, LogIn, Tags } from 'lucide-react'

export function QuickAccess() {
  return (
    <nav className="quick-access" aria-label="Accesos rápidos">
      <Link href="/precios">
        <Tags size={20} />
        <span>Planes</span>
      </Link>
      <Link href="/contacto" className="quick-primary">
        <CalendarDays size={20} />
        <span>Reservar</span>
      </Link>
      <Link href="/ingresar">
        <LogIn size={20} />
        <span>Ingresar</span>
      </Link>
    </nav>
  )
}
