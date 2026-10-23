'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { trackedLink } from '@/lib/attribution'

type Content = { id: string; slug: string; title: string; channel: string }

const CHANNELS = [
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['facebook', 'Facebook'],
  ['youtube', 'YouTube'],
  ['whatsapp', 'WhatsApp'],
  ['google', 'Google'],
  ['otro', 'Otro'],
] as const

const PATHS = [
  ['/', 'Inicio'],
  ['/prevaloracion', 'Pre-valoración'],
  ['/clases', 'Clases'],
] as const

export function ContentsPanel() {
  const [rows, setRows] = useState<Content[]>([])
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState('instagram')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/contents')
    if (response.ok) setRows(((await response.json()) as { contents: Content[] }).contents)
  }, [])

  useEffect(() => {
    fetch('/api/admin/contents')
      .then(async (response) => {
        if (response.ok) setRows(((await response.json()) as { contents: Content[] }).contents)
      })
      .catch(() => setMessage('No pudimos cargar los contenidos.'))
  }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    const response = await fetch('/api/admin/contents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, channel }),
    })
    const result = (await response.json()) as { error?: string }
    if (response.ok) setTitle('')
    else setMessage(result.error ?? 'No pudimos crear el contenido.')
    await load()
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(link)
    } catch {
      setMessage('No pudimos copiar. Selecciona el enlace y cópialo a mano.')
    }
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return (
    <div className="login-card">
      <h2>Contenidos</h2>
      <p>
        Registra cada video o publicación antes de publicarlo. Usa su enlace en la descripción o en
        la biografía: así sabemos cuántas personas trae y cuántas llegan a reservar y asistir.
      </p>
      <form onSubmit={create} className="field-grid">
        <label className="field">
          <span>Nombre del contenido</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            minLength={3}
          />
        </label>
        <label className="field">
          <span>Dónde se publica</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value)}>
            {CHANNELS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-primary">Crear contenido</button>
      </form>
      {message && <p role="alert">{message}</p>}
      <ul className="admin-list">
        {rows.map((row) => (
          <li key={row.id} className="admin-item">
            <strong>{row.title}</strong>
            <p>{row.channel}</p>
            {PATHS.map(([path, label]) => {
              const link = trackedLink(origin, row.channel, row.slug, path)
              return (
                <div key={path} className="admin-link">
                  <span>{label}:</span> <code>{link}</code>
                  <button type="button" onClick={() => copy(link)}>
                    {copied === link ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              )
            })}
          </li>
        ))}
      </ul>
    </div>
  )
}
