import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
const categories = [
  { eyebrow: 'PILATES', title: 'Pilates', description: 'Movimiento guiado, control y fuerza en grupos reducidos.', featured: true, plans: [
    { name: '1 clase', price: '$60.000', unit: '$60.000 / clase', items: ['Sesión guiada', 'Adaptación a tu nivel', 'Grupo reducido'] },
    { name: '4 clases', price: '$220.000', unit: '$55.000 / clase', items: ['Vigencia de 1 mes', 'Seguimiento del proceso', 'Ahorro frente a clase individual'] },
    { name: '8 clases', price: '$380.000', unit: '$47.500 / clase', items: ['Ruta de movimiento', 'Seguimiento del proceso', 'Mayor ahorro por clase'] },
    { name: '12 clases', price: '$450.000', unit: '$37.500 / clase', items: ['Continuidad mensual', 'Seguimiento del proceso', 'Mejor valor por clase'] },
  ] },
  { eyebrow: 'TRAINING', title: 'Entrenamiento funcional', description: 'Construye fuerza, capacidad y confianza para tu vida real.', plans: [
    { name: '1 clase individual', price: '$50.000', unit: '$50.000 / clase', items: ['Sesión personalizada', 'Adaptación a tu nivel', 'Guía profesional'] },
    { name: '4 clases', price: '$160.000', unit: '$40.000 / clase', items: ['Ruta de fuerza', 'Seguimiento del proceso', 'Ahorro por paquete'] },
    { name: '8 clases', price: '$290.000', unit: '$36.250 / clase', items: ['Continuidad de entrenamiento', 'Seguimiento del proceso', 'Mayor ahorro por clase'] },
    { name: '12 clases', price: '$360.000', unit: '$30.000 / clase', items: ['Plan de progresión', 'Seguimiento del proceso', 'Mejor valor por clase'] },
  ] },
  { eyebrow: 'DUAL', title: 'Pilates + Training', description: 'Combina control, movilidad y fuerza en una misma ruta.', plans: [
    { name: '4 clases', price: '$220.000', unit: '$55.000 / clase', items: ['Pilates y Training', 'Ruta combinada', 'Grupo reducido'] },
    { name: '8 clases', price: '$380.000', unit: '$47.500 / clase', items: ['Pilates y Training', 'Mayor continuidad', 'Seguimiento del proceso'] },
    { name: '12 clases', price: '$470.000', unit: '$39.167 / clase', items: ['Pilates y Training', 'Ruta combinada', 'Mejor valor por clase'] },
    { name: '16 clases', price: '$620.000', unit: '$38.750 / clase', items: ['Pilates y Training', 'Continuidad mensual', 'Seguimiento del proceso'] },
  ] },
  { eyebrow: 'EN COMPAÑÍA', title: 'Planes para pareja o grupo', description: 'Comparte una ruta Dual de Pilates y Training.', plans: [
    { name: 'Pareja Dual · 16 clases', price: '$700.000', unit: '$43.750 / clase', items: ['Para 2 personas', 'Pilates y Training', 'Vigencia de 1 mes'] },
    { name: 'Pareja Dual · 24 clases', price: '$860.000', unit: '$35.833 / clase', items: ['Para 2 personas', 'Pilates y Training', 'Vigencia de 1 mes'] },
    { name: 'Grupo Dual · 24 clases', price: '$914.000', unit: '$38.095 / clase', items: ['Para 3 personas', 'Pilates y Training', 'Vigencia de 1 mes'] },
    { name: 'Pareja Dual · 40 clases', price: '$1.400.000', unit: '$35.000 / clase', items: ['Para 2 personas', 'Paquete de mayor volumen', 'Vigencia de 1 mes'] },
  ] },
  { eyebrow: 'FISIOTERAPIA', title: 'Recuperación física', description: 'Sesiones y paquetes para disminuir dolor y recuperar función.', plans: [
    { name: 'Valoración osteomuscular', price: '$60.000', unit: '40 min', items: ['Historia clínica', 'Valoración física', 'Plan de tratamiento'] },
    { name: 'Sesión integral', price: '$80.000', unit: '1 hora', items: ['Medios físicos', 'Terapia manual', 'Movilidad y fortalecimiento'] },
    { name: 'Sesión + punción seca', price: '$90.000', unit: '1 hora', items: ['Sesión integral', 'TMO y punción seca', 'Electropunción según necesidad'] },
    { name: '5 sesiones', price: '$400.000', unit: '$80.000 / sesión', items: ['Paquete de recuperación', 'Ahorro por volumen', 'Ruta según valoración'] },
    { name: '10 sesiones', price: '$650.000', unit: '$65.000 / sesión', items: ['Paquete de recuperación', 'Ahorro por volumen', 'Ruta según valoración'] },
    { name: '12 sesiones', price: '$770.000', unit: '$64.167 / sesión', items: ['Paquete de recuperación', 'Ahorro por volumen', 'Ruta según valoración'] },
    { name: '15 sesiones', price: '$930.000', unit: '$62.000 / sesión', items: ['Paquete de recuperación', 'Ahorro por volumen', 'Ruta según valoración'] },
    { name: '20 sesiones', price: '$1.200.000', unit: '$60.000 / sesión', items: ['Paquete de recuperación', 'Mayor ahorro por volumen', 'Ruta según valoración'] },
    { name: '30 sesiones', price: '$1.750.000', unit: '$58.333 / sesión', items: ['Paquete de recuperación', 'Mejor valor por sesión', 'Ruta según valoración'] },
  ] },
  { eyebrow: 'BIENESTAR', title: 'Terapias especializadas', description: 'Recuperación, descarga y relajación para sentirte mejor.', plans: [
    { name: 'Descarga muscular', price: '$85.000', unit: '1 hora', items: ['Masaje deportivo', 'Liberación miofascial y cupping', 'Estiramiento'] },
    { name: 'Terapia descontracturante', price: '$80.000', unit: 'Sesión', items: ['Masaje terapéutico', 'Liberación manual', 'Estiramiento'] },
    { name: 'Terapia de relajación', price: '$130.000', unit: 'Sesión', items: ['Cuerpo completo', 'Musicoterapia y aromaterapia', 'Masaje suave'] },
    { name: 'Corredores y ciclistas', price: '$90.000', unit: 'Sesión', items: ['Miembros inferiores', 'Botas de compresión', 'Masaje deportivo y estiramiento'] },
  ] },
  { eyebrow: 'PROCEDIMIENTOS', title: 'Medicina especializada', description: 'Procedimientos con valoración previa y consentimiento informado.', plans: [
    { name: 'Sueroterapia', price: '$170.000', unit: '1 sesión', items: ['Sueros multivitamínicos', 'Valoración previa', 'Consentimiento informado'] },
    { name: 'Sueroterapia', price: '$900.000', unit: '6 sesiones · $150.000 / sesión', items: ['Ahorro por volumen', 'Valoración previa', 'Consentimiento informado'] },
    { name: 'PRP', price: '$250.000', unit: '1 sesión', items: ['Extracción de sangre propia', 'Centrifugado', 'Aplicación en zona a tratar'] },
    { name: 'PRP', price: '$900.000', unit: '4 sesiones · $225.000 / sesión', items: ['Ahorro por volumen', 'Extracción y centrifugado', 'Aplicación en zona a tratar'] },
  ] },
]
export default function PreciosPage(){return <main><header className="member-header"><Link href="/" className="brand-lockup"><img src="/fisiofes-logo.svg" alt="FisioFES" /></Link><Link href="/contacto" className="button button-dark">Reservar ahora</Link></header><section className="inner-hero"><div><p className="eyebrow">PLANES Y PRECIOS</p><h1>Claridad para <em>elegir.</em></h1><p>Valores en pesos colombianos. Todos los planes de clases tienen vigencia de un mes calendario desde la primera clase tomada.</p></div><div className="service-summary"><span className="summary-label">PRIMERA VEZ</span><strong>$40.000</strong><span>Primera clase de Pilates · oferta de entrada</span><span>Reserva sin pago anticipado. Confirmamos el cupo contigo.</span></div></section>{categories.map(category => <section className="pricing-category section" key={category.title}><div className="pricing-category-heading"><div><p className="eyebrow">{category.eyebrow}</p><h2>{category.title}</h2><p>{category.description}</p></div>{category.featured && <span className="pricing-recommended">PRIMERA CLASE $40.000</span>}</div><div className="pricing-grid">{category.plans.map(plan => <article className="pricing-card" key={`${category.title}-${plan.name}-${plan.price}`}><p className="eyebrow">{category.eyebrow}</p><h3>{plan.name}</h3><strong className="price">{plan.price}</strong><p className="pricing-unit">{plan.unit}</p><ul>{plan.items.map(item => <li key={item}><Check size={17}/>{item}</li>)}</ul><Link href="/contacto" className="button button-primary">Elegir este plan <ArrowRight size={17}/></Link></article>)}</div></section>)}<section className="pricing-note"><p><strong>Transparencia:</strong> No publicamos cifras sin validar. Los paquetes de 13–15 clases de Pilates, 16–17 de Training, la valoración con ecografía, Tensamax y la valoración funcional de longevidad siguen pendientes de confirmación. Las tarifas mostradas deben recibir aprobación final del equipo antes de salir a producción.</p><Link href="/contacto" className="text-link">Hablar con el equipo <ArrowRight size={17}/></Link></section></main>}
