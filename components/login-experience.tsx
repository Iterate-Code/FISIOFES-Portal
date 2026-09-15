'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Check, LockKeyhole, Users } from 'lucide-react'

export function LoginExperience() {
  const [role, setRole] = useState<'patient' | 'team'>('patient')
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!identifier.trim()) return setError('Escribe tu correo o número de WhatsApp.')
    setError('')
    setSubmitted(true)
  }

  if (submitted) return <section className="login-card login-result"><span className="success-mark"><Check size={28} /></span><p className="eyebrow">VISTA DE DEMOSTRACIÓN</p><h1>Tu espacio está preparado.</h1><p>El siguiente paso técnico es conectar este acceso con la base de pacientes y permisos del equipo. Por seguridad, esta versión pública no consulta historias ni citas reales.</p><div className="login-next"><Link href="/contacto" className="button button-primary"><CalendarDays size={19} /> Reservar una sesión</Link><button type="button" className="button button-ghost" onClick={() => setSubmitted(false)}>Volver</button></div></section>

  return <section className="login-card"><p className="eyebrow">MI FISIOFES</p><h1>Bienvenido de nuevo.</h1><p className="login-lede">Consulta tus citas, plan y progreso desde un solo lugar.</p><div className="role-switch" aria-label="Tipo de acceso"> <button type="button" className={role === 'patient' ? 'selected' : ''} onClick={() => setRole('patient')}><CalendarDays size={20} /><span><strong>Soy paciente</strong><small>Citas y plan</small></span></button><button type="button" className={role === 'team' ? 'selected' : ''} onClick={() => setRole('team')}><Users size={20} /><span><strong>Soy del equipo</strong><small>Agenda y atención</small></span></button></div><form onSubmit={submit}><label className="field"><span>Correo o número de WhatsApp</span><input value={identifier} onChange={event => setIdentifier(event.target.value)} autoComplete="username" placeholder={role === 'patient' ? 'Tu correo o celular' : 'Correo institucional'} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit">Continuar de forma segura <ArrowRight size={18} /></button></form><p className="login-security"><LockKeyhole size={17} /> Cuando se conecte la autenticación, enviaremos un código de acceso. No necesitarás recordar una contraseña.</p><Link href="/contacto" className="text-link">¿Es tu primera vez? Reserva aquí <ArrowRight size={16} /></Link></section>
}
