'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, MessageCircle, ShieldCheck } from 'lucide-react'

const services = [
  { id: 'orientacion', name: 'No sé cuál elegir', detail: 'Te ayudamos a encontrar el mejor primer paso.' },
  { id: 'fisioterapia', name: 'Fisioterapia', detail: 'Dolor, lesión, recuperación o postoperatorio.' },
  { id: 'pilates', name: 'Pilates', detail: 'Movilidad, control y fuerza con acompañamiento.' },
  { id: 'training', name: 'Entrenamiento funcional', detail: 'Fuerza y capacidad para la vida diaria.' },
]

const times = ['6:00 a.m.', '8:00 a.m.', '10:00 a.m.', '4:00 p.m.', '6:00 p.m.']

export function BookingExperience({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(1)
  const [service, setService] = useState('')
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [goal, setGoal] = useState('')
  const [error, setError] = useState('')
  const selected = services.find(item => item.id === service)
  const message = useMemo(() => encodeURIComponent(`Hola Fisiofes. Soy ${name}. Quiero solicitar ${selected?.name ?? 'orientación'} para ${day || 'una fecha por definir'} a las ${time || 'hora por definir'}. Mi objetivo es: ${goal || 'prefiero contarlo al equipo'}. Mi teléfono es ${phone}.`), [name, selected, day, time, goal, phone])

  function advance() {
    if (step === 1 && !service) return setError('Elige una opción para continuar.')
    if (step === 2 && (!day || !time)) return setError('Selecciona una fecha y una hora preferida.')
    if (step === 3 && (!name.trim() || !phone.trim())) return setError('Completa tu nombre y teléfono para continuar.')
    setError('')
    setStep(value => Math.min(4, value + 1))
  }

  return <div className={`booking-experience ${compact ? 'booking-compact' : ''}`}>
    <div className="booking-progress" aria-label={`Paso ${step} de 4`}><span style={{ width: `${step * 25}%` }} /></div>
    <div className="booking-meta"><span>PASO {step} DE 4</span><span>{step === 4 ? 'SOLICITUD LISTA' : 'TOMA MENOS DE 2 MINUTOS'}</span></div>

    {step === 1 && <div className="booking-step"><p className="eyebrow">EMPECEMOS POR TI</p><h2>¿Qué te gustaría trabajar?</h2><p className="step-lede">No tienes que saber el nombre exacto del servicio.</p><div className="booking-options">{services.map(item => <button type="button" className={service === item.id ? 'booking-option selected' : 'booking-option'} onClick={() => { setService(item.id); setError('') }} key={item.id}><span><strong>{item.name}</strong><small>{item.detail}</small></span>{service === item.id && <Check size={20} />}</button>)}</div></div>}

    {step === 2 && <div className="booking-step"><p className="eyebrow">TU MOMENTO PREFERIDO</p><h2>¿Cuándo te queda mejor?</h2><label className="field"><span>Fecha preferida</span><div className="input-shell"><CalendarDays size={20} /><input type="date" value={day} onChange={event => setDay(event.target.value)} /></div></label><fieldset><legend>Hora preferida</legend><div className="time-options">{times.map(item => <button type="button" onClick={() => setTime(item)} className={time === item ? 'selected' : ''} key={item}><Clock size={17} />{item}</button>)}</div></fieldset><p className="helper">Este horario es una preferencia. El equipo confirmará la disponibilidad contigo.</p></div>}

    {step === 3 && <div className="booking-step"><p className="eyebrow">PARA ACOMPAÑARTE</p><h2>¿Cómo podemos contactarte?</h2><div className="field-grid"><label className="field"><span>Nombre completo</span><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Tu nombre" /></label><label className="field"><span>Teléfono o WhatsApp</span><input autoComplete="tel" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="Tu número" /></label></div><label className="field"><span>¿Qué quieres volver a hacer o mejorar?</span><textarea value={goal} onChange={event => setGoal(event.target.value)} placeholder="Por ejemplo: caminar con más confianza, aliviar el dolor de rodilla…" rows={4} /></label><p className="privacy-line"><ShieldCheck size={18} /> Solo usamos estos datos para orientarte y confirmar tu solicitud.</p></div>}

    {step === 4 && <div className="booking-step booking-success"><span className="success-mark"><Check size={30} /></span><p className="eyebrow">TODO LISTO</p><h2>Ahora confírmalo con nuestro equipo.</h2><p>Prepararemos el mensaje con tu solicitud. Una persona de Fisiofes revisará disponibilidad y te responderá por WhatsApp.</p><div className="booking-summary"><span><small>Servicio</small><strong>{selected?.name}</strong></span><span><small>Preferencia</small><strong>{day} · {time}</strong></span></div><a className="button button-primary" href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer"><MessageCircle size={20} /> Confirmar por WhatsApp</a></div>}

    {error && <p className="form-error" role="alert">{error}</p>}
    {step < 4 && <div className="booking-controls">{step > 1 ? <button type="button" className="button button-ghost" onClick={() => { setStep(value => value - 1); setError('') }}><ArrowLeft size={18} /> Atrás</button> : <span />}<button type="button" className="button button-primary" onClick={advance}>Continuar <ArrowRight size={18} /></button></div>}
  </div>
}
