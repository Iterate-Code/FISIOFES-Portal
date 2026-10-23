'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BRANCH_LABELS,
  SCHEDULE_LABELS,
  STATUS_LABELS,
  categoryTitle,
  whatsappLink,
} from '@/lib/admin-labels'

type Row = {
  id: string
  serviceSlug: string
  branch: string
  schedule: string
  preferredDate: string | null
  note: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  clientName: string
  clientPhone: string
}

type Filter = 'pending' | 'all'

export function RequestsPanel() {
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/appointment-requests')
    if (response.ok) setRows(((await response.json()) as { requests: Row[] }).requests)
  }, [])

  useEffect(() => {
    fetch('/api/appointment-requests')
      .then(async (response) => {
        if (response.ok) setRows(((await response.json()) as { requests: Row[] }).requests)
      })
      .catch(() => setMessage('No pudimos cargar las solicitudes.'))
  }, [])

  async function setStatus(id: string, status: Row['status']) {
    setMessage('')
    const response = await fetch('/api/appointment-requests', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!response.ok) setMessage('No pudimos actualizar la solicitud.')
    await load()
  }

  const visible = rows.filter((row) => filter === 'all' || row.status === 'pending')
  return (
    <div className="login-card">
      <h2>Solicitudes de cita</h2>
      <div className="admin-filters" role="group" aria-label="Filtrar solicitudes">
        <button
          type="button"
          aria-pressed={filter === 'pending'}
          onClick={() => setFilter('pending')}
        >
          En espera ({rows.filter((row) => row.status === 'pending').length})
        </button>
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          Todas ({rows.length})
        </button>
      </div>
      {message && <p role="alert">{message}</p>}
      {visible.length === 0 && <p>No hay solicitudes para mostrar.</p>}
      <ul className="admin-list">
        {visible.map((row) => (
          <li key={row.id} className="admin-item">
            <div>
              <strong>{categoryTitle(row.serviceSlug)}</strong>
              <span className={`admin-badge admin-badge-${row.status}`}>
                {STATUS_LABELS[row.status]}
              </span>
            </div>
            <p>
              {row.clientName} · {row.clientPhone}
            </p>
            <p>
              {BRANCH_LABELS[row.branch]} · {SCHEDULE_LABELS[row.schedule]}
              {row.preferredDate ? ` · día preferido ${row.preferredDate}` : ''}
            </p>
            {row.note && <p>Nota: {row.note}</p>}
            <div className="admin-actions">
              <a href={whatsappLink(row.clientPhone)} target="_blank" rel="noreferrer">
                Escribir por WhatsApp
              </a>
              {row.status !== 'confirmed' && (
                <button type="button" onClick={() => setStatus(row.id, 'confirmed')}>
                  Marcar confirmada
                </button>
              )}
              {row.status !== 'cancelled' && (
                <button type="button" onClick={() => setStatus(row.id, 'cancelled')}>
                  Cancelar
                </button>
              )}
              {row.status !== 'pending' && (
                <button type="button" onClick={() => setStatus(row.id, 'pending')}>
                  Volver a en espera
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
