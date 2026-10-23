// Human-readable labels for the team view (/admin). Spanish, no medical jargon.
import { CATALOG } from './catalog.ts'
import type { Answers, RedFlag } from './prescreening.ts'

export const BRANCH_LABELS: Record<string, string> = {
  calarca: 'Calarcá',
  'senior-mall': 'Senior’s Mall',
  'sin-preferencia': 'Sin preferencia de sede',
}

export const SCHEDULE_LABELS: Record<string, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  'sin-preferencia': 'Cualquier horario',
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'En espera',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const GOALS: Record<string, string> = {
  dolor: 'Aliviar un dolor',
  recuperacion: 'Recuperarse',
  fuerza: 'Ganar fuerza y movilidad',
  longevidad: 'Cuidar su futuro',
  bienestar: 'Relajarse y descargar',
}

const AREAS: Record<string, string> = {
  'cuello-espalda': 'cuello o espalda',
  'hombro-brazo': 'hombro o brazo',
  'cadera-rodilla': 'cadera o rodilla',
  'pie-tobillo': 'pie o tobillo',
  varias: 'varias zonas',
  ninguna: 'sin molestias',
}

const DURATIONS: Record<string, string> = {
  'no-aplica': '',
  'menos-6-semanas': 'hace menos de 6 semanas',
  'seis-semanas-3-meses': 'entre 6 semanas y 3 meses',
  'mas-3-meses': 'hace más de 3 meses',
}

const FALLS: Record<string, string> = {
  no: 'sin caídas',
  'una-vez': 'una caída',
  varias: 'varias caídas',
}

const CONDITIONS: Record<string, string> = {
  cardiaca: 'problema del corazón',
  presion: 'presión alta',
  diabetes: 'diabetes',
  osteoporosis: 'osteoporosis',
  protesis: 'prótesis o platina',
  'cirugia-reciente': 'cirugía en las últimas 6 semanas',
  embarazo: 'embarazo',
}

export const RED_FLAG_LABELS: Record<RedFlag, string> = {
  'sintomas-pecho': 'Dolor de pecho, mareo o falta de aire',
  'caidas-repetidas': 'Caídas repetidas',
  'cirugia-reciente': 'Cirugía reciente',
  'dolor-intenso': 'Dolor 8 o más',
  embarazo: 'Embarazo',
}

export function categoryTitle(slug: string): string {
  return CATALOG.find((category) => category.slug === slug)?.title ?? slug
}

/** One short line per topic, so the team can read an answer sheet at a glance. */
export function summarizeAnswers(answers: Answers): string[] {
  const pain =
    answers.painArea === 'ninguna'
      ? 'Molestia: ninguna'
      : [
          `Molestia: ${AREAS[answers.painArea]}`,
          `dolor ${answers.painLevel}/10`,
          DURATIONS[answers.painDuration],
        ]
          .filter(Boolean)
          .join(', ')
  const conditions = answers.conditions.length
    ? answers.conditions.map((item) => CONDITIONS[item]).join(', ')
    : 'ninguna'
  return [
    `Objetivo: ${GOALS[answers.goal]}`,
    pain,
    `Caídas en el último año: ${FALLS[answers.falls]}`,
    `Síntomas de pecho al esfuerzo: ${answers.chestSymptoms ? 'Sí' : 'No'}`,
    `Condiciones: ${conditions}`,
    `Prefiere: ${BRANCH_LABELS[answers.branch]} · ${SCHEDULE_LABELS[answers.schedule]}`,
  ]
}

/** wa.me link for the team to write to a patient. Phones are stored as +57XXXXXXXXXX. */
export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}
