'use client'

import { FormEvent, useState } from 'react'

/** Demo deployments only: asks for the demo key before showing /admin. */
export function DemoAdminGate() {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const response = await fetch('/api/demo/admin-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    if (response.ok) return window.location.reload()
    setError('La clave no es correcta.')
    setBusy(false)
  }

  return (
    <main id="contenido" className="login-page">
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">VERSIÓN DE PRUEBA</p>
        <h1>Panel del equipo</h1>
        <p className="login-lede">Escribe la clave de demostración para ver el panel.</p>
        <label className="field">
          <span>Clave</span>
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(event) => setKey(event.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button button-primary" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
