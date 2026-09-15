import Link from 'next/link'
import { Activity, ArrowRight, ArrowUpRight, BrainCircuit, Check, ChevronDown, HeartHandshake, MapPin, Menu, MessageCircle, ShieldCheck, Sparkles, TrendingUp, Users, X } from 'lucide-react'

const contact = '/contacto'

const goals = ['Volver a caminar con mi perro', 'Bajar de peso y sentirme bien', 'Recuperarme de una cirugía', 'Seguir disfrutando la vida en pareja']
const process = [
  { number: '01', title: 'Tu dolor o tu deseo', body: 'Partimos de lo que hoy te limita o de eso que quieres volver a hacer.', icon: HeartHandshake },
  { number: '02', title: 'Entendemos tu punto de partida', body: 'Escuchamos tu historia y evaluamos tu movimiento antes de recomendar.', icon: Activity },
  { number: '03', title: 'Diseñamos tu ruta', body: 'Integramos fisioterapia, Pilates y entrenamiento según tu objetivo.', icon: BrainCircuit },
  { number: '04', title: 'Avanzamos contigo', body: 'Medimos progreso, adaptamos el plan y celebramos cada logro en comunidad.', icon: TrendingUp },
]
const services = [
  ['Fisioterapia', 'Recuperación clínica para volver a moverte con confianza.', '/servicios/fisioterapia'],
  ['Pilates', 'Fuerza, control y movilidad en grupos reducidos.', '/servicios/pilates'],
  ['Entrenamiento', 'Capacidad física útil para tu vida y tus retos.', '/servicios/entrenamiento-funcional'],
  ['Valoración funcional', 'Datos claros para empezar y avanzar con seguridad.', '/servicios/valoracion-funcional-longevidad'],
]

function Header() {
  return <header className="site-header">
    <Link href="/" className="brand-lockup"><img src="/fisiofes-logo.svg" alt="Fisiofes" /></Link>
    <nav aria-label="Navegación principal"><Link href="#ruta">Cómo funciona</Link><Link href="#rutas">Rutas</Link><Link href="#servicios">Servicios</Link><Link href="/precios">Precios</Link><Link href="#comunidad">Comunidad</Link></nav>
    <Link href="#agendamiento" className="header-cta">Agendar cita <ArrowUpRight size={17} /></Link>
    <details className="mobile-menu"><summary aria-label="Abrir menú"><Menu className="open-icon" /><X className="close-icon" /></summary><div className="mobile-menu-panel"><Link href="#ruta">Cómo funciona</Link><Link href="/servicios">Servicios</Link><Link href="/servicios/valoracion-funcional-longevidad">Longevidad</Link><Link href="#comunidad">Comunidad</Link><Link href="/precios">Planes</Link><Link href={contact} className="button button-dark">Reservar</Link></div></details>
  </header>
}
function SectionLabel({ children }: { children: React.ReactNode }) { return <p className="eyebrow">{children}</p> }

export default function Home() {
  return <main>
    <Header />
    <section className="hero">
      <div className="hero-copy">
        <div className="trust-kicker"><span /> FISIOFES LONGEVITY CLUB</div>
        <h1>Vive más.<br /><em>Muévete mejor.</em></h1>
        <p className="hero-lede">Fisioterapia, Pilates y entrenamiento conectados en una ruta personalizada para ayudarte a recuperar movimiento, construir fuerza y seguir haciendo lo que amas.</p>
        <div className="hero-actions"><Link href="#agendamiento" className="button button-primary">Agenda tu valoración <ArrowRight size={19} /></Link><a href="#ruta" className="button button-ghost">Descubre cómo funciona <ChevronDown size={18} /></a></div>
        <div className="hero-proof"><div className="proof-faces" aria-hidden="true"><span>45+</span><span>55+</span><span>70+</span></div><p><strong>Un plan tan único como tu vida.</strong><br />Profesionales presentes en cada paso.</p></div>
      </div>
      <div className="hero-visual">
        <div className="photo-placeholder hero-image" role="img" aria-label="Espacio reservado para una fotografía humana en movimiento"><span>IMAGEN PRINCIPAL</span><strong>Movimiento real.<br />Personas reales.</strong><small>Fotografía editorial: adulto activo acompañado por un profesional.</small></div><div className="hero-overlay" />
        <div className="progress-console"><div className="console-head"><span><Sparkles size={16} /> TU RUTA FISIOFES</span><span className="live-badge">EN PROGRESO</span></div><p className="console-goal">“Quiero volver a caminar sin pensar en mi rodilla.”</p><div className="progress-track"><span /></div><div className="console-stats"><div><small>Punto de partida</small><strong>Valorado</strong></div><div><small>Plan actual</small><strong>Fuerza + movilidad</strong></div><div><small>Siguiente paso</small><strong>Adaptar y avanzar</strong></div></div></div>
        <div className="humanity-note"><ShieldCheck size={18} /><span><strong>Tecnología que personaliza.</strong><br />Humanidad que acompaña.</span></div>
      </div>
    </section>
    <section className="goal-ribbon" aria-label="Objetivos de nuestra comunidad"><span className="goal-ribbon-label">¿Qué quieres volver a hacer?</span>{goals.map(goal => <span className="goal-chip" key={goal}>{goal}</span>)}</section>

    <section className="priority-offer section" aria-labelledby="priority-title"><div className="priority-heading"><div><SectionLabel>EMPIEZA POR LO MÁS IMPORTANTE</SectionLabel><h2 id="priority-title">Tu siguiente paso, <em>claro.</em></h2></div><Link href="/precios" className="text-link">Ver todos los precios <ArrowRight size={17} /></Link></div><div className="priority-grid"><Link href="/servicios/fisioterapia" className="priority-card priority-feature"><span className="priority-badge">RECUPERACIÓN</span><h3>Valoración osteomuscular</h3><p>Entendemos tu dolor, movimiento y punto de partida.</p><strong>$60.000 <small>· 40 min</small></strong><span className="route-cta">Conocer la valoración <ArrowRight /></span></Link><Link href="/servicios/pilates" className="priority-card"><span className="priority-badge">MOVIMIENTO</span><h3>Primera clase de Pilates</h3><p>Prueba una sesión guiada en grupo reducido.</p><strong>$40.000 <small>· 50 min</small></strong><span className="route-cta">Ver Pilates <ArrowRight /></span></Link><Link href="/precios" className="priority-card"><span className="priority-badge">PLAN MENSUAL</span><h3>12 clases de Pilates</h3><p>Continuidad y acompañamiento durante el mes.</p><strong>$450.000 <small>· $37.500/clase</small></strong><span className="route-cta">Comparar paquetes <ArrowRight /></span></Link></div></section>

    <section className="journey section" id="ruta">
      <div className="section-intro journey-intro"><div><SectionLabel>UN PROCESO ÚNICO, TU RUTA PERSONAL</SectionLabel><h2>No empiezas con una clase.<br /><em>Empiezas con un para qué.</em></h2></div><p>No importa si quieres aliviar dolor, verte mejor o recuperar independencia. El punto de partida cambia; nuestra forma de acompañarte se mantiene.</p></div>
      <div className="journey-line" aria-hidden="true"><span /></div>
      <div className="process-grid">{process.map(({ number, title, body, icon: Icon }) => <article className="process-card" key={number}><div className="process-top"><span>{number}</span><Icon size={22} /></div><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section className="route-section section" id="rutas">
      <div className="route-heading"><div><SectionLabel>ELIGE TU PUNTO DE PARTIDA</SectionLabel><h2>¿Qué necesitas hoy?</h2></div><p>No tienes que conocer el nombre del servicio. Elige la frase que más se parece a ti y nosotros te orientamos.</p></div>
      <div className="route-grid">
        <Link href="/servicios/fisioterapia" className="route-card route-clinical"><span className="route-number">01</span><div><span className="route-tag">ME DUELE O ESTOY EN RECUPERACIÓN</span><h3>Quiero volver a moverme <em>sin miedo.</em></h3><p>Fisioterapia y rehabilitación guiadas por criterio clínico.</p><span className="route-cta">Conocer esta ruta <ArrowRight /></span></div></Link>
        <Link href="/servicios/pilates" className="route-card route-active"><span className="route-number">02</span><div><span className="route-tag">QUIERO SENTIRME MÁS FUERTE</span><h3>Quiero sentirme bien <em>en mi cuerpo.</em></h3><p>Pilates y entrenamiento adaptados a tu nivel y objetivo.</p><span className="route-cta">Conocer esta ruta <ArrowRight /></span></div></Link>
        <Link href="/servicios/valoracion-funcional-longevidad" className="route-card route-longevity"><span className="route-number">03</span><div><span className="route-tag">QUIERO CUIDAR MI FUTURO</span><h3>Quiero seguir viviendo <em>a mi manera.</em></h3><p>Fuerza, equilibrio y movilidad para sostener tu independencia.</p><span className="route-cta">Conocer esta ruta <ArrowRight /></span></div></Link>
      </div>
    </section>

    <section className="assessment section"><div className="assessment-copy"><SectionLabel>EL PUNTO DE PARTIDA</SectionLabel><h2>Primero entendemos.<br /><em>Después avanzamos.</em></h2><p>La Valoración Funcional del Movimiento y Longevidad convierte información sobre tu cuerpo en decisiones claras: qué priorizar, cómo empezar y cómo medir tu progreso.</p><ul>{['Composición corporal con InBody', 'Fuerza, equilibrio y movilidad', 'Capacidad funcional y resistencia', 'Semáforo funcional y plan personalizado'].map(item => <li key={item}><Check size={18} />{item}</li>)}</ul><Link href="/servicios/valoracion-funcional-longevidad" className="button button-primary">Conoce la valoración <ArrowRight size={18} /></Link><p className="pending-price">Tarifa en proceso de confirmación.</p></div><div className="assessment-visual"><div className="photo-placeholder assessment-photo" role="img" aria-label="Espacio reservado para fotografía de valoración funcional"><span>IMAGEN DE VALORACIÓN</span><strong>Fuerza que se<br />nota en tu vida.</strong><small>Fotografía: mujer senior entrenando con acompañamiento.</small></div><div className="assessment-panel"><div className="scan-orbit"><Activity /></div><div><small>PERFIL FUNCIONAL</small><strong>Tu línea base</strong><p>Datos que tu equipo interpreta y convierte en un plan humano.</p></div></div></div></section>

    <section className="intelligence section"><div className="intelligence-title"><SectionLabel>TECNOLOGÍA CON PROPÓSITO</SectionLabel><h2>Más precisión.<br /><em>Más humanidad.</em></h2></div><div className="intelligence-grid"><article><BrainCircuit /><h3>IA que ayuda a adaptar</h3><p>Organiza señales de tu proceso para que el equipo pueda ajustar tu ruta con mejor información.</p></article><article><Activity /><h3>Progreso que puedes ver</h3><p>Metas medibles y seguimiento claro para entender qué mejora y qué necesita atención.</p></article><article><Users /><h3>Profesionales que deciden contigo</h3><p>La tecnología apoya. La escucha, el criterio y las decisiones siguen siendo humanas.</p></article></div></section>

    <section className="services section" id="servicios"><div className="services-head"><div><SectionLabel>LAS HERRAMIENTAS DEL CAMINO</SectionLabel><h2>Un solo equipo.<br />Todo conectado.</h2></div><p>No te enviamos de un servicio a otro sin contexto. Combinamos lo clínico y lo físico alrededor de tu objetivo.</p></div><div className="service-list">{services.map(([title, body, href], index) => <Link href={href} className="service-row" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p><ArrowUpRight /></Link>)}</div></section>

    <section className="booking booking-invite section" id="agendamiento"><div className="booking-intro"><SectionLabel>RESERVA SIN COMPLICACIONES</SectionLabel><h2>Elige tu primer paso.<br /><em>Nosotros confirmamos contigo.</em></h2><p>Una reserva clara, sin pago anticipado y con una persona del equipo al otro lado.</p><div className="booking-assurances"><span><Check size={18} /> Menos de 2 minutos</span><span><Check size={18} /> Sin cobro en línea</span><span><Check size={18} /> Confirmación humana</span></div><Link href={contact} className="button button-primary">Comenzar mi reserva <ArrowRight size={19} /></Link></div><div className="booking-preview" aria-hidden="true"><span className="preview-label">RESERVA FISIOFES</span><div className="preview-progress"><i /><i /><i /><i /></div><h3>¿Qué te gustaría trabajar?</h3><div className="preview-option active"><Activity size={20} /><span><strong>Fisioterapia</strong><small>Dolor, lesión o recuperación</small></span><Check size={18} /></div><div className="preview-option"><HeartHandshake size={20} /><span><strong>Pilates</strong><small>Movilidad, control y fuerza</small></span></div><button>Continuar <ArrowRight size={18} /></button></div></section>

    <section className="community section" id="comunidad"><div className="community-copy"><SectionLabel>COMUNIDAD FISIOFES</SectionLabel><h2>El progreso también se construye <em>acompañado.</em></h2><p>Un lugar donde reconoces a las personas, celebras pequeños avances y construyes una identidad alrededor de cuidarte. No vienes solo a cumplir una cita: vienes a seguir viviendo mejor.</p><Link href={contact} className="text-link">Conoce al equipo al reservar <ArrowRight /></Link></div><div className="community-quote"><span>“</span><p>Entrenamos para vivir mejor,<br />no solo para hacer ejercicio.</p><small>FISIOFES LONGEVITY CLUB</small></div></section>

    <section className="final-cta section" id="sedes"><div><SectionLabel>TU RUTA PUEDE EMPEZAR HOY</SectionLabel><h2>Cuéntanos qué quieres<br /><em>volver a hacer.</em></h2><p>No necesitas saber qué servicio escoger. Una persona de nuestro equipo escucha tu objetivo y te orienta hacia el mejor primer paso.</p><Link href={contact} className="button button-primary"><MessageCircle size={19} /> Reservar ahora</Link></div><div className="contact-card"><MapPin size={22} /><div><strong>Senior&apos;s Mall · Armenia</strong><span>Dirección y número de local pendientes de confirmación antes de publicar.</span></div><div className="hours"><strong>Horario de clases</strong><span>Lunes a viernes: 6:00 a.m.–12:00 m. y 4:00–7:00 p.m.<br />Sábados: 8:00 a.m.–12:00 m.</span></div></div></section>
    <footer><div className="footer-top"><Link href="/" className="brand-lockup footer-logo"><img src="/fisiofes-logo.svg" alt="Fisiofes" /></Link><p>Tu objetivo. Tu ruta.<br />Humanidad en cada paso.</p><Link href="https://instagram.com/fisiofes" className="text-link">@fisiofes <ArrowUpRight size={15} /></Link></div><div className="footer-bottom"><span>© 2026 Fisiofes Physio, Pilates & Training</span><div><Link href="/servicios">Servicios</Link><Link href="/precios">Precios</Link><Link href="/contacto">Reserva</Link><Link href="#sedes">Sede y horarios</Link></div></div></footer>
  </main>
}
