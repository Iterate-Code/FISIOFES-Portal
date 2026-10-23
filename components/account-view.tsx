'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from '@/components/native-link'
import { ArrowRight, CalendarDays, Clock } from 'lucide-react'
import { CATALOG } from '@/lib/catalog'

type Account = {
  client: {
    name: string
    phone: string
    planService: 'pilates' | 'training' | 'dual'
    creditsRemaining: number
    planExpiresAt: string
  }
  upcoming: {
    id: string
    service: 'pilates' | 'training'
    date: string
    time: string
    cancellationToken: string
  }[]
  requests: { id: string; serviceSlug: string; branch: string; preferredDate: string | null }[]
}

const SERVICE_LABEL = { pilates: 'Pilates', training: 'Entrenamiento funcional', dual: 'Dual' }
const BRANCH_LABEL: Record<string, string> = {
  calarca: 'Calarcá',
  'senior-mall': 'Senior’s Mall',
  'sin-preferencia': 'Sede por definir',
}

export function AccountView() {
  const [account, setAccount] = useState<Account | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'anonymous'>('loading')
  const [message, setMessage] = useState('')

  const load = useCallback(() => {
    return fetch('/api/auth/me')
      .then(async (response) => {
        if (response.status === 401) return setState('anonymous')
        setAccount((await response.json()) as Account)
        setState('ready')
      })
      .catch(() => setState('anonymous'))
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (response) => {
        if (response.status === 401) return setState('anonymous')
        setAccount((await response.json()) as Account)
        setState('ready')
      })
      .catch(() => setState('anonymous'))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.assign('/')
  }

  async function cancel(token: string, label: string) {
    if (!window.confirm(`¿Quieres cancelar tu clase de ${label}?`)) return
    const response = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const result = (await response.json()) as { error?: string; creditRefunded?: boolean }
    setMessage(
      response.ok
        ? result.creditRefunded
          ? 'Clase cancelada. Tu crédito fue devuelto.'
          : 'Clase cancelada. Faltaban menos de 2 horas, por eso el crédito no se devuelve.'
        : (result.error ?? 'No pudimos cancelar la clase.'),
    )
    await load()
  }

  if (state === 'loading') return <section className="login-card">Cargando tu espacio…</section>
  if (state === 'anonymous' || !account) {
    return (
      <section className="login-card">
        <p className="eyebrow">MI FISIOFES</p>
        <h1>Inicia sesión para continuar.</h1>
        <Link href="/ingresar" className="button button-primary">
          Ingresar <ArrowRight size={20} />
        </Link>
      </section>
    )
  }

  const { client, upcoming, requests } = account
  const hasPlan = client.creditsRemaining > 0
  return (
    <section className="login-card account-card">
      <p className="eyebrow">MI FISIOFES</p>
      <h1>Hola, {client.name.split(' ')[0]}.</h1>
      {message && (
        <p className="form-error" role="status">
          {message}
        </p>
      )}
      <div className="account-block">
        <h2>Mi plan</h2>
        {hasPlan ? (
          <p>
            {SERVICE_LABEL[client.planService]} · {client.creditsRemaining}{' '}
            {client.creditsRemaining === 1 ? 'clase disponible' : 'clases disponibles'} · vence el{' '}
            {client.planExpiresAt}
          </p>
        ) : (
          <p>Aún no tienes un plan activo. El equipo te ayuda a elegir el mejor para ti.</p>
        )}
      </div>
      <div className="account-block">
        <h2>Mis próximas clases</h2>
        {upcoming.length === 0 ? (
          <p>No tienes clases reservadas.</p>
        ) : (
          <ul className="account-list">
            {upcoming.map((item) => (
              <li key={item.id}>
                <CalendarDays size={22} />
                <span>
                  {SERVICE_LABEL[item.service]} · {item.date} · {item.time}
                </span>
                <button
                  type="button"
                  className="text-link login-link-button"
                  onClick={() => cancel(item.cancellationToken, SERVICE_LABEL[item.service])}
                >
                  Cancelar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {requests.length > 0 && (
        <div className="account-block">
          <h2>Solicitudes en espera</h2>
          <ul className="account-list">
            {requests.map((item) => (
              <li key={item.id}>
                <Clock size={22} />
                <span>
                  {CATALOG.find((category) => category.slug === item.serviceSlug)?.title ??
                    item.serviceSlug}{' '}
                  · {BRANCH_LABEL[item.branch]}
                  {item.preferredDate ? ` · ${item.preferredDate}` : ''}. Te confirmamos por
                  WhatsApp.
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link href="/contacto" className="button button-primary">
        Reservar o pedir una cita <ArrowRight size={20} />
      </Link>
      <button type="button" className="text-link login-link-button" onClick={logout}>
        Cerrar sesión
      </button>
    </section>
  )
}
