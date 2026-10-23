'use client'

import { useEffect, useState } from 'react'
import { STAGES, STAGE_LABELS, type Stage } from '@/lib/journey'

type ContentRow = {
  slug: string
  title: string
  channel: string
  touches: number
  people: number
  preValorados: number
  reservaron: number
  asistieron: number
}
type Board = {
  funnel: Record<Stage, number>
  attention: { overdueFollowups: number; pendingFollowups: number; lapsed: number }
  contents: ContentRow[]
}

export function JourneyBoard() {
  const [board, setBoard] = useState<Board | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/journey')
      .then(async (response) => {
        if (!response.ok) throw new Error()
        setBoard((await response.json()) as Board)
      })
      .catch(() => setError('No pudimos cargar el tablero.'))
  }, [])

  if (error) return <p role="alert">{error}</p>
  if (!board) return <p>Cargando tablero…</p>

  const top = Math.max(1, board.funnel.nuevo)
  return (
    <div className="journey-board">
      <div className="login-card">
        <h2>¿Dónde está cada persona?</h2>
        <p>Cuántas personas han llegado a cada paso del recorrido.</p>
        <ul className="funnel">
          {STAGES.map((stage) => (
            <li key={stage}>
              <span className="funnel-label">{STAGE_LABELS[stage]}</span>
              <span
                className="funnel-bar"
                role="img"
                aria-label={`${board.funnel[stage]} personas`}
              >
                <i style={{ width: `${(board.funnel[stage] / top) * 100}%` }} />
              </span>
              <strong>{board.funnel[stage]}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="attention-grid">
        <div
          className={board.attention.overdueFollowups ? 'attention attention-alert' : 'attention'}
        >
          <strong>{board.attention.overdueFollowups}</strong>
          <span>seguimientos vencidos</span>
        </div>
        <div className="attention">
          <strong>{board.attention.pendingFollowups}</strong>
          <span>seguimientos pendientes</span>
        </div>
        <div className={board.attention.lapsed ? 'attention attention-alert' : 'attention'}>
          <strong>{board.attention.lapsed}</strong>
          <span>personas que dejaron de venir (14 días o más)</span>
        </div>
      </div>

      <div className="login-card">
        <h2>¿Qué contenido trae personas?</h2>
        {board.contents.length === 0 ? (
          <p>Aún no hay contenidos. Crea uno en la pestaña Contenidos para obtener su enlace.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contenido</th>
                  <th>Visitas</th>
                  <th>Personas</th>
                  <th>Pre-valoradas</th>
                  <th>Reservaron</th>
                  <th>Asistieron</th>
                </tr>
              </thead>
              <tbody>
                {board.contents.map((row) => (
                  <tr key={row.slug}>
                    <td>
                      <strong>{row.title}</strong>
                      <br />
                      <small>{row.channel}</small>
                    </td>
                    <td>{row.touches}</td>
                    <td>{row.people}</td>
                    <td>{row.preValorados}</td>
                    <td>{row.reservaron}</td>
                    <td>{row.asistieron}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
