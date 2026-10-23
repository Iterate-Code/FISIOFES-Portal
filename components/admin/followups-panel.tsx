'use client'

import { useCallback, useEffect, useState } from 'react'
import { whatsappLink } from '@/lib/admin-labels'
import { FOLLOWUP_LABELS } from '@/lib/journey'

type Row = {
  id: string
  phone: string
  name: string
  kind: string
  dueDate: string
  status: 'pending' | 'done' | 'skipped'
  note: string | null
  overdue: boolean
}

type Filter = 'pending' | 'all'

export function FollowupsPanel() {
  const [rows, setRows] = useState<Row[]>([])
  const [today, setToday] = useState('')
  const [filter, setFilter] = useState<Filter>('pending')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/followups')
    if (!response.ok) return
    const data = (await response.json()) as { followups: Row[]; today: string }
    setRows(data.followups)
    setToday(data.today)
  }, [])

  useEffect(() => {
    fetch('/api/admin/followups')
      .then(async (response) => {
        if (!response.ok) return
        const data = (await response.json()) as { followups: Row[]; today: string }
        setRows(data.followups)
        setToday(data.today)
      })
      .catch(() => setMessage('No pudimos cargar los seguimientos.'))
  }, [])

  async function update(id: string, status: Row['status']) {
    setMessage('')
    const response = await fetch('/api/admin/followups', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!response.ok) setMessage('No pudimos actualizar el seguimiento.')
    await load()
  }

  const visible = rows.filter((row) => filter === 'all' || row.status === 'pending')
  return (
    <div className="login-card">
      <h2>Seguimientos</h2>
      <p>
        Cada vez que marcas asistencia aparece aquí una tarea. Hoy es {today || '…'}. Los vencidos
        salen primero.
      </p>
      <div className="admin-filters" role="group" aria-label="Filtrar seguimientos">
        <button
          type="button"
          aria-pressed={filter === 'pending'}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({rows.filter((row) => row.status === 'pending').length})
        </button>
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          Todos ({rows.length})
        </button>
      </div>
      {message && <p role="alert">{message}</p>}
      {visible.length === 0 && <p>No hay seguimientos para mostrar.</p>}
      <ul className="admin-list">
        {visible.map((row) => (
          <li key={row.id} className="admin-item">
            <div>
              <strong>{row.name}</strong>
              <span className="admin-badge">{FOLLOWUP_LABELS[row.kind] ?? row.kind}</span>
              {row.overdue && <span className="admin-badge admin-badge-alert">Vencido</span>}
              {row.status !== 'pending' && (
                <span className="admin-badge admin-badge-confirmed">
                  {row.status === 'done' ? 'Hecho' : 'Omitido'}
                </span>
              )}
            </div>
            <p>
              Para el {row.dueDate} · {row.phone}
            </p>
            {row.note && <p>{row.note}</p>}
            <div className="admin-actions">
              <a href={whatsappLink(row.phone)} target="_blank" rel="noreferrer">
                Escribir por WhatsApp
              </a>
              {row.status === 'pending' ? (
                <>
                  <button type="button" onClick={() => update(row.id, 'done')}>
                    Hecho
                  </button>
                  <button type="button" onClick={() => update(row.id, 'skipped')}>
                    Omitir
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => update(row.id, 'pending')}>
                  Reabrir
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
