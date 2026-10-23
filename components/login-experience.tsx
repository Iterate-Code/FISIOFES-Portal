'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from '@/components/native-link'
import { ArrowRight, LockKeyhole } from 'lucide-react'

type Step = 'phone' | 'code' | 'profile'

// Only same-site relative paths, so the login cannot be used as an open redirect.
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get('next') ?? ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/mi-fisiofes'
}

async function postJson<T>(url: string, body: unknown): Promise<{ ok: boolean; data: T }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as T
  return { ok: response.ok, data }
}

export function LoginExperience() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [devCode, setDevCode] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [step])

  async function requestCode(event?: FormEvent) {
    event?.preventDefault()
    if (!phone.trim()) return setError('Escribe tu número de WhatsApp.')
    setBusy(true)
    setError('')
    const { ok, data } = await postJson<{ error?: string; devCode?: string }>(
      '/api/auth/request-code',
      { phone },
    )
    setBusy(false)
    if (!ok) return setError(data.error ?? 'No pudimos enviar el código.')
    setDevCode(data.devCode ?? '')
    setCode('')
    setStep('code')
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    if (!code.trim()) return setError('Escribe el código que te enviamos.')
    if (step === 'profile' && (!name.trim() || !consent)) {
      return setError('Escribe tu nombre y acepta el uso de tus datos para continuar.')
    }
    setBusy(true)
    setError('')
    const { ok, data } = await postJson<{ error?: string; needsProfile?: boolean }>(
      '/api/auth/verify',
      { phone, code, ...(step === 'profile' ? { name, consent } : {}) },
    )
    setBusy(false)
    if (!ok) return setError(data.error ?? 'No pudimos verificar el código.')
    if (data.needsProfile) {
      setStep('profile')
      return
    }
    window.location.assign(safeNext())
  }

  return (
    <section className="login-card">
      <p className="eyebrow">MI FISIOFES</p>
      {step === 'phone' && (
        <form onSubmit={requestCode}>
          <h1 ref={heading} tabIndex={-1}>
            Ingresa o crea tu cuenta.
          </h1>
          <p className="login-lede">
            Escribe tu número de WhatsApp. Te enviaremos un código de 6 dígitos. No necesitas
            contraseña.
          </p>
          <label className="field">
            <span>Tu número de WhatsApp</span>
            <input
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="310 555 0123"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviarme el código'} <ArrowRight size={20} />
          </button>
        </form>
      )}

      {step !== 'phone' && (
        <form onSubmit={verify}>
          <h1 ref={heading} tabIndex={-1}>
            {step === 'code' ? 'Escribe tu código.' : 'Un último paso.'}
          </h1>
          <p className="login-lede">
            {step === 'code'
              ? `Te enviamos un código por WhatsApp al ${phone}.`
              : 'Es tu primera vez. Cuéntanos tu nombre para crear tu cuenta.'}
          </p>
          {devCode && (
            <p className="login-lede">
              <strong>Solo en desarrollo:</strong> {devCode}
            </p>
          )}
          <label className="field">
            <span>Código de 6 dígitos</span>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={step === 'profile'}
            />
          </label>
          {step === 'profile' && (
            <>
              <label className="field">
                <span>Tu nombre completo</span>
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="prescreen-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  Autorizo a Fisiofes a guardar y usar mis datos personales y de salud para
                  gestionar mis citas y mi atención. Puedo pedir que los borren cuando quiera.
                </span>
              </label>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Verificando…' : step === 'code' ? 'Entrar' : 'Crear mi cuenta'}{' '}
            <ArrowRight size={20} />
          </button>
          <button
            type="button"
            className="text-link login-link-button"
            onClick={() => {
              setStep('phone')
              setError('')
            }}
          >
            Cambiar mi número
          </button>
          {step === 'code' && (
            <button
              type="button"
              className="text-link login-link-button"
              onClick={() => requestCode()}
              disabled={busy}
            >
              No me llegó. Enviar otro código
            </button>
          )}
        </form>
      )}

      <p className="login-security">
        <LockKeyhole size={20} /> Tu código vence en 10 minutos y sirve una sola vez.
      </p>
      <Link href="/prevaloracion" className="text-link">
        ¿Primera vez? Haz la pre-valoración <ArrowRight size={18} />
      </Link>
      <Link href="/admin" className="text-link">
        Acceso del equipo
      </Link>
    </section>
  )
}
