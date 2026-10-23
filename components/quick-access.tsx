import Link from '@/components/native-link'
import { CalendarDays, LogIn, Tags } from 'lucide-react'

export function QuickAccess() {
  return (
    <nav className="quick-access" aria-label="Accesos rápidos">
      <Link href="/precios">
        <Tags size={20} />
        <span>Planes</span>
      </Link>
      <Link href="/clases" className="quick-primary">
        <CalendarDays size={20} />
        <span>Clases</span>
      </Link>
      <Link href="/mi-fisiofes">
        <LogIn size={20} />
        <span>Mi cuenta</span>
      </Link>
    </nav>
  )
}
