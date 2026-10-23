'use client'

import { useCallback, useEffect, useState } from 'react'
import { RED_FLAG_LABELS, categoryTitle, summarizeAnswers, whatsappLink } from '@/lib/admin-labels'
import { answersSchema, type RedFlag } from '@/lib/prescreening'

type Row = {
  id: string
  name: string
  phone: string
  answers: string
  route: 'llamada' | 'recomendacion'
  redFlags: string
  recommendedSlug: string
  contacted: boolean
  createdAt: string
}

type Filter = 'todo' | 'pendientes'

function parseFlags(raw: string): RedFlag[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? (value as RedFlag[]) : []
  } catch {
    return []
  }
}

function readAnswers(raw: string): string[] {
  try {
    const parsed = answersSchema.safeParse(JSON.parse(raw))
    return parsed.success ? summarizeAnswers(parsed.data) : ['No se pudieron leer las respuestas.']
  } catch {
    return ['No se pudieron leer las respuestas.']
  }
}

export function PrescreeningsPanel() {
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState<Filter>('pendientes')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/prescreening')
    if (response.ok) setRows(((await response.json()) as { prescreenings: Row[] }).prescreenings)
  }, [])

  useEffect(() => {
    fetch('/api/prescreening')
      .then(async (response) => {
        if (response.ok) {
          setRows(((await response.json()) as { prescreenings: Row[] }).prescreenings)
        }
      })
      .catch(() => setMessage('No pudimos cargar las pre-valoraciones.'))
  }, [])

  async function setContacted(id: string, contacted: boolean) {
    setMessage('')
    const response = await fetch('/api/prescreening', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, contacted }),
    })
    if (!response.ok) setMessage('No pudimos actualizar la pre-valoración.')
    await load()
  }

  // People who must be called go first, then the newest.
  const visible = rows
    .filter((row) => filter === 'todo' || !row.contacted)
    .sort(
      (a, b) =>
        Number(b.route === 'llamada') - Number(a.route === 'llamada') ||
        b.createdAt.localeCompare(a.createdAt),
    )

  return (
    <div className="login-card">
      <h2>Pre-valoraciones</h2>
      <div className="admin-filters" role="group" aria-label="Filtrar pre-valoraciones">
        <button
          type="button"
          aria-pressed={filter === 'pendientes'}
          onClick={() => setFilter('pendientes')}
        >
          Por contactar ({rows.filter((row) => !row.contacted).length})
        </button>
        <button type="button" aria-pressed={filter === 'todo'} onClick={() => setFilter('todo')}>
          Todas ({rows.length})
        </button>
      </div>
      {message && <p role="alert">{message}</p>}
      {visible.length === 0 && <p>No hay pre-valoraciones para mostrar.</p>}
      <ul className="admin-list">
        {visible.map((row) => {
          const flags = parseFlags(row.redFlags)
          return (
            <li key={row.id} className="admin-item">
              <div>
                <strong>{row.name}</strong>
                {row.route === 'llamada' && (
                  <span className="admin-badge admin-badge-alert">Llamar antes de agendar</span>
                )}
                {row.contacted && (
                  <span className="admin-badge admin-badge-confirmed">Contactada</span>
                )}
              </div>
              <p>
                {row.phone} · recomendado: {categoryTitle(row.recommendedSlug)}
              </p>
              {flags.length > 0 && (
                <p className="admin-flags">
                  Alertas: {flags.map((flag) => RED_FLAG_LABELS[flag] ?? flag).join(' · ')}
                </p>
              )}
              <ul className="admin-answers">
                {readAnswers(row.answers).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="admin-actions">
                <a href={whatsappLink(row.phone)} target="_blank" rel="noreferrer">
                  Escribir por WhatsApp
                </a>
                <button type="button" onClick={() => setContacted(row.id, !row.contacted)}>
                  {row.contacted ? 'Marcar por contactar' : 'Marcar contactada'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
