'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import type { Outcome } from '@/lib/prescreening'
import { STEPS, type Draft, type StepDef } from './questions'
import { PrescreeningResult } from './prescreening-result'

type Status = 'answering' | 'saving' | 'done'

// Without pain there is nothing to rate or date, so those two steps are skipped.
function visibleSteps(draft: Draft): StepDef[] {
  const noPain = draft.painArea === 'ninguna'
  return STEPS.filter(
    (step) => !(noPain && (step.key === 'painLevel' || step.key === 'painDuration')),
  )
}

function isAnswered(step: StepDef, draft: Draft): boolean {
  if (step.kind === 'contact') return true
  return draft[step.key as keyof Draft] !== undefined
}

export function PrescreeningWizard() {
  const [draft, setDraft] = useState<Draft>({})
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>('answering')
  const [error, setError] = useState('')
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  const steps = visibleSteps(draft)
  const step = steps[Math.min(index, steps.length - 1)]
  const isLast = index >= steps.length - 1

  useEffect(() => {
    heading.current?.focus()
  }, [index, status])

  function patch(values: Draft) {
    setDraft((current) => ({ ...current, ...values }))
    setError('')
  }

  function next() {
    if (!isAnswered(step, draft)) return setError('Elige una opción para continuar.')
    setIndex((value) => value + 1)
  }

  async function submit() {
    if (!draft.name?.trim() || !draft.phone?.trim()) {
      return setError('Escribe tu nombre y tu número de WhatsApp.')
    }
    if (!draft.consent) return setError('Necesitamos tu autorización para guardar tus respuestas.')
    setStatus('saving')
    setError('')
    const { name, phone, consent, ...rest } = draft
    const answers = {
      ...rest,
      painLevel: rest.painLevel ?? 0,
      painDuration: rest.painDuration ?? 'no-aplica',
    }
    try {
      const response = await fetch('/api/prescreening', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone, consent, answers }),
      })
      const result = (await response.json()) as { error?: string; outcome?: Outcome }
      if (!response.ok || !result.outcome) {
        throw new Error(result.error ?? 'No pudimos guardar tus respuestas.')
      }
      setOutcome(result.outcome)
      setStatus('done')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No pudimos guardar tus respuestas.')
      setStatus('answering')
    }
  }

  if (status === 'done' && outcome) {
    return <PrescreeningResult name={draft.name ?? ''} outcome={outcome} />
  }

  return (
    <section className="prescreen-card">
      <p className="eyebrow">
        PASO {index + 1} DE {steps.length}
      </p>
      <div
        className="prescreen-progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={index + 1}
        aria-label="Avance"
      >
        <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      <h1 ref={heading} tabIndex={-1} className="prescreen-title">
        {step.title}
      </h1>
      {step.kind === 'yesno' && <p className="prescreen-hint">{step.hint}</p>}

      {step.kind === 'choice' && (
        <div className="prescreen-options" role="radiogroup" aria-label={step.title}>
          {step.options.map((option) => {
            const selected = draft[step.key] === option.value
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                key={option.value}
                className={selected ? 'prescreen-option selected' : 'prescreen-option'}
                onClick={() => patch({ [step.key]: option.value } as Draft)}
              >
                <span>
                  <strong>{option.label}</strong>
                  {option.hint && <small>{option.hint}</small>}
                </span>
                {selected && <Check size={24} />}
              </button>
            )
          })}
        </div>
      )}

      {step.kind === 'pain' && (
        <>
          <div className="prescreen-pain" role="radiogroup" aria-label={step.title}>
            {Array.from({ length: 11 }, (_, level) => (
              <button
                type="button"
                role="radio"
                aria-checked={draft.painLevel === level}
                key={level}
                className={draft.painLevel === level ? 'selected' : ''}
                onClick={() => patch({ painLevel: level })}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="prescreen-hint">
            0 es nada de dolor y 10 es el peor dolor que has sentido.
          </p>
        </>
      )}

      {step.kind === 'yesno' && (
        <div className="prescreen-options" role="radiogroup" aria-label={step.title}>
          {[
            { value: false, label: 'No' },
            { value: true, label: 'Sí' },
          ].map((option) => (
            <button
              type="button"
              role="radio"
              aria-checked={draft.chestSymptoms === option.value}
              key={option.label}
              className={
                draft.chestSymptoms === option.value
                  ? 'prescreen-option selected'
                  : 'prescreen-option'
              }
              onClick={() => patch({ chestSymptoms: option.value })}
            >
              <strong>{option.label}</strong>
              {draft.chestSymptoms === option.value && <Check size={24} />}
            </button>
          ))}
        </div>
      )}

      {step.kind === 'conditions' && (
        <div className="prescreen-options" role="group" aria-label={step.title}>
          {step.options.map((option) => {
            const current: string[] = draft.conditions ?? []
            const selected = current.includes(option.value)
            return (
              <button
                type="button"
                role="checkbox"
                aria-checked={selected}
                key={option.value}
                className={selected ? 'prescreen-option selected' : 'prescreen-option'}
                onClick={() => {
                  const updated = selected
                    ? current.filter((item) => item !== option.value)
                    : [...current, option.value]
                  patch({ conditions: updated as Draft['conditions'] })
                }}
              >
                <strong>{option.label}</strong>
                {selected && <Check size={24} />}
              </button>
            )
          })}
          <button
            type="button"
            role="checkbox"
            aria-checked={draft.conditions?.length === 0}
            className={
              draft.conditions?.length === 0 ? 'prescreen-option selected' : 'prescreen-option'
            }
            onClick={() => patch({ conditions: [] })}
          >
            <strong>Ninguna de estas</strong>
            {draft.conditions?.length === 0 && <Check size={24} />}
          </button>
        </div>
      )}

      {step.kind === 'contact' && (
        <div className="prescreen-contact">
          <label className="field">
            <span>Tu nombre</span>
            <input
              autoComplete="name"
              value={draft.name ?? ''}
              onChange={(event) => patch({ name: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Tu número de WhatsApp</span>
            <input
              autoComplete="tel"
              inputMode="tel"
              value={draft.phone ?? ''}
              onChange={(event) => patch({ phone: event.target.value })}
            />
          </label>
          <label className="prescreen-consent">
            <input
              type="checkbox"
              checked={draft.consent === true}
              onChange={(event) => patch({ consent: event.target.checked })}
            />
            <span>
              Autorizo a Fisiofes a guardar y usar mis respuestas, incluidos datos de salud, para
              orientarme y contactarme. Puedo pedir que las borren cuando quiera.
            </span>
          </label>
          <p className="privacy-line">
            <ShieldCheck size={20} /> Solo el equipo de Fisiofes verá tus respuestas.
          </p>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="prescreen-actions">
        {index > 0 && (
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setIndex((value) => value - 1)}
          >
            <ArrowLeft size={20} /> Atrás
          </button>
        )}
        {isLast ? (
          <button
            type="button"
            className="button button-primary"
            onClick={submit}
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Enviando…' : 'Enviar mis respuestas'} <ArrowRight size={20} />
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
