import Link from '@/components/native-link'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'
import { BookingExperience } from '@/components/booking-experience'

export const metadata = { title: 'Reservar' }

export default function ContactoPage() {
  return <main className="reservation-page">
    <header className="member-header"><Link href="/" className="brand-lockup"><img src="/fisiofes-logo.svg" alt="Fisiofes" /></Link><Link href="/" className="text-link"><ArrowLeft size={17} /> Volver al inicio</Link></header>
    <section className="reservation-layout"><aside><p className="eyebrow">RESERVA FISIOFES</p><h1>Tu primer paso,<br /><em>a tu ritmo.</em></h1><p>Solicita el horario que prefieres. No se realiza ningún cobro en este paso.</p><div className="reservation-facts"><span><Clock size={20} /><span><strong>Respuesta personal</strong><small>Confirmamos disponibilidad contigo.</small></span></span><span><MapPin size={20} /><span><strong>Senior&apos;s Mall</strong><small>Armenia, Quindío · dirección por confirmar.</small></span></span></div></aside><BookingExperience /></section>
  </main>
}
