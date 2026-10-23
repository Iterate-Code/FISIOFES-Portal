import { Check } from 'lucide-react'

export type Choice = { value: string; label: string; hint?: string }

export const BRANCHES: Choice[] = [
  { value: 'calarca', label: 'Calarcá', hint: 'Calle 37 #25-52' },
  { value: 'senior-mall', label: 'Senior’s Mall, Armenia', hint: 'Vía La Tebaida–El Caimo, km 1' },
  { value: 'sin-preferencia', label: 'Me da igual' },
]

export const SCHEDULES: Choice[] = [
  { value: 'manana', label: 'En la mañana' },
  { value: 'tarde', label: 'En la tarde' },
  { value: 'sin-preferencia', label: 'Me da igual' },
]

export function ChoiceList({
  label,
  value,
  onChange,
  choices,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  choices: Choice[]
}) {
  return (
    <div className="prescreen-options" role="radiogroup" aria-label={label}>
      {choices.map((choice) => {
        const selected = value === choice.value
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            key={choice.value || 'none'}
            className={selected ? 'prescreen-option selected' : 'prescreen-option'}
            onClick={() => onChange(choice.value)}
          >
            <span>
              <strong>{choice.label}</strong>
              {choice.hint && <small>{choice.hint}</small>}
            </span>
            {selected && <Check size={24} />}
          </button>
        )
      })}
    </div>
  )
}
