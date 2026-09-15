import Link from 'next/link'
import { ArrowRight, Check, Clock, MapPin } from 'lucide-react'
import { ReactNode } from 'react'

export function ServicePage({ eyebrow, title, intro, price, duration, bullets, children }: { eyebrow: string; title: ReactNode; intro: string; price: string; duration: string; bullets: string[]; children: ReactNode }) {
  return <main>
    <header className="member-header"><Link href="/" className="brand-lockup"><img src="/fisiofes-logo.svg" alt="FisioFES" /></Link><Link href="/#agendamiento" className="button button-dark">Agendar valoración <ArrowRight size={17} /></Link></header>
    <section className="inner-hero"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p><Link href="/contacto" className="button button-primary">Quiero empezar <ArrowRight size={18} /></Link></div><div className="service-summary"><span className="summary-label">DESDE</span><strong>{price}</strong><span><Clock size={16} /> {duration}</span><span><MapPin size={16} /> Senior&apos;s Mall, Armenia</span></div></section>
    <section className="service-detail section"><div><p className="eyebrow">LO QUE INCLUYE</p><h2>Una ruta clara para <em>avanzar.</em></h2><ul className="detail-list">{bullets.map(item => <li key={item}><Check size={18} />{item}</li>)}</ul></div><div className="detail-copy">{children}<Link href="/precios" className="text-link">Ver paquetes y precios <ArrowRight size={17} /></Link></div></section>
    <section className="final-cta section"><div><p className="eyebrow">TU SIGUIENTE PASO</p><h2>Tu objetivo merece <em>un plan.</em></h2><p>Cuéntanos qué quieres volver a hacer y te orientamos hacia el mejor punto de partida.</p><Link href="/contacto" className="button button-primary">Hablar con FisioFES <ArrowRight size={18} /></Link></div></section>
  </main>
}
