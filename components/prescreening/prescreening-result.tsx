import Link from '@/components/native-link'
import { ArrowRight, Check, Phone } from 'lucide-react'
import { formatCop, getCategory, startingPriceCop } from '@/lib/catalog'
import { whatsappUrl } from '@/lib/contact'
import type { Outcome } from '@/lib/prescreening'
import { GOAL_LABELS } from './questions'

export function PrescreeningResult({ name, outcome }: { name: string; outcome: Outcome }) {
  const firstName = name.trim().split(/\s+/)[0]
  const category = getCategory(outcome.recommendedSlug)
  const from = startingPriceCop(category)
  const whatsapp = whatsappUrl(
    `Hola, soy ${firstName}. Acabo de llenar la pre-valoración en la web.`,
  )

  if (outcome.route === 'llamada') {
    return (
      <section className="prescreen-card" aria-live="polite">
        <span className="success-mark">
          <Phone size={28} />
        </span>
        <p className="eyebrow">RESPUESTAS RECIBIDAS</p>
        <h1>{firstName}, te vamos a llamar.</h1>
        <p className="prescreen-lede">
          Por lo que nos contaste, es mejor que una persona del equipo hable contigo antes de
          agendar. Así elegimos juntos el punto de partida más seguro para ti.
        </p>
        <p>Te llamaremos al número que dejaste, en horario de atención.</p>
        {whatsapp && (
          <a className="button button-primary" href={whatsapp}>
            Escribirnos por WhatsApp <ArrowRight size={18} />
          </a>
        )}
        <Link href="/" className="text-link">
          Volver al inicio
        </Link>
      </section>
    )
  }

  return (
    <section className="prescreen-card" aria-live="polite">
      <span className="success-mark">
        <Check size={28} />
      </span>
      <p className="eyebrow">TU PUNTO DE PARTIDA</p>
      <h1>{firstName}, te recomendamos empezar por:</h1>
      <div className="prescreen-reco">
        <strong>{GOAL_LABELS[outcome.recommendedSlug] ?? category.title}</strong>
        <span>{category.description}</span>
        <small>{from === null ? 'Tarifa a consultar' : `Desde ${formatCop(from)}`}</small>
      </div>
      <p>
        Una persona del equipo revisará tus respuestas y te escribirá para confirmar el horario.
        {outcome.reviewNotes.length > 0 &&
          ' Tendremos en cuenta las condiciones de salud que nos indicaste.'}
      </p>
      <Link href="/contacto" className="button button-primary">
        Reservar mi primera visita <ArrowRight size={18} />
      </Link>
      <Link href={category.href} className="text-link">
        Conocer más sobre este servicio
      </Link>
    </section>
  )
}
