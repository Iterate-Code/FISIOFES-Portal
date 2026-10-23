// The customer journey as plain functions: where a person is (stage), what happened to them
// (timeline) and what the team should do next (follow-ups). No database access here.
import { categoryTitle } from './admin-labels.ts'

export const STAGES = ['nuevo', 'pre_valorado', 'reservo', 'asistio', 'recurrente'] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_LABELS: Record<Stage, string> = {
  nuevo: 'Nuevo',
  pre_valorado: 'Pre-valorado',
  reservo: 'Reservó o solicitó',
  asistio: 'Asistió',
  recurrente: 'Recurrente (3 o más clases)',
}

export const FOLLOWUP_LABELS: Record<string, string> = {
  post_clase: 'Después de la clase',
  inasistencia: 'No asistió',
  pre_valoracion: 'Pre-valoración',
  solicitud: 'Solicitud de cita',
  manual: 'Manual',
}

const SERVICE_LABELS: Record<string, string> = { pilates: 'Pilates', training: 'Entrenamiento' }
const DAY_MS = 86_400_000

/** Adds days to a YYYY-MM-DD calendar date. Pure date arithmetic, no time zones involved. */
export function addDays(date: string, days: number): string {
  const instant = new Date(`${date}T12:00:00Z`).getTime() + days * DAY_MS
  return new Date(instant).toISOString().slice(0, 10)
}

export type PersonFacts = {
  phone: string
  name: string
  registered: boolean
  registeredAt?: string | null
  consentAt?: string | null
  sourceChannel?: string | null
  sourceContent?: string | null
  prescreenings: { id: string; createdAt: string; route: 'llamada' | 'recomendacion' }[]
  requests: {
    id: string
    createdAt: string
    status: 'pending' | 'confirmed' | 'cancelled'
    serviceSlug: string
  }[]
  bookings: {
    id: string
    createdAt: string
    status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
    service: string
    date: string
    time: string
    attendedAt?: string | null
  }[]
  followups: {
    id: string
    createdAt: string
    kind: string
    status: 'pending' | 'done' | 'skipped'
    dueDate: string
    note?: string | null
    doneAt?: string | null
  }[]
}

export function computeStage(facts: PersonFacts): Stage {
  const attended = facts.bookings.filter((booking) => booking.status === 'attended').length
  if (attended >= 3) return 'recurrente'
  if (attended >= 1) return 'asistio'
  const booked = facts.bookings.some((b) => b.status === 'confirmed' || b.status === 'no_show')
  const requested = facts.requests.some((r) => r.status === 'pending' || r.status === 'confirmed')
  if (booked || requested) return 'reservo'
  if (facts.prescreenings.length > 0) return 'pre_valorado'
  return 'nuevo'
}

export function stageRank(stage: Stage): number {
  return STAGES.indexOf(stage)
}

export type Flags = {
  pendingFollowups: number
  overdueFollowups: number
  /** Attended before, but not for 14+ days and nothing booked ahead. */
  lapsed: boolean
}

export function personFlags(facts: PersonFacts, today: string): Flags {
  const pending = facts.followups.filter((followup) => followup.status === 'pending')
  const attendedDates = facts.bookings
    .filter((booking) => booking.status === 'attended')
    .map((booking) => booking.date)
    .sort()
  const last = attendedDates[attendedDates.length - 1]
  const hasFuture = facts.bookings.some(
    (booking) => booking.status === 'confirmed' && booking.date >= today,
  )
  return {
    pendingFollowups: pending.length,
    overdueFollowups: pending.filter((followup) => followup.dueDate < today).length,
    lapsed: Boolean(last) && last < addDays(today, -14) && !hasFuture,
  }
}

/** Follow-up the team gets automatically when attendance is marked. */
export function followupForAttendance(
  status: 'attended' | 'no_show',
  today: string,
): { kind: 'post_clase' | 'inasistencia'; dueDate: string; note: string } {
  return status === 'attended'
    ? {
        kind: 'post_clase',
        dueDate: addDays(today, 2),
        note: 'Preguntar cómo se sintió e invitar a reservar la próxima clase.',
      }
    : {
        kind: 'inasistencia',
        dueDate: addDays(today, 1),
        note: 'Preguntar qué pasó y ofrecer reagendar.',
      }
}

export type TimelineEvent = {
  at: string
  kind: 'registro' | 'pre_valoracion' | 'solicitud' | 'reserva' | 'asistencia' | 'seguimiento'
  title: string
  detail?: string
}

export function buildTimeline(facts: PersonFacts): TimelineEvent[] {
  const events: TimelineEvent[] = []
  if (facts.registered && facts.registeredAt) {
    events.push({
      at: facts.registeredAt,
      kind: 'registro',
      title: 'Creó su cuenta',
      detail: facts.consentAt ? 'Aceptó el tratamiento de datos.' : undefined,
    })
  }
  for (const item of facts.prescreenings) {
    events.push({
      at: item.createdAt,
      kind: 'pre_valoracion',
      title: 'Hizo la pre-valoración',
      detail:
        item.route === 'llamada' ? 'Requiere llamada antes de agendar.' : 'Recomendación enviada.',
    })
  }
  for (const item of facts.requests) {
    events.push({
      at: item.createdAt,
      kind: 'solicitud',
      title: `Solicitó ${categoryTitle(item.serviceSlug)}`,
      detail: { pending: 'En espera', confirmed: 'Confirmada', cancelled: 'Cancelada' }[
        item.status
      ],
    })
  }
  for (const item of facts.bookings) {
    const label = SERVICE_LABELS[item.service] ?? item.service
    events.push({
      at: item.createdAt,
      kind: 'reserva',
      title: `Reservó ${label} el ${item.date} a las ${item.time}`,
      detail: item.status === 'cancelled' ? 'Cancelada' : undefined,
    })
    if (item.status === 'attended' || item.status === 'no_show') {
      events.push({
        at: item.attendedAt ?? `${item.date}T${item.time}:00-05:00`,
        kind: 'asistencia',
        title: `${item.status === 'attended' ? 'Asistió a' : 'No asistió a'} ${label} del ${item.date}`,
      })
    }
  }
  for (const item of facts.followups) {
    events.push({
      at: item.doneAt ?? item.createdAt,
      kind: 'seguimiento',
      title: `Seguimiento: ${FOLLOWUP_LABELS[item.kind] ?? item.kind}`,
      detail: `${{ pending: 'Pendiente', done: 'Hecho', skipped: 'Omitido' }[item.status]} · para el ${item.dueDate}${item.note ? ` · ${item.note}` : ''}`,
    })
  }
  return events.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}

/** Cumulative funnel: how many people reached at least each stage. */
export function funnelCounts(stages: Stage[]): Record<Stage, number> {
  const counts = Object.fromEntries(STAGES.map((stage) => [stage, 0])) as Record<Stage, number>
  for (const stage of stages) {
    for (const reached of STAGES.slice(0, stageRank(stage) + 1)) counts[reached] += 1
  }
  return counts
}
