import { z } from 'zod'
import { attributionSchema } from './attribution.ts'

// Bump when questions or triage rules change, so stored answers stay interpretable.
export const QUESTIONNAIRE_VERSION = 1

export const GOALS = ['dolor', 'recuperacion', 'fuerza', 'longevidad', 'bienestar'] as const
export const PAIN_AREAS = [
  'cuello-espalda',
  'hombro-brazo',
  'cadera-rodilla',
  'pie-tobillo',
  'varias',
  'ninguna',
] as const
export const PAIN_DURATIONS = [
  'no-aplica',
  'menos-6-semanas',
  'seis-semanas-3-meses',
  'mas-3-meses',
] as const
export const FALLS = ['no', 'una-vez', 'varias'] as const
export const CONDITIONS = [
  'cardiaca',
  'presion',
  'diabetes',
  'osteoporosis',
  'protesis',
  'cirugia-reciente',
  'embarazo',
] as const
export const BRANCHES = ['calarca', 'senior-mall', 'sin-preferencia'] as const
export const SCHEDULES = ['manana', 'tarde', 'sin-preferencia'] as const

export const answersSchema = z.object({
  goal: z.enum(GOALS),
  painArea: z.enum(PAIN_AREAS),
  painLevel: z.number().int().min(0).max(10),
  painDuration: z.enum(PAIN_DURATIONS),
  falls: z.enum(FALLS),
  // Empty array means "ninguna".
  conditions: z.array(z.enum(CONDITIONS)).max(CONDITIONS.length),
  chestSymptoms: z.boolean(),
  branch: z.enum(BRANCHES),
  schedule: z.enum(SCHEDULES),
})

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  consent: z.literal(true),
  answers: answersSchema,
  attribution: attributionSchema,
})

export type Answers = z.infer<typeof answersSchema>

export type RedFlag =
  | 'sintomas-pecho'
  | 'caidas-repetidas'
  | 'cirugia-reciente'
  | 'dolor-intenso'
  | 'embarazo'

export type Outcome = {
  /** `llamada`: a person must contact the patient before anything is booked. */
  route: 'llamada' | 'recomendacion'
  redFlags: RedFlag[]
  /** Slug of a category in lib/catalog.ts. */
  recommendedSlug: string
  /** Conditions that the team should review at the first visit, even without a red flag. */
  reviewNotes: string[]
}

// IMPORTANT: red flags are a first draft and must be validated by the clinical director
// before launch. They only decide who gets a call instead of an automatic recommendation.
export function detectRedFlags(answers: Answers): RedFlag[] {
  const flags: RedFlag[] = []
  if (answers.chestSymptoms) flags.push('sintomas-pecho')
  if (answers.falls === 'varias') flags.push('caidas-repetidas')
  if (answers.conditions.includes('cirugia-reciente')) flags.push('cirugia-reciente')
  if (answers.painLevel >= 8) flags.push('dolor-intenso')
  if (answers.conditions.includes('embarazo')) flags.push('embarazo')
  return flags
}

export function recommendCategory(answers: Answers): string {
  if (answers.goal === 'dolor' || answers.goal === 'recuperacion') return 'fisioterapia'
  if (answers.painLevel >= 4 && answers.painArea !== 'ninguna') return 'fisioterapia'
  if (answers.goal === 'longevidad' || answers.falls === 'una-vez') {
    return 'valoracion-funcional-longevidad'
  }
  if (answers.goal === 'bienestar') return 'bienestar'
  // Strength goals with cardiac or bone conditions start with an assessment, not a class.
  if (answers.conditions.includes('cardiaca') || answers.conditions.includes('osteoporosis')) {
    return 'valoracion-funcional-longevidad'
  }
  return 'pilates'
}

export function triage(answers: Answers): Outcome {
  const redFlags = detectRedFlags(answers)
  const reviewNotes = answers.conditions.filter((condition) => condition !== 'cirugia-reciente')
  return {
    route: redFlags.length ? 'llamada' : 'recomendacion',
    redFlags,
    recommendedSlug: recommendCategory(answers),
    reviewNotes,
  }
}
