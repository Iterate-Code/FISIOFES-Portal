'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { RED_FLAG_LABELS, whatsappLink } from '@/lib/admin-labels'
import { addDays, FOLLOWUP_LABELS, STAGES, STAGE_LABELS, type Stage } from '@/lib/journey'
import type { RedFlag } from '@/lib/prescreening'

type PersonRow = {
  phone: string
  name: string
  registered: boolean
  stage: Stage
  stageLabel: string
  sourceContent: string | null
  sourceChannel: string | null
  pendingFollowups: number
  overdueFollowups: number
  lapsed: boolean
}

type Detail = {
  today: string
  person: PersonRow & {
    plan: { planService: string; creditsRemaining: number; planExpiresAt: string } | null
  }
  timeline: { at: string; kind: string; title: string; detail?: string }[]
  followups: {
    id: string
    kind: string
    status: 'pending' | 'done' | 'skipped'
    dueDate: string
    note?: string | null
  }[]
  prescreenings: {
    id: string
    createdAt: string
    route: string
    redFlags: string[]
    lines: string[]
  }[]
}

type Filter = 'todas' | Stage | 'vencidos' | 'dejaron'

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function PeoplePanel() {
  const [people, setPeople] = useState<PersonRow[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todas')
  const [detail, setDetail] = useState<Detail | null>(null)
  const [message, setMessage] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetch('/api/admin/journey')
      .then(async (response) => {
        if (response.ok) setPeople(((await response.json()) as { people: PersonRow[] }).people)
      })
      .catch(() => setMessage('No pudimos cargar las personas.'))
  }, [])

  const open = useCallback(async (phone: string) => {
    setMessage('')
    const response = await fetch(`/api/admin/journey?phone=${encodeURIComponent(phone)}`)
    if (!response.ok) return setMessage('No pudimos abrir la ficha.')
    const data = (await response.json()) as Detail
    setDetail(data)
    setDueDate(addDays(data.today, 2))
    setNote('')
  }, [])

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return people.filter((person) => {
      if (text && !`${person.name} ${person.phone}`.toLowerCase().includes(text)) return false
      if (filter === 'todas') return true
      if (filter === 'vencidos') return person.overdueFollowups > 0
      if (filter === 'dejaron') return person.lapsed
      return person.stage === filter
    })
  }, [people, query, filter])

  async function addFollowup(event: FormEvent) {
    event.preventDefault()
    if (!detail) return
    const response = await fetch('/api/admin/followups', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: detail.person.phone, dueDate, note }),
    })
    if (!response.ok) return setMessage('No pudimos crear el seguimiento.')
    await open(detail.person.phone)
  }

  async function setFollowup(id: string, status: 'done' | 'skipped' | 'pending') {
    if (!detail) return
    await fetch('/api/admin/followups', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await open(detail.person.phone)
  }

  if (detail) {
    const { person } = detail
    return (
      <div className="login-card">
        <button
          type="button"
          className="text-link login-link-button"
          onClick={() => setDetail(null)}
        >
          ← Volver a personas
        </button>
        <h2>{person.name}</h2>
        <p>
          {person.phone}{' '}
          <a href={whatsappLink(person.phone)} target="_blank" rel="noreferrer">
            Escribir por WhatsApp
          </a>
        </p>
        <div className="admin-chips">
          <span className="admin-badge">{STAGE_LABELS[person.stage]}</span>
          {!person.registered && <span className="admin-badge">Sin cuenta</span>}
          {person.overdueFollowups > 0 && (
            <span className="admin-badge admin-badge-alert">Seguimiento vencido</span>
          )}
          {person.lapsed && <span className="admin-badge admin-badge-alert">Dejó de venir</span>}
        </div>
        <ul className="admin-answers">
          <li>
            Llegó por:{' '}
            {person.sourceContent
              ? `${person.sourceContent} (${person.sourceChannel ?? 'canal desconocido'})`
              : 'sin origen registrado'}
          </li>
          {person.plan && (
            <li>
              Plan: {person.plan.planService} · {person.plan.creditsRemaining} clases · vence el{' '}
              {person.plan.planExpiresAt}
            </li>
          )}
        </ul>

        {detail.prescreenings[0] && (
          <div className="admin-item">
            <strong>Última pre-valoración ({formatWhen(detail.prescreenings[0].createdAt)})</strong>
            {detail.prescreenings[0].redFlags.length > 0 && (
              <p className="admin-flags">
                Alertas:{' '}
                {detail.prescreenings[0].redFlags
                  .map((flag) => RED_FLAG_LABELS[flag as RedFlag] ?? flag)
                  .join(' · ')}
              </p>
            )}
            <ul className="admin-answers">
              {detail.prescreenings[0].lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <h3>Seguimientos</h3>
        <form onSubmit={addFollowup} className="field-grid">
          <label className="field">
            <span>Para el día</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Qué hay que hacer</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
          </label>
          <button className="button button-primary">Crear seguimiento</button>
        </form>
        <ul className="admin-list">
          {detail.followups.map((item) => (
            <li key={item.id} className="admin-item">
              <strong>{FOLLOWUP_LABELS[item.kind] ?? item.kind}</strong> · para el {item.dueDate} ·{' '}
              {item.status === 'pending'
                ? 'Pendiente'
                : item.status === 'done'
                  ? 'Hecho'
                  : 'Omitido'}
              {item.note && <p>{item.note}</p>}
              <div className="admin-actions">
                {item.status === 'pending' ? (
                  <>
                    <button type="button" onClick={() => setFollowup(item.id, 'done')}>
                      Hecho
                    </button>
                    <button type="button" onClick={() => setFollowup(item.id, 'skipped')}>
                      Omitir
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setFollowup(item.id, 'pending')}>
                    Reabrir
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <h3>Historia</h3>
        <ol className="timeline">
          {detail.timeline.map((event, index) => (
            <li key={`${event.at}-${index}`} className={`timeline-${event.kind}`}>
              <time>{formatWhen(event.at)}</time>
              <strong>{event.title}</strong>
              {event.detail && <span>{event.detail}</span>}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className="login-card">
      <h2>Personas</h2>
      <p>Todo lo que ha pasado con cada persona, en un solo lugar.</p>
      <div className="field-grid">
        <label className="field">
          <span>Buscar por nombre o teléfono</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="field">
          <span>Mostrar</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
            <option value="todas">Todas</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
            <option value="vencidos">Con seguimiento vencido</option>
            <option value="dejaron">Dejaron de venir</option>
          </select>
        </label>
      </div>
      {message && <p role="alert">{message}</p>}
      {visible.length === 0 && <p>No hay personas para mostrar.</p>}
      <ul className="admin-list">
        {visible.map((person) => (
          <li key={person.phone} className="admin-item">
            <div>
              <button
                type="button"
                className="text-link login-link-button"
                onClick={() => open(person.phone)}
              >
                <strong>{person.name}</strong>
              </button>
              <span className="admin-badge">{person.stageLabel}</span>
              {person.overdueFollowups > 0 && (
                <span className="admin-badge admin-badge-alert">Vencido</span>
              )}
              {person.lapsed && (
                <span className="admin-badge admin-badge-alert">Dejó de venir</span>
              )}
            </div>
            <p>
              {person.phone}
              {person.sourceContent ? ` · llegó por ${person.sourceContent}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
