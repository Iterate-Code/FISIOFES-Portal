import Link from '@/components/native-link'
import { ArrowUpRight } from 'lucide-react'

const services = [
  ['01', 'Valoración funcional y longevidad', 'El punto de partida para entender tu cuerpo y diseñar una ruta segura.', '/servicios/valoracion-funcional-longevidad'],
  ['02', 'Fisioterapia', 'Recupera función, reduce dolor y vuelve a moverte con confianza.', '/servicios/fisioterapia'],
  ['03', 'Pilates', 'Control, fuerza y movilidad en grupos reducidos.', '/servicios/pilates'],
  ['04', 'Entrenamiento funcional', 'Capacidad física útil para tu vida, tus retos y tu futuro.', '/servicios/entrenamiento-funcional'],
]
export default function ServiciosPage() { return <main><header className="member-header"><Link href="/" className="brand-lockup"><img src="/fisiofes-logo.svg" alt="FisioFES" /></Link><Link href="/#agendamiento" className="button button-dark">Agendar valoración</Link></header><section className="inner-hero"><div><p className="eyebrow">SERVICIOS FISIOFES</p><h1>Todo conectado a <em>tu objetivo.</em></h1><p>Empieza por donde estés. Nosotros conectamos el cuidado clínico, el movimiento y la fuerza en una sola ruta.</p><Link href="/#agendamiento" className="button button-primary">Encontrar mi ruta</Link></div></section><section className="service-index section"><p className="eyebrow">ELIGE TU PUNTO DE PARTIDA</p><div className="service-index-list">{services.map(([number, title, body, href]) => <Link href={href} className="service-index-row" key={title}><span>{number}</span><div><h2>{title}</h2><p>{body}</p></div><ArrowUpRight /></Link>)}</div></section></main> }
