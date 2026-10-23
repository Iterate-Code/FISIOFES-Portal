'use client'

import { FormEvent, useState } from 'react'

type Issued = { phone: string; code: string }

export function AccessCodePanel() {
  const [phone, setPhone] = useState('')
  const [issued, setIssued] = useState<Issued | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setIssued(null)
    const response = await fetch('/api/admin/access-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const result = (await response.json()) as { error?: string; phone?: string; code?: string }
    if (response.ok && result.phone && result.code)
      setIssued({ phone: result.phone, code: result.code })
    else setMessage(result.error ?? 'No pudimos crear el código.')
    setBusy(false)
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <h2>Código de ingreso para un cliente</h2>
      <p>
        Crea un código de un solo uso (vale 24 horas) y envíaselo al cliente por tu WhatsApp. Con su
        número y ese código entra a la app; si es su primera vez, la app le pide su nombre.
      </p>
      <label className="field">
        <span>WhatsApp del cliente</span>
        <input
          inputMode="tel"
          autoComplete="off"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </label>
      <button className="button button-primary" disabled={busy}>
        {busy ? 'Creando…' : 'Crear código'}
      </button>
      {message && <p role="alert">{message}</p>}
      {issued && (
        <p role="status" className="admin-code">
          Código para {issued.phone}: <strong>{issued.code}</strong>
          <br />
          <small>Solo se muestra ahora. Si se pierde, crea otro.</small>
        </p>
      )}
    </form>
  )
}
