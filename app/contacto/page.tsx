import Link from '@/components/native-link'
import { ArrowLeft, ArrowRight, Clock, MapPin } from 'lucide-react'
import { BookingFlow } from '@/components/booking/booking-flow'

export const metadata = { title: 'Reservar' }

export default function ContactoPage() {
  return (
    <main id="contenido" className="reservation-page">
      <header className="member-header">
        <Link href="/" className="brand-lockup">
          <img src="/fisiofes-logo.svg" alt="Fisiofes" />
        </Link>
        <Link href="/" className="text-link">
          <ArrowLeft size={17} /> Volver al inicio
        </Link>
      </header>
      <section className="reservation-layout">
        <aside>
          <p className="eyebrow">RESERVA FISIOFES</p>
          <h1>
            Tu primer paso,
            <br />
            <em>a tu ritmo.</em>
          </h1>
          <p>Reserva tu clase con tu plan o pide una cita. No se hace ningún cobro en línea.</p>
          <div className="reservation-facts">
            <span>
              <Clock size={20} />
              <span>
                <strong>Respuesta personal</strong>
                <small>Confirmamos disponibilidad contigo.</small>
              </span>
            </span>
            <span>
              <MapPin size={20} />
              <span>
                <strong>Calarcá</strong>
                <small>Calle 37 #25-52</small>
              </span>
            </span>
            <span>
              <MapPin size={20} />
              <span>
                <strong>Senior&apos;s Mall, Armenia</strong>
                <small>Vía La Tebaida–El Caimo, km 1</small>
              </span>
            </span>
          </div>
          <Link href="/prevaloracion" className="text-link">
            ¿Primera vez? Haz la pre-valoración (2 minutos) <ArrowRight size={17} />
          </Link>
        </aside>
        <BookingFlow />
      </section>
    </main>
  )
}
