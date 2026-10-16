import type { Answers } from '@/lib/prescreening'

export type Option = { value: string; label: string; hint?: string }

export type ChoiceStep = {
  kind: 'choice'
  key: 'goal' | 'painArea' | 'painDuration' | 'falls' | 'branch' | 'schedule'
  title: string
  options: Option[]
}

export type StepDef =
  | ChoiceStep
  | { kind: 'pain'; key: 'painLevel'; title: string }
  | { kind: 'yesno'; key: 'chestSymptoms'; title: string; hint: string }
  | { kind: 'conditions'; key: 'conditions'; title: string; options: Option[] }
  | { kind: 'contact'; key: 'contact'; title: string }

export const STEPS: StepDef[] = [
  {
    kind: 'choice',
    key: 'goal',
    title: '¿Qué te gustaría lograr?',
    options: [
      { value: 'dolor', label: 'Aliviar un dolor', hint: 'Me duele algo y quiero estar mejor' },
      { value: 'recuperacion', label: 'Recuperarme', hint: 'De una cirugía, lesión o caída' },
      { value: 'fuerza', label: 'Ganar fuerza y movilidad', hint: 'Sentirme más capaz' },
      { value: 'longevidad', label: 'Cuidar mi futuro', hint: 'Equilibrio e independencia' },
      { value: 'bienestar', label: 'Relajarme y descargar', hint: 'Masajes y terapias' },
    ],
  },
  {
    kind: 'choice',
    key: 'painArea',
    title: '¿Dónde sientes molestia?',
    options: [
      { value: 'cuello-espalda', label: 'Cuello o espalda' },
      { value: 'hombro-brazo', label: 'Hombro o brazo' },
      { value: 'cadera-rodilla', label: 'Cadera o rodilla' },
      { value: 'pie-tobillo', label: 'Pie o tobillo' },
      { value: 'varias', label: 'En varias partes' },
      { value: 'ninguna', label: 'No tengo molestias' },
    ],
  },
  { kind: 'pain', key: 'painLevel', title: '¿Cuánto te duele hoy?' },
  {
    kind: 'choice',
    key: 'painDuration',
    title: '¿Hace cuánto empezó?',
    options: [
      { value: 'no-aplica', label: 'No tengo dolor' },
      { value: 'menos-6-semanas', label: 'Hace menos de 6 semanas' },
      { value: 'seis-semanas-3-meses', label: 'Entre 6 semanas y 3 meses' },
      { value: 'mas-3-meses', label: 'Hace más de 3 meses' },
    ],
  },
  {
    kind: 'choice',
    key: 'falls',
    title: '¿Te has caído en el último año?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'una-vez', label: 'Sí, una vez' },
      { value: 'varias', label: 'Sí, varias veces' },
    ],
  },
  {
    kind: 'yesno',
    key: 'chestSymptoms',
    title: '¿Has sentido dolor en el pecho, mareo o falta de aire al hacer esfuerzo?',
    hint: 'Si respondes que sí, una persona del equipo te llamará antes de agendar.',
  },
  {
    kind: 'conditions',
    key: 'conditions',
    title: '¿Tienes alguna de estas condiciones?',
    options: [
      { value: 'cardiaca', label: 'Problema del corazón' },
      { value: 'presion', label: 'Presión alta' },
      { value: 'diabetes', label: 'Diabetes' },
      { value: 'osteoporosis', label: 'Osteoporosis' },
      { value: 'protesis', label: 'Prótesis o platina' },
      { value: 'cirugia-reciente', label: 'Cirugía en las últimas 6 semanas' },
      { value: 'embarazo', label: 'Embarazo' },
    ],
  },
  {
    kind: 'choice',
    key: 'branch',
    title: '¿Qué sede te queda mejor?',
    options: [
      { value: 'calarca', label: 'Calarcá', hint: 'Calle 37 #25-52' },
      { value: 'senior-mall', label: "Senior's Mall, Armenia", hint: 'Vía La Tebaida–El Caimo' },
      { value: 'sin-preferencia', label: 'Me da igual' },
    ],
  },
  {
    kind: 'choice',
    key: 'schedule',
    title: '¿En qué horario prefieres venir?',
    options: [
      { value: 'manana', label: 'En la mañana' },
      { value: 'tarde', label: 'En la tarde' },
      { value: 'sin-preferencia', label: 'Me da igual' },
    ],
  },
  { kind: 'contact', key: 'contact', title: '¿Cómo te contactamos?' },
]

export type Draft = Partial<Answers> & { name?: string; phone?: string; consent?: boolean }

export const GOAL_LABELS: Record<string, string> = {
  fisioterapia: 'Valoración osteomuscular',
  pilates: 'Primera clase de Pilates',
  'valoracion-funcional-longevidad': 'Valoración funcional y longevidad',
  bienestar: 'Terapia de bienestar',
}
