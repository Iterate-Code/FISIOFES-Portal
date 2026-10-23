import { isDemo } from '@/lib/demo'

/** Visible on every page of a demo deployment so nobody mistakes it for the real site. */
export function DemoBanner() {
  if (!isDemo()) return null
  return (
    <div className="demo-banner" role="note">
      <strong>Versión de prueba.</strong> Los datos son de ejemplo y no se atienden reservas reales.
    </div>
  )
}
