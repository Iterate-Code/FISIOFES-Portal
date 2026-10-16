import Link from '@/components/native-link'
import { ArrowRight, Check } from 'lucide-react'
import { CATALOG, formatCop, startingPriceCop } from '@/lib/catalog'

export const metadata = { title: 'Servicios y planes' }

export default function PreciosPage() {
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
          <p className="eyebrow">SERVICIOS Y PLANES</p>
          <h1>
            Claridad para <em>elegir.</em>
          </h1>
          <p>
            Estos son todos nuestros servicios. Mostramos desde cuánto empieza cada uno; el equipo
            te explica el plan exacto según tu objetivo. Valores en pesos colombianos.
          </p>
        </div>
        <div className="service-summary">
          <span className="summary-label">PRIMERA VEZ</span>
          <strong>Sin pago anticipado</strong>
          <span>Reserva y confirmamos el cupo contigo.</span>
        </div>
      </section>
      {CATALOG.map((category) => {
        const from = startingPriceCop(category)
        return (
          <section className="pricing-category section" id={category.slug} key={category.slug}>
            <div className="pricing-category-heading">
              <div>
                <p className="eyebrow">{category.eyebrow}</p>
                <h2>{category.title}</h2>
                <p>{category.description}</p>
              </div>
              <span className="pricing-recommended">
                {from === null ? 'A CONSULTAR' : `DESDE ${formatCop(from)}`}
              </span>
            </div>
            <div className="pricing-grid">
              {category.offers.map((offer) => (
                <article className="pricing-card" key={offer.name}>
                  <p className="eyebrow">{category.eyebrow}</p>
                  <h3>{offer.name}</h3>
                  <p>{offer.summary}</p>
                  <Link href="/contacto" className="button button-primary">
                    Consultar y reservar <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
            {(category.packagesNote || category.consultNote) && (
              <ul className="pricing-notes">
                {category.packagesNote && (
                  <li>
                    <Check size={17} />
                    {category.packagesNote}
                  </li>
                )}
                {category.consultNote && (
                  <li>
                    <Check size={17} />
                    {category.consultNote}
                  </li>
                )}
              </ul>
            )}
          </section>
        )
      })}
      <section className="pricing-note">
        <p>
          <strong>¿No sabes por dónde empezar?</strong> Cuéntanos qué quieres volver a hacer y el
          equipo te orienta, sin compromiso.
        </p>
        <Link href="/contacto" className="text-link">
          Hablar con el equipo <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  )
}
