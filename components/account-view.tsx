'use client'

import { useEffect, useState } from 'react'
import Link from '@/components/native-link'
import { ArrowRight, CalendarDays } from 'lucide-react'

type Account = {
  client: {
    name: string
    phone: string
    planService: 'pilates' | 'training' | 'dual'
    creditsRemaining: number
    planExpiresAt: string
  }
  upcoming: { id: string; service: 'pilates' | 'training'; date: string; time: string }[]
}

const SERVICE_LABEL = { pilates: 'Pilates', training: 'Entrenamiento funcional', dual: 'Dual' }

export function AccountView() {
  const [account, setAccount] = useState<Account | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'anonymous'>('loading')

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

  const { client, upcoming } = account
  const hasPlan = client.creditsRemaining > 0
  return (
    <section className="login-card account-card">
      <p className="eyebrow">MI FISIOFES</p>
      <h1>Hola, {client.name.split(' ')[0]}.</h1>
      <div className="account-block">
        <h2>Mi plan</h2>
        {hasPlan ? (
          <p>
            {SERVICE_LABEL[client.planService]} · {client.creditsRemaining} clases disponibles ·
            vence el {client.planExpiresAt}
          </p>
        ) : (
          <p>Aún no tienes un plan activo. El equipo te ayuda a elegir el mejor para ti.</p>
        )}
      </div>
      <div className="account-block">
        <h2>Mis próximas citas</h2>
        {upcoming.length === 0 ? (
          <p>No tienes citas próximas.</p>
        ) : (
          <ul className="account-list">
            {upcoming.map((item) => (
              <li key={item.id}>
                <CalendarDays size={22} />
                <span>
                  {SERVICE_LABEL[item.service]} · {item.date} · {item.time}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href="/contacto" className="button button-primary">
        Reservar una clase <ArrowRight size={20} />
      </Link>
      <button type="button" className="text-link login-link-button" onClick={logout}>
        Cerrar sesión
      </button>
    </section>
  )
}
