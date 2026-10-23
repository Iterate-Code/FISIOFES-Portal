'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from '@/components/native-link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { branchesFor } from '@/lib/appointment-request'
import { upcomingDays } from '@/lib/booking-dates'
import { buildServiceOptions, type PlanInfo, type ServiceOption } from '@/lib/booking-options'
import { CATALOG } from '@/lib/catalog'
import { BRANCHES, SCHEDULES, ChoiceList, type Choice } from './choices'

type Me = { client: { name: string } & PlanInfo }
type Slot = { id: string; time: string; available: boolean; spotsRemaining: number }
type Step = 'service' | 'day' | 'time' | 'branch' | 'when' | 'confirm'
type Done = { kind: 'class'; label: string } | { kind: 'request' }

const CLASS_STEPS: Step[] = ['service', 'day', 'time', 'confirm']
const REQUEST_STEPS: Step[] = ['service', 'branch', 'when', 'confirm']
const TITLES: Record<Step, string> = {
  service: '¿Qué quieres reservar?',
  day: '¿Qué día te queda bien?',
  time: '¿A qué hora?',
  branch: '¿En qué sede?',
  when: '¿Cuándo prefieres venir?',
  confirm: 'Revisa y confirma',
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T
}

export function BookingFlow() {
  const [me, setMe] = useState<Me | null | undefined>(undefined)
  const [option, setOption] = useState<ServiceOption | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [time, setTime] = useState('')
  const [branch, setBranch] = useState('')
  const [schedule, setSchedule] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<Done | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (response) => setMe(response.ok ? await readJson<Me>(response) : null))
      .catch(() => setMe(null))
  }, [])

  useEffect(() => {
    heading.current?.focus()
  }, [stepIndex, done, me])

  const options = useMemo(() => buildServiceOptions(CATALOG, me?.client ?? null), [me])
  const days = useMemo(() => upcomingDays(new Date(), 7), [])
  const steps = option?.mode === 'class' ? CLASS_STEPS : REQUEST_STEPS
  const step = steps[stepIndex]
  const allowedBranches = option ? branchesFor(option.slug) : []

  if (me === undefined) return <section className="prescreen-card">Cargando…</section>
  if (me === null) {
    return (
      <section className="prescreen-card">
        <p className="eyebrow">PRIMER PASO</p>
        <h1 ref={heading} tabIndex={-1} className="prescreen-title">
          Ingresa para reservar.
        </h1>
        <p>
          Con tu número de WhatsApp creas tu cuenta o entras en menos de un minuto. No necesitas
          contraseña.
        </p>
        <Link href="/ingresar?next=/contacto" className="button button-primary">
          Ingresar o crear mi cuenta <ArrowRight size={20} />
        </Link>
        <Link href="/prevaloracion" className="text-link">
          ¿No sabes por dónde empezar? Haz la pre-valoración
        </Link>
      </section>
    )
  }

  function chooseOption(next: ServiceOption) {
    setOption(next)
    setDate('')
    setTime('')
    setSlots([])
    setBranch(branchesFor(next.slug).length === 1 ? branchesFor(next.slug)[0] : '')
    setSchedule('')
    setError('')
  }

  async function chooseDay(next: string) {
    setDate(next)
    setTime('')
    setError('')
    if (option?.mode !== 'class') return
    setLoadingSlots(true)
    try {
      const response = await fetch(`/api/availability?date=${next}&service=${option.service}`)
      const result = await readJson<{ slots?: Slot[]; error?: string }>(response)
      if (!response.ok) throw new Error(result.error)
      setSlots(result.slots ?? [])
    } catch (failure) {
      setSlots([])
      setError(
        failure instanceof Error && failure.message ? failure.message : 'No pudimos ver los cupos.',
      )
    }
    setLoadingSlots(false)
  }

  function ready(): string | null {
    if (step === 'service' && !option) return 'Elige una opción para continuar.'
    if (step === 'day' && !date) return 'Elige un día para continuar.'
    if (step === 'time' && !time) return 'Elige una hora para continuar.'
    if (step === 'branch' && !branch) return 'Elige una sede para continuar.'
    if (step === 'when' && !schedule) return 'Elige un horario para continuar.'
    return null
  }

  function next() {
    const problem = ready()
    if (problem) return setError(problem)
    setError('')
    setStepIndex((value) => value + 1)
  }

  async function confirm() {
    if (!option) return
    setSaving(true)
    setError('')
    try {
      const isClass = option.mode === 'class'
      const response = await fetch(isClass ? '/api/bookings' : '/api/appointment-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          isClass
            ? { service: option.service, date, time }
            : { serviceSlug: option.slug, branch, schedule, preferredDate: date || null, note },
        ),
      })
      const result = await readJson<{ error?: string }>(response)
      if (!response.ok) throw new Error(result.error ?? 'No pudimos completar tu reserva.')
      setDone(
        isClass
          ? { kind: 'class', label: `${option.title} · ${date} · ${time}` }
          : { kind: 'request' },
      )
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No pudimos completar tu reserva.')
    }
    setSaving(false)
  }

  if (done) {
    return (
      <section className="prescreen-card" aria-live="polite">
        <span className="success-mark">
          <Check size={28} />
        </span>
        <p className="eyebrow">
          {done.kind === 'class' ? 'RESERVA CONFIRMADA' : 'SOLICITUD RECIBIDA'}
        </p>
        <h1 ref={heading} tabIndex={-1} className="prescreen-title">
          {done.kind === 'class' ? 'Tu cupo está listo.' : 'Te confirmamos por WhatsApp.'}
        </h1>
        <p>
          {done.kind === 'class'
            ? `${done.label}. Puedes ver o cancelar tu clase en Mi Fisiofes.`
            : 'Una persona del equipo revisará tu solicitud y te escribirá para acordar el horario. No se hace ningún cobro en línea.'}
        </p>
        <Link href="/mi-fisiofes" className="button button-primary">
          Ir a Mi Fisiofes <ArrowRight size={20} />
        </Link>
      </section>
    )
  }

  const dayChoices: Choice[] = days.map((day) => ({ value: day.date, label: day.label }))
  const dayLabel = days.find((day) => day.date === date)?.label ?? date
  const branchLabel = BRANCHES.find((item) => item.value === branch)?.label
  const scheduleLabel = SCHEDULES.find((item) => item.value === schedule)?.label

  return (
    <section className="prescreen-card">
      <p className="eyebrow">
        PASO {stepIndex + 1} DE {steps.length}
      </p>
      <div
        className="prescreen-progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={stepIndex + 1}
        aria-label="Avance"
      >
        <span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
      </div>
      <h1 ref={heading} tabIndex={-1} className="prescreen-title">
        {TITLES[step]}
      </h1>

      {step === 'service' && (
        <ChoiceList
          label={TITLES.service}
          value={option?.id ?? ''}
          onChange={(id) => chooseOption(options.find((item) => item.id === id) as ServiceOption)}
          choices={options.map((item) => ({
            value: item.id,
            label: item.title,
            hint:
              item.mode === 'class'
                ? 'Con tu plan · se confirma al instante'
                : 'El equipo te confirma',
          }))}
        />
      )}

      {step === 'day' && (
        <ChoiceList label={TITLES.day} value={date} onChange={chooseDay} choices={dayChoices} />
      )}

      {step === 'time' && (
        <>
          {loadingSlots && <p className="prescreen-hint">Consultando cupos…</p>}
          {!loadingSlots && slots.length === 0 && (
            <p className="prescreen-hint">No quedan clases este día. Elige otro día con Atrás.</p>
          )}
          <div
            className="prescreen-options booking-times"
            role="radiogroup"
            aria-label={TITLES.time}
          >
            {slots.map((slot) => (
              <button
                type="button"
                role="radio"
                aria-checked={time === slot.time}
                disabled={!slot.available}
                key={slot.id}
                className={time === slot.time ? 'prescreen-option selected' : 'prescreen-option'}
                onClick={() => {
                  setTime(slot.time)
                  setError('')
                }}
              >
                <span>
                  <strong>{slot.time}</strong>
                  <small>{slot.available ? `${slot.spotsRemaining} cupos` : 'Lleno'}</small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'branch' && (
        <>
          {allowedBranches.length === 1 && (
            <p className="prescreen-hint">Este servicio se presta solo en Senior’s Mall.</p>
          )}
          <ChoiceList
            label={TITLES.branch}
            value={branch}
            onChange={setBranch}
            choices={BRANCHES.filter((item) => allowedBranches.includes(item.value))}
          />
        </>
      )}

      {step === 'when' && (
        <>
          <ChoiceList label="Horario" value={schedule} onChange={setSchedule} choices={SCHEDULES} />
          <p className="prescreen-hint">Si tienes un día en mente, elígelo (opcional):</p>
          <ChoiceList
            label="Día preferido"
            value={date}
            onChange={setDate}
            choices={[{ value: '', label: 'Cualquier día' }, ...dayChoices]}
          />
          <label className="field">
            <span>¿Algo que debamos saber? (opcional)</span>
            <textarea
              maxLength={500}
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </>
      )}

      {step === 'confirm' && option && (
        <div className="prescreen-reco">
          <strong>{option.title}</strong>
          {option.mode === 'class' ? (
            <>
              <span>
                {dayLabel} · {time}
              </span>
              <span>Senior’s Mall</span>
              <small>
                Se usa 1 clase de tu plan. Si cancelas con 2 horas o más, se te devuelve.
              </small>
            </>
          ) : (
            <>
              <span>{branchLabel}</span>
              <span>
                {scheduleLabel}
                {date ? ` · ${dayLabel}` : ''}
              </span>
              <small>
                Es una solicitud. Una persona te confirma por WhatsApp. No hay cobro en línea.
              </small>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="prescreen-actions">
        {stepIndex > 0 && (
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              setError('')
              setStepIndex((value) => value - 1)
            }}
          >
            <ArrowLeft size={20} /> Atrás
          </button>
        )}
        {step === 'confirm' ? (
          <button
            type="button"
            className="button button-primary"
            onClick={confirm}
            disabled={saving}
          >
            {saving
              ? 'Enviando…'
              : option?.mode === 'class'
                ? 'Confirmar mi clase'
                : 'Enviar mi solicitud'}{' '}
            <ArrowRight size={20} />
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={next}>
            Continuar <ArrowRight size={20} />
          </button>
        )}
      </div>
    </section>
  )
}
