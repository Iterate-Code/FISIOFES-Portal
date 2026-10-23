'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AccessCodePanel } from '@/components/admin/access-code-panel'
import { BookingsPanel } from '@/components/admin/bookings-panel'
import { PrescreeningsPanel } from '@/components/admin/prescreenings-panel'
import { RequestsPanel } from '@/components/admin/requests-panel'

type Client = {
  id: number
  name: string
  phone: string
  planService: string
  creditsRemaining: number
  planExpiresAt: string
}

type Tab = 'reservas' | 'solicitudes' | 'prevaloraciones' | 'clientes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'reservas', label: 'Reservas de clases' },
  { id: 'solicitudes', label: 'Solicitudes de cita' },
  { id: 'prevaloraciones', label: 'Pre-valoraciones' },
  { id: 'clientes', label: 'Clientes y créditos' },
]

export function AdminDashboard({ userName }: { userName: string }) {
  const [tab, setTab] = useState<Tab>('reservas')
  const [clients, setClients] = useState<Client[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function refresh() {
    const response = await fetch('/api/admin/clients')
    if (response.ok) setClients((await response.json()).clients)
  }
  useEffect(() => {
    void refresh()
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const response = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    setMessage(response.ok ? `Plan activado para ${result.client.name}.` : result.error)
    if (response.ok) {
      event.currentTarget.reset()
      await refresh()
    }
    setLoading(false)
  }

  return (
    <main id="contenido" className="reservation-page">
      <header className="member-header">
        <a className="brand-lockup" href="/">
          <img src="/fisiofes-logo.svg" alt="Fisiofes" />
        </a>
        <span>Operación · {userName}</span>
      </header>
      <section className="section">
        <p className="eyebrow">ADMINISTRACIÓN</p>
        <h1>Operación Fisiofes</h1>
        <div className="admin-tabs" role="tablist" aria-label="Secciones">
          {TABS.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              key={item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'reservas' && <BookingsPanel />}
        {tab === 'solicitudes' && <RequestsPanel />}
        {tab === 'prevaloraciones' && <PrescreeningsPanel />}
        {tab === 'clientes' && (
          <>
            <AccessCodePanel />
            <h2>Clientes y créditos</h2>
            <p>
              El cliente ingresa con un código por WhatsApp, sin PIN. Aquí activas o renuevas su
              plan.
            </p>
            <form className="login-card" onSubmit={save}>
              <div className="field-grid">
                <label className="field">
                  <span>Nombre</span>
                  <input name="name" required />
                </label>
                <label className="field">
                  <span>WhatsApp</span>
                  <input name="phone" required />
                </label>
                <label className="field">
                  <span>Correo (opcional)</span>
                  <input name="email" type="email" />
                </label>
                <label className="field">
                  <span>Plan</span>
                  <select name="planService" defaultValue="pilates">
                    <option value="pilates">Pilates</option>
                    <option value="training">Training</option>
                    <option value="dual">Dual</option>
                  </select>
                </label>
                <label className="field">
                  <span>Créditos</span>
                  <input name="credits" type="number" min="0" required />
                </label>
                <label className="field">
                  <span>Vence</span>
                  <input name="expiresAt" type="date" required />
                </label>
              </div>
              <button className="button button-primary" disabled={loading}>
                {loading ? 'Guardando…' : 'Activar plan'}
              </button>
              {message && <p>{message}</p>}
            </form>
            <div className="login-card">
              <h2>Clientes recientes</h2>
              <div className="portal-list">
                {clients.map((client) => (
                  <span key={client.id}>
                    <small>{client.planService}</small>
                    <strong>
                      {client.name} · {client.phone} · {client.creditsRemaining} créditos · vence{' '}
                      {client.planExpiresAt}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
