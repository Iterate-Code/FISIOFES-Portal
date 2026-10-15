'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Check, Clock, ShieldCheck } from 'lucide-react'

type Service = 'pilates' | 'training'
type Slot = { id: string; date: string; time: string; service: Service; capacity: number; spotsRemaining: number; available: boolean; instructor: string | null }

export function BookingExperience({ compact = false }: { compact?: boolean }) {
  const [service, setService] = useState<Service>('pilates')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'done'>('idle')
  const [message, setMessage] = useState('')
  const [booking, setBooking] = useState<{ id: string; cancellationToken: string } | null>(null)

  useEffect(() => {
    if (!date) { setSlots([]); return }
    setStatus('loading'); setTime(''); setMessage('')
    fetch(`/api/availability?date=${encodeURIComponent(date)}&service=${service}`)
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setSlots(result.slots); setStatus('idle') })
      .catch(error => { setMessage(error.message); setStatus('idle') })
  }, [date, service])

  async function reserve() {
    if (!name.trim() || !phone.trim() || !pin || !date || !time) return setMessage('Completa tus datos y elige una clase disponible.')
    setStatus('saving'); setMessage('')
    const response = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, phone, pin, service, date, time }) })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error); setStatus('idle'); return }
    setBooking(result.booking); setMessage(`Reserva confirmada. Te quedan ${result.creditsRemaining} créditos.`); setStatus('done')
  }

  if (status === 'done' && booking) return <div className={`booking-experience ${compact ? 'booking-compact' : ''}`}><div className="booking-step booking-success"><span className="success-mark"><Check size={30} /></span><p className="eyebrow">RESERVA CONFIRMADA</p><h2>Tu cupo está listo.</h2><p>{service === 'pilates' ? 'Pilates' : 'Entrenamiento funcional'} · {date} · {time}</p><p>{message}</p><button className="button button-ghost" onClick={() => { setStatus('idle'); setTime(''); setBooking(null); setMessage('') }}>Reservar otra clase</button><a className="text-link" href={`/cancelar?token=${booking.cancellationToken}`}>Cancelar esta reserva</a></div></div>

  const minDate = new Date().toISOString().slice(0, 10)
  return <div className={`booking-experience ${compact ? 'booking-compact' : ''}`}><div className="booking-step"><p className="eyebrow">AGENDA EN TIEMPO REAL</p><h2>Reserva tu próxima clase</h2><div className="booking-options"><button type="button" className={service === 'pilates' ? 'booking-option selected' : 'booking-option'} onClick={() => setService('pilates')}><span><strong>Pilates</strong><small>Hasta 5 personas por clase.</small></span></button><button type="button" className={service === 'training' ? 'booking-option selected' : 'booking-option'} onClick={() => setService('training')}><span><strong>Entrenamiento funcional</strong><small>Hasta 4 personas por clase.</small></span></button></div><label className="field"><span>Fecha</span><div className="input-shell"><CalendarDays size={20} /><input type="date" min={minDate} value={date} onChange={event => setDate(event.target.value)} /></div></label>{status === 'loading' && <p>Consultando cupos…</p>}{date && status !== 'loading' && !slots.length && <p>No hay clases disponibles este día.</p>}<div className="time-options">{slots.map(slot => <button type="button" disabled={!slot.available} onClick={() => setTime(slot.time)} className={time === slot.time ? 'selected' : ''} key={slot.id}><Clock size={17} />{slot.time} · {slot.available ? `${slot.spotsRemaining} cupos` : 'Lleno'}</button>)}</div><div className="field-grid"><label className="field"><span>Nombre completo</span><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label><label className="field"><span>WhatsApp</span><input autoComplete="tel" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label><label className="field"><span>PIN de Fisiofes</span><input type="password" inputMode="numeric" pattern="[0-9]{4,8}" value={pin} onChange={event => setPin(event.target.value)} /></label></div><p className="privacy-line"><ShieldCheck size={18} /> Solo se confirma si tienes un crédito activo. Nunca se descuenta más de uno.</p><button type="button" className="button button-primary" onClick={reserve} disabled={status === 'saving'}>{status === 'saving' ? 'Confirmando…' : 'Confirmar reserva'}</button>{message && <p className="form-error" role="alert">{message}</p>}</div></div>
}
