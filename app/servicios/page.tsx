import Link from '@/components/native-link'
import { ArrowUpRight } from 'lucide-react'
import { CATALOG } from '@/lib/catalog'

export const metadata = { title: 'Servicios' }

export default function ServiciosPage() {
  return (
    <main>
      <header className="member-header">
        <Link href="/" className="brand-lockup">
          <img src="/fisiofes-logo.svg" alt="FisioFES" />
        </Link>
        <Link href="/contacto" className="button button-dark">
          Reservar ahora
        </Link>
      </header>
      <section className="inner-hero">
        <div>
          <p className="eyebrow">SERVICIOS FISIOFES</p>
          <h1>
            Todo conectado a <em>tu objetivo.</em>
          </h1>
          <p>
            Empieza por donde estés. Conectamos el cuidado clínico, el movimiento, el bienestar y la
            fuerza en una sola ruta.
          </p>
          <Link href="/precios" className="button button-primary">
            Ver servicios y planes
          </Link>
        </div>
      </section>
      <section className="service-index section">
        <p className="eyebrow">ELIGE TU PUNTO DE PARTIDA</p>
        <div className="service-index-list">
          {CATALOG.map(({ slug, title, description, href }, index) => (
            <Link href={href} className="service-index-row" key={slug}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
