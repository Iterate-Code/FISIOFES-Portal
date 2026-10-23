'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from '@/components/native-link'
import { ArrowRight, Check } from 'lucide-react'
import { upcomingDays } from '@/lib/booking-dates'
import { canUseCredit } from '@/lib/booking-rules'

type Service = 'pilates' | 'training'
type Slot = {
  id: string
  date: string
  time: string
  service: Service
  capacity: number
  spotsRemaining: number
  available: boolean
}
type Me = {
  client: {
    name: string
    planService: Service | 'dual'
    creditsRemaining: number
    planExpiresAt: string
  }
  upcoming: {
    id: string
    service: Service
    date: string
    time: string
    cancellationToken: string
  }[]
}
type Filter = 'all' | Service

const LABEL: Record<Service, string> = { pilates: 'Pilates', training: 'Entrenamiento funcional' }

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T
}

function shortDay(date: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short',
    day: 'numeric',
  })
    .format(new Date(`${date}T12:00:00-05:00`))
    .replace('.', '')
}

function endTime(time: string): string {
  const hour = Number(time.slice(0, 2)) + 1
  return `${String(hour).padStart(2, '0')}:00`
}

export function ClassesSchedule() {
  const days = useMemo(() => upcomingDays(new Date(), 7), [])
  const [day, setDay] = useState(days[0].date)
  const [filter, setFilter] = useState<Filter>('all')
  const [me, setMe] = useState<Me | null | undefined>(undefined)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [busy, setBusy] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  async function loadMe() {
    const response = await fetch('/api/auth/me').catch(() => null)
    setMe(response?.ok ? await readJson<Me>(response) : null)
  }

  async function loadSlots(date: string) {
    setLoading(true)
    setError('')
    try {
      const [pilates, training] = await Promise.all(
        (['pilates', 'training'] as const).map(async (service) => {
          const response = await fetch(`/api/availability?date=${date}&service=${service}`)
          const result = await readJson<{ slots?: Slot[]; error?: string }>(response)
          if (!response.ok) throw new Error(result.error ?? 'No pudimos ver las clases.')
          return result.slots ?? []
        }),
      )
      setSlots([...pilates, ...training])
    } catch (failure) {
      setSlots([])
      setError(failure instanceof Error ? failure.message : 'No pudimos ver las clases.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (response) => setMe(response.ok ? await readJson<Me>(response) : null))
      .catch(() => setMe(null))
  }, [])

  useEffect(() => {
    const date = days[0].date
    Promise.all(
      (['pilates', 'training'] as const).map(async (service) => {
        const response = await fetch(`/api/availability?date=${date}&service=${service}`)
        const result = await readJson<{ slots?: Slot[]; error?: string }>(response)
        if (!response.ok) throw new Error(result.error ?? 'No pudimos ver las clases.')
        return result.slots ?? []
      }),
    )
      .then(([pilates, training]) => {
        setSlots([...pilates, ...training])
        setLoading(false)
      })
      .catch((failure: unknown) => {
        setError(failure instanceof Error ? failure.message : 'No pudimos ver las clases.')
        setLoading(false)
      })
  }, [days])

  const visible = slots
    .filter((slot) => filter === 'all' || slot.service === filter)
    .sort((a, b) => a.time.localeCompare(b.time) || a.service.localeCompare(b.service))

  function mine(slot: Slot) {
    return me?.upcoming.find(
      (item) => item.service === slot.service && item.date === slot.date && item.time === slot.time,
    )
  }

  function covered(service: Service): boolean {
    if (!me) return false
    return canUseCredit(
      {
        service: me.client.planService,
        creditsRemaining: me.client.creditsRemaining,
        expiresAt: me.client.planExpiresAt,
      },
      service,
    ).ok
  }

  async function book(slot: Slot) {
    setBusy(true)
    setMessage('')
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ service: slot.service, date: slot.date, time: slot.time }),
    })
    const result = await readJson<{ error?: string; creditsRemaining?: number }>(response)
    setMessage(
      response.ok
        ? `Reservada: ${LABEL[slot.service]} a las ${slot.time}. Te quedan ${result.creditsRemaining} clases.`
        : (result.error ?? 'No pudimos reservar.'),
    )
    setConfirmId('')
    setBusy(false)
    await Promise.all([loadMe(), loadSlots(slot.date)])
    heading.current?.focus()
  }

  async function cancel(slot: Slot, token: string) {
    if (!window.confirm(`¿Cancelar tu clase de ${LABEL[slot.service]} a las ${slot.time}?`)) return
    setBusy(true)
    const response = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const result = await readJson<{ error?: string; creditRefunded?: boolean }>(response)
    setMessage(
      response.ok
        ? result.creditRefunded
          ? 'Clase cancelada. Tu clase volvió a tu plan.'
          : 'Clase cancelada. Faltaban menos de 2 horas, por eso no se devuelve.'
        : (result.error ?? 'No pudimos cancelar.'),
    )
    setBusy(false)
    await Promise.all([loadMe(), loadSlots(slot.date)])
  }

  return (
    <section className="classes">
      <h1 ref={heading} tabIndex={-1} className="classes-title">
        Clases
      </h1>

      {me && (
        <p className="classes-plan">
          {me.client.creditsRemaining > 0
            ? `Tu plan: ${me.client.creditsRemaining} ${me.client.creditsRemaining === 1 ? 'clase disponible' : 'clases disponibles'} · vence el ${me.client.planExpiresAt}`
            : 'Aún no tienes un plan activo. Puedes pedir tu primera clase.'}
        </p>
      )}

      <div className="day-strip" role="tablist" aria-label="Día">
        {days.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={day === item.date}
            aria-label={item.label}
            key={item.date}
            onClick={() => {
              setDay(item.date)
              setConfirmId('')
              void loadSlots(item.date)
            }}
          >
            <span>{shortDay(item.date)}</span>
          </button>
        ))}
      </div>

      <div className="class-filters" role="group" aria-label="Tipo de clase">
        {(
          [
            ['all', 'Todas'],
            ['pilates', 'Pilates'],
            ['training', 'Entrenamiento'],
          ] as [Filter, string][]
        ).map(([value, label]) => (
          <button
            type="button"
            aria-pressed={filter === value}
            key={value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <p className="classes-message" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && <p>Consultando clases…</p>}
      {!loading && !error && visible.length === 0 && (
        <p>No hay clases disponibles este día. Elige otro día.</p>
      )}

      <ul className="class-list">
        {visible.map((slot) => {
          const booking = mine(slot)
          const taken = slot.capacity - slot.spotsRemaining
          const isConfirming = confirmId === slot.id
          return (
            <li className="class-card" key={slot.id}>
              <div className="class-time">
                <strong>{slot.time}</strong>
                <small>a {endTime(slot.time)}</small>
              </div>
              <div className="class-info">
                <strong>{LABEL[slot.service]}</strong>
                <span>Senior’s Mall</span>
                <div
                  className="class-occupancy"
                  role="img"
                  aria-label={`${taken} de ${slot.capacity} cupos ocupados`}
                >
                  <i style={{ width: `${(taken / slot.capacity) * 100}%` }} />
                </div>
                <small>
                  {slot.available
                    ? `Quedan ${slot.spotsRemaining} de ${slot.capacity} cupos`
                    : 'Clase llena'}
                </small>
              </div>
              <div className="class-action">
                {booking ? (
                  <>
                    <span className="class-booked">
                      <Check size={20} /> Reservada
                    </span>
                    <button
                      type="button"
                      className="text-link login-link-button"
                      disabled={busy}
                      onClick={() => cancel(slot, booking.cancellationToken)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : !slot.available ? (
                  <span className="class-full">Lleno</span>
                ) : me === null ? (
                  <Link href="/ingresar?next=/clases" className="button button-primary">
                    Ingresar para reservar
                  </Link>
                ) : !covered(slot.service) ? (
                  <Link href="/contacto" className="button button-ghost">
                    Pedir esta clase <ArrowRight size={18} />
                  </Link>
                ) : isConfirming ? null : (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setConfirmId(slot.id)}
                  >
                    Reservar
                  </button>
                )}
              </div>
              {isConfirming && (
                <div className="class-confirm">
                  <p>
                    ¿Reservar {LABEL[slot.service]} a las {slot.time}? Se usa 1 clase de tu plan.
                  </p>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={busy}
                    onClick={() => book(slot)}
                  >
                    {busy ? 'Reservando…' : 'Sí, reservar'}
                  </button>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => setConfirmId('')}
                  >
                    Volver
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
