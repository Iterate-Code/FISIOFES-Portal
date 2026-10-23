'use client'

import { useCallback, useEffect, useState } from 'react'
import { STATUS_LABELS } from '@/lib/admin-labels'

type Row = {
  id: string
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  calendarSync: 'none' | 'ok' | 'failed'
  clientName: string
  clientPhone: string
  service: 'pilates' | 'training'
  date: string
  time: string
}
type Calendar = { connected: boolean; mock: boolean; readCalendars: number; writes: boolean }

const SERVICE = { pilates: 'Pilates', training: 'Entrenamiento' }
const SYNC = { none: 'Sin calendario', ok: 'En calendario', failed: 'Falló el calendario' }
const STATUS: Record<Row['status'], string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  attended: 'Asistió',
  no_show: 'No asistió',
}

export function BookingsPanel() {
  const [rows, setRows] = useState<Row[]>([])
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/bookings')
    if (!response.ok) return
    const data = (await response.json()) as { bookings: Row[]; calendar: Calendar }
    setRows(data.bookings)
    setCalendar(data.calendar)
  }, [])

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then(async (response) => {
        if (!response.ok) return
        const data = (await response.json()) as { bookings: Row[]; calendar: Calendar }
        setRows(data.bookings)
        setCalendar(data.calendar)
      })
      .catch(() => setMessage('No pudimos cargar las reservas.'))
  }, [])

  async function retry(id: string) {
    setMessage('')
    const response = await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const result = (await response.json()) as { error?: string }
    setMessage(response.ok ? 'Reserva escrita en el calendario.' : (result.error ?? 'Error.'))
    await load()
  }

  return (
    <div className="login-card">
      <h2>Reservas de clases</h2>
      <p>
        {calendar?.connected
          ? `Google Calendar conectado${calendar.mock ? ' (modo demostración)' : ''}: se leen ${calendar.readCalendars} calendario(s) para los cupos y ${calendar.writes ? 'cada reserva se escribe en el calendario de escritura' : 'no se escribe ninguna reserva (falta el calendario de escritura)'}.`
          : 'Google Calendar no está conectado: los cupos salen solo de las reservas del portal.'}
      </p>
      {message && <p role="status">{message}</p>}
      {rows.length === 0 && <p>No hay reservas próximas.</p>}
      <ul className="admin-list">
        {rows.map((row) => (
          <li key={row.id} className="admin-item">
            <div>
              <strong>
                {SERVICE[row.service]} · {row.date} · {row.time}
              </strong>
              <span
                className={`admin-badge admin-badge-${row.status === 'confirmed' ? 'confirmed' : 'cancelled'}`}
              >
                {STATUS[row.status] ?? STATUS_LABELS[row.status]}
              </span>
              {row.calendarSync === 'failed' && (
                <span className="admin-badge admin-badge-alert">{SYNC.failed}</span>
              )}
            </div>
            <p>
              {row.clientName} · {row.clientPhone} · {SYNC[row.calendarSync]}
            </p>
            {row.status === 'confirmed' && row.calendarSync !== 'ok' && calendar?.writes && (
              <div className="admin-actions">
                <button type="button" onClick={() => retry(row.id)}>
                  Escribir en el calendario
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
