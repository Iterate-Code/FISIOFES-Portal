'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function CancelPage() {
  const token = useSearchParams().get('token') ?? ''
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function cancel() {
    setBusy(true)
    const response = await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) })
    const result = await response.json()
    setMessage(response.ok ? (result.creditRefunded ? 'Reserva cancelada y crédito devuelto.' : 'Reserva cancelada. Por realizarse con menos de 2 horas de anticipación, el crédito no se devuelve.') : result.error)
    setBusy(false)
  }
  return <main className="login-page"><section className="login-card"><p className="eyebrow">GESTIONAR RESERVA</p><h1>Cancelar clase</h1><p>Si cancelas con al menos 2 horas de anticipación, el crédito vuelve automáticamente a tu plan.</p><button className="button button-primary" disabled={!token || busy || Boolean(message)} onClick={cancel}>{busy ? 'Cancelando…' : 'Confirmar cancelación'}</button>{message && <p>{message}</p>}<a className="text-link" href="/">Volver al inicio</a></section></main>
}
