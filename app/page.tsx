import Link from '@/components/native-link'
import Image from 'next/image'
import { CATALOG, formatCop, getCategory, startingPriceCop } from '@/lib/catalog'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  HeartHandshake,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

const contact = '/contacto'

const goals = [
  'Volver a caminar con mi perro',
  'Bajar de peso y sentirme bien',
  'Recuperarme de una cirugía',
  'Seguir disfrutando la vida en pareja',
]
const process = [
  {
    number: '01',
    title: 'Tu dolor o tu deseo',
    body: 'Partimos de lo que hoy te limita o de eso que quieres volver a hacer.',
    icon: HeartHandshake,
  },
  {
    number: '02',
    title: 'Entendemos tu punto de partida',
    body: 'Escuchamos tu historia y evaluamos tu movimiento antes de recomendar.',
    icon: Activity,
  },
  {
    number: '03',
    title: 'Diseñamos tu ruta',
    body: 'Integramos fisioterapia, Pilates y entrenamiento según tu objetivo.',
    icon: BrainCircuit,
  },
  {
    number: '04',
    title: 'Avanzamos contigo',
    body: 'Medimos progreso, adaptamos el plan y celebramos cada logro en comunidad.',
    icon: TrendingUp,
  },
]
const services = CATALOG.map(({ title, description, href }) => [title, description, href])

function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup">
        <img src="/fisiofes-logo.svg" alt="Fisiofes" />
      </Link>
      <nav aria-label="Navegación principal">
        <Link href="#rutas">Encuentra tu ruta</Link>
        <Link href="/servicios">Servicios</Link>
        <Link href="#sedes">Sede y horarios</Link>
      </nav>
      <div className="header-actions">
        <Link href="/precios" className="header-link">
          Servicios y planes
        </Link>
        <Link href="/ingresar" className="header-link">
          Ingresar
        </Link>
        <Link href={contact} className="header-cta">
          Reservar <ArrowUpRight size={17} />
        </Link>
      </div>
      <details className="mobile-menu">
        <summary aria-label="Abrir menú">
          <Menu className="open-icon" />
          <X className="close-icon" />
        </summary>
        <div className="mobile-menu-panel">
          <Link href="/precios">Servicios y planes</Link>
          <Link href="/contacto">Reservar</Link>
          <Link href="/ingresar">Ingresar</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="#sedes">Sede y horarios</Link>
        </div>
      </details>
    </header>
  )
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

export default function Home() {
  return (
    <main>
      <Header />
      <section className="hero">
        <div className="hero-copy">
          <div className="trust-kicker">
            <span /> FISIOFES LONGEVITY CLUB
          </div>
          <h1>
            Tu cuerpo, listo
            <br />
            <em>para seguir.</em>
          </h1>
          <p className="hero-lede">
            Fisioterapia, Pilates y entrenamiento para aliviar dolor, ganar fuerza y moverte con
            confianza. A tu edad, a tu ritmo.
          </p>
          <div className="hero-actions">
            <Link href="/precios" className="button button-primary">
              Ver servicios y planes <ArrowRight size={19} />
            </Link>
            <Link href={contact} className="button button-ghost">
              Reservar mi primera visita <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-shortcuts" aria-label="Elige según tu objetivo">
            <span>QUIERO</span>
            <Link href="/servicios/fisioterapia">Aliviar dolor</Link>
            <Link href="/servicios/pilates">Ganar fuerza</Link>
            <Link href="/servicios/valoracion-funcional-longevidad">Cuidar mi movilidad</Link>
          </div>
          <div className="hero-proof">
            <div className="proof-faces" aria-hidden="true">
              <span>45+</span>
              <span>55+</span>
              <span>70+</span>
            </div>
            <p>
              <strong>Un plan tan único como tu vida.</strong>
              <br />
              Profesionales presentes en cada paso.
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <Image
            className="hero-image"
            src="/brand/hero-fisiofes.png"
            alt="Adultos entrenando fuerza y movilidad con acompañamiento profesional"
            fill
            priority
            sizes="(max-width: 1050px) 100vw, 48vw"
          />
          <div className="hero-overlay" />
          <div className="progress-console">
            <div className="console-head">
              <span>
                <Sparkles size={16} /> TU RUTA FISIOFES
              </span>
              <span className="live-badge">EN PROGRESO</span>
            </div>
            <p className="console-goal">“Quiero volver a caminar sin pensar en mi rodilla.”</p>
            <div className="progress-track">
              <span />
            </div>
            <div className="console-stats">
              <div>
                <small>Punto de partida</small>
                <strong>Valorado</strong>
              </div>
              <div>
                <small>Plan actual</small>
                <strong>Fuerza + movilidad</strong>
              </div>
              <div>
                <small>Siguiente paso</small>
                <strong>Adaptar y avanzar</strong>
              </div>
            </div>
          </div>
          <div className="humanity-note">
            <ShieldCheck size={18} />
            <span>
              <strong>Tecnología que personaliza.</strong>
              <br />
              Humanidad que acompaña.
            </span>
          </div>
        </div>
      </section>
      <section className="goal-ribbon" aria-label="Objetivos de nuestra comunidad">
        <span className="goal-ribbon-label">¿Qué quieres volver a hacer?</span>
        {goals.map((goal) => (
          <span className="goal-chip" key={goal}>
            {goal}
          </span>
        ))}
      </section>

      <section className="priority-offer section" aria-labelledby="priority-title">
        <div className="priority-heading">
          <div>
            <SectionLabel>EMPIEZA POR LO MÁS IMPORTANTE</SectionLabel>
            <h2 id="priority-title">
              Tu siguiente paso, <em>claro.</em>
            </h2>
          </div>
          <Link href="/precios" className="text-link">
            Ver todos los servicios <ArrowRight size={17} />
          </Link>
        </div>
        <div className="priority-grid">
          <Link href="/servicios/fisioterapia" className="priority-card priority-feature">
            <span className="priority-badge">RECUPERACIÓN</span>
            <h3>Valoración osteomuscular</h3>
            <p>Entendemos tu dolor, movimiento y punto de partida.</p>
            <strong>
              Desde {formatCop(startingPriceCop(getCategory('fisioterapia'))!)}{' '}
              <small>· 40 min</small>
            </strong>
            <span className="route-cta">
              Conocer la valoración <ArrowRight />
            </span>
          </Link>
          <Link href="/servicios/pilates" className="priority-card">
            <span className="priority-badge">MOVIMIENTO</span>
            <h3>Primera clase de Pilates</h3>
            <p>Prueba una sesión guiada en grupo reducido.</p>
            <strong>
              Desde {formatCop(startingPriceCop(getCategory('pilates'))!)} <small>· 50 min</small>
            </strong>
            <span className="route-cta">
              Ver Pilates <ArrowRight />
            </span>
          </Link>
          <Link href="/servicios/entrenamiento-funcional" className="priority-card">
            <span className="priority-badge">FUERZA</span>
            <h3>Entrenamiento funcional</h3>
            <p>Fuerza y equilibrio para tu vida diaria, con paquetes mensuales.</p>
            <strong>
              Desde {formatCop(startingPriceCop(getCategory('entrenamiento-funcional'))!)}{' '}
              <small>· 50 min</small>
            </strong>
            <span className="route-cta">
              Ver entrenamiento <ArrowRight />
            </span>
          </Link>
        </div>
      </section>

      <section className="journey section" id="ruta">
        <div className="section-intro journey-intro">
          <div>
            <SectionLabel>UN PROCESO ÚNICO, TU RUTA PERSONAL</SectionLabel>
            <h2>
              No empiezas con una clase.
              <br />
              <em>Empiezas con un para qué.</em>
            </h2>
          </div>
          <p>
            No importa si quieres aliviar dolor, verte mejor o recuperar independencia. El punto de
            partida cambia; nuestra forma de acompañarte se mantiene.
          </p>
        </div>
        <div className="journey-line" aria-hidden="true">
          <span />
        </div>
        <div className="process-grid">
          {process.map(({ number, title, body, icon: Icon }) => (
            <article className="process-card" key={number}>
              <div className="process-top">
                <span>{number}</span>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="route-section section" id="rutas">
        <div className="route-heading">
          <div>
            <SectionLabel>ELIGE TU PUNTO DE PARTIDA</SectionLabel>
            <h2>¿Qué necesitas hoy?</h2>
          </div>
          <p>
            No tienes que conocer el nombre del servicio. Elige la frase que más se parece a ti y
            nosotros te orientamos.
          </p>
        </div>
        <div className="route-grid">
          <Link href="/servicios/fisioterapia" className="route-card route-clinical">
            <span className="route-number">01</span>
            <div>
              <span className="route-tag">ME DUELE O ESTOY EN RECUPERACIÓN</span>
              <h3>
                Quiero volver a moverme <em>sin miedo.</em>
              </h3>
              <p>Fisioterapia y rehabilitación guiadas por criterio clínico.</p>
              <span className="route-cta">
                Conocer esta ruta <ArrowRight />
              </span>
            </div>
          </Link>
          <Link href="/servicios/pilates" className="route-card route-active">
            <span className="route-number">02</span>
            <div>
              <span className="route-tag">QUIERO SENTIRME MÁS FUERTE</span>
              <h3>
                Quiero sentirme bien <em>en mi cuerpo.</em>
              </h3>
              <p>Pilates y entrenamiento adaptados a tu nivel y objetivo.</p>
              <span className="route-cta">
                Conocer esta ruta <ArrowRight />
              </span>
            </div>
          </Link>
          <Link
            href="/servicios/valoracion-funcional-longevidad"
            className="route-card route-longevity"
          >
            <span className="route-number">03</span>
            <div>
              <span className="route-tag">QUIERO CUIDAR MI FUTURO</span>
              <h3>
                Quiero seguir viviendo <em>a mi manera.</em>
              </h3>
              <p>Fuerza, equilibrio y movilidad para sostener tu independencia.</p>
              <span className="route-cta">
                Conocer esta ruta <ArrowRight />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="assessment section">
        <div className="assessment-copy">
          <SectionLabel>EL PUNTO DE PARTIDA</SectionLabel>
          <h2>
            Primero entendemos.
            <br />
            <em>Después avanzamos.</em>
          </h2>
          <p>
            La Valoración Funcional del Movimiento y Longevidad convierte información sobre tu
            cuerpo en decisiones claras: qué priorizar, cómo empezar y cómo medir tu progreso.
          </p>
          <ul>
            {[
              'Composición corporal con InBody',
              'Fuerza, equilibrio y movilidad',
              'Capacidad funcional y resistencia',
              'Semáforo funcional y plan personalizado',
            ].map((item) => (
              <li key={item}>
                <Check size={18} />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/servicios/valoracion-funcional-longevidad" className="button button-primary">
            Conoce la valoración <ArrowRight size={18} />
          </Link>
          <p className="pending-price">Tarifa en proceso de confirmación.</p>
        </div>
        <div className="assessment-visual">
          <Image
            className="assessment-photo"
            src="/brand/woman-movement.png"
            alt="Mujer adulta entrenando movilidad y equilibrio"
            fill
            sizes="(max-width: 1050px) 100vw, 50vw"
          />
          <div className="assessment-panel">
            <div className="scan-orbit">
              <Activity />
            </div>
            <div>
              <small>PERFIL FUNCIONAL</small>
              <strong>Tu línea base</strong>
              <p>Datos que tu equipo interpreta y convierte en un plan humano.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="intelligence section">
        <div className="intelligence-title">
          <SectionLabel>TECNOLOGÍA CON PROPÓSITO</SectionLabel>
          <h2>
            Más precisión.
            <br />
            <em>Más humanidad.</em>
          </h2>
        </div>
        <div className="intelligence-grid">
          <article>
            <BrainCircuit />
            <h3>IA que ayuda a adaptar</h3>
            <p>
              Organiza señales de tu proceso para que el equipo pueda ajustar tu ruta con mejor
              información.
            </p>
          </article>
          <article>
            <Activity />
            <h3>Progreso que puedes ver</h3>
            <p>
              Metas medibles y seguimiento claro para entender qué mejora y qué necesita atención.
            </p>
          </article>
          <article>
            <Users />
            <h3>Profesionales que deciden contigo</h3>
            <p>
              La tecnología apoya. La escucha, el criterio y las decisiones siguen siendo humanas.
            </p>
          </article>
        </div>
      </section>

      <section className="services section" id="servicios">
        <div className="services-head">
          <div>
            <SectionLabel>LAS HERRAMIENTAS DEL CAMINO</SectionLabel>
            <h2>
              Un solo equipo.
              <br />
              Todo conectado.
            </h2>
          </div>
          <p>
            No te enviamos de un servicio a otro sin contexto. Combinamos lo clínico y lo físico
            alrededor de tu objetivo.
          </p>
        </div>
        <div className="service-list">
          {services.map(([title, body, href], index) => (
            <Link href={href} className="service-row" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
      </section>

      <section className="class-videos section" aria-labelledby="class-videos-title">
        <div className="class-videos-heading">
          <div>
            <SectionLabel>ASÍ SE VIVEN LAS CLASES</SectionLabel>
            <h2 id="class-videos-title">
              Movimiento real.
              <br />
              <em>A tu ritmo.</em>
            </h2>
          </div>
          <p>
            Conoce el ambiente, el acompañamiento y la forma en que adaptamos cada ejercicio a la
            persona.
          </p>
        </div>
        <div className="class-video-rail">
          <figure className="class-video">
            <video
              src="/videos/entrenamiento-funcional-grupal.mp4"
              aria-label="Clase grupal de entrenamiento funcional"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls
            />
            <figcaption>
              <span>01</span>
              <strong>Entrenamiento funcional grupal</strong>
            </figcaption>
          </figure>
          <figure className="class-video">
            <video
              src="/videos/reformer-adulta-mayor.mp4"
              aria-label="Sesión de Pilates reformer para una adulta mayor"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls
            />
            <figcaption>
              <span>02</span>
              <strong>Reformer adaptado</strong>
            </figcaption>
          </figure>
          <figure className="class-video">
            <video
              src="/videos/pilates-adulta.mp4"
              aria-label="Sesión de Pilates para una mujer adulta"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls
            />
            <figcaption>
              <span>03</span>
              <strong>Pilates con acompañamiento</strong>
            </figcaption>
          </figure>
          <figure className="class-video">
            <video
              src="/videos/movilidad-precision-bola.mp4"
              aria-label="Ejercicio de movilidad y precisión con una bola"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls
            />
            <figcaption>
              <span>04</span>
              <strong>Movilidad y precisión</strong>
            </figcaption>
          </figure>
        </div>
        <p className="class-video-hint">Desliza para conocer las clases</p>
      </section>

      <section className="booking booking-invite section" id="agendamiento">
        <div className="booking-intro">
          <SectionLabel>RESERVA SIN COMPLICACIONES</SectionLabel>
          <h2>
            Elige tu primer paso.
            <br />
            <em>Nosotros confirmamos contigo.</em>
          </h2>
          <p>Una reserva clara, sin pago anticipado y con una persona del equipo al otro lado.</p>
          <div className="booking-assurances">
            <span>
              <Check size={18} /> Menos de 2 minutos
            </span>
            <span>
              <Check size={18} /> Sin cobro en línea
            </span>
            <span>
              <Check size={18} /> Confirmación humana
            </span>
          </div>
          <Link href={contact} className="button button-primary">
            Comenzar mi reserva <ArrowRight size={19} />
          </Link>
        </div>
        <div className="booking-preview" aria-hidden="true">
          <span className="preview-label">RESERVA FISIOFES</span>
          <div className="preview-progress">
            <i />
            <i />
            <i />
            <i />
          </div>
          <h3>¿Qué te gustaría trabajar?</h3>
          <div className="preview-option active">
            <Activity size={20} />
            <span>
              <strong>Fisioterapia</strong>
              <small>Dolor, lesión o recuperación</small>
            </span>
            <Check size={18} />
          </div>
          <div className="preview-option">
            <HeartHandshake size={20} />
            <span>
              <strong>Pilates</strong>
              <small>Movilidad, control y fuerza</small>
            </span>
          </div>
          <button>
            Continuar <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="community section" id="comunidad">
        <div className="community-copy">
          <SectionLabel>COMUNIDAD FISIOFES</SectionLabel>
          <h2>
            El progreso también se construye <em>acompañado.</em>
          </h2>
          <p>
            Un lugar donde reconoces a las personas, celebras pequeños avances y construyes una
            identidad alrededor de cuidarte. No vienes solo a cumplir una cita: vienes a seguir
            viviendo mejor.
          </p>
          <Link href={contact} className="text-link">
            Conoce al equipo al reservar <ArrowRight />
          </Link>
        </div>
        <div className="community-quote">
          <span>“</span>
          <p>
            Entrenamos para vivir mejor,
            <br />
            no solo para hacer ejercicio.
          </p>
          <small>FISIOFES LONGEVITY CLUB</small>
        </div>
      </section>

      <section className="brand-story section" aria-label="Movimiento y conexión en Fisiofes">
        <div className="brand-story-copy">
          <SectionLabel>MOVIMIENTO QUE SE SIENTE</SectionLabel>
          <h2>
            Fuerza. Equilibrio.
            <br />
            <em>Conexión.</em>
          </h2>
          <p>
            Entrenamos capacidades que se traducen en libertad: levantarte, caminar, alcanzar,
            compartir y seguir haciendo lo que te gusta.
          </p>
        </div>
        <figure className="brand-photo brand-photo-man">
          <Image
            src="/brand/man-movement.png"
            alt="Hombre adulto practicando equilibrio"
            fill
            sizes="(max-width: 820px) 100vw, 34vw"
          />
        </figure>
        <figure className="brand-photo brand-photo-connection">
          <Image
            src="/brand/connection-support.png"
            alt="Dos personas apoyándose después de entrenar"
            fill
            sizes="(max-width: 820px) 100vw, 38vw"
          />
        </figure>
      </section>

      <section className="locations section" id="sedes">
        <div className="locations-heading">
          <div>
            <SectionLabel>DOS SEDES, UN MISMO ACOMPAÑAMIENTO</SectionLabel>
            <h2>
              Encuentra tu
              <br />
              <em>Fisiofes.</em>
            </h2>
          </div>
          <div>
            <p>
              Elige la sede que te quede más cómoda. Puedes abrir la ruta directamente en Google
              Maps o reservar y dejar que el equipo te oriente.
            </p>
            <Link href={contact} className="button button-primary">
              <MessageCircle size={19} /> Reservar ahora
            </Link>
          </div>
        </div>
        <div className="location-grid">
          <article className="location-card">
            <iframe
              title="Mapa de Fisiofes Calarcá"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-75.6477%2C4.5253%2C-75.6357%2C4.5333&layer=mapnik&marker=4.5293156%2C-75.6416813"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="location-content">
              <span className="location-index">01</span>
              <div>
                <h3>Fisiofes Calarcá</h3>
                <p>
                  <MapPin size={18} /> Calle 37 #25-52
                  <br />
                  Calarcá, Quindío
                </p>
                <a
                  href="https://maps.app.goo.gl/wkGyE7z6ZbSjobjW9"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Cómo llegar <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
          </article>
          <article className="location-card">
            <iframe
              title="Mapa de Fisiofes en Senior's Mall"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-75.7599%2C4.4654%2C-75.7479%2C4.4734&layer=mapnik&marker=4.4693772%2C-75.7539473"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="location-content">
              <span className="location-index">02</span>
              <div>
                <h3>Fisiofes Senior&apos;s Mall</h3>
                <p>
                  <MapPin size={18} /> Vía La Tebaida–El Caimo, km 1<br />
                  Armenia, Quindío
                </p>
                <a
                  href="https://maps.app.goo.gl/6kVR97miXnL9eN7y7"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Cómo llegar <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
          </article>
        </div>
        <div className="locations-hours">
          <strong>Horario de clases</strong>
          <span>
            Lunes a viernes: 6:00 a.m.–12:00 m. y 4:00–7:00 p.m. · Sábados: 8:00 a.m.–12:00 m.
          </span>
        </div>
      </section>
      <footer>
        <div className="footer-top">
          <Link href="/" className="brand-lockup footer-logo">
            <img src="/fisiofes-logo.svg" alt="Fisiofes" />
          </Link>
          <p>
            Tu objetivo. Tu ruta.
            <br />
            Humanidad en cada paso.
          </p>
          <Link href="https://instagram.com/fisiofes" className="text-link">
            @fisiofes <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Fisiofes Physio, Pilates & Training</span>
          <div>
            <Link href="/servicios">Servicios</Link>
            <Link href="/precios">Planes</Link>
            <Link href="/contacto">Reserva</Link>
            <Link href="#sedes">Sede y horarios</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
