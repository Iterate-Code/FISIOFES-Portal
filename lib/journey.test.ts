import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addDays,
  buildTimeline,
  computeStage,
  followupForAttendance,
  funnelCounts,
  personFlags,
  type PersonFacts,
} from './journey.ts'

const base: PersonFacts = {
  phone: '+573001112233',
  name: 'Rosa Prueba',
  registered: true,
  registeredAt: '2026-10-01T15:00:00Z',
  consentAt: '2026-10-01T15:00:00Z',
  prescreenings: [],
  requests: [],
  bookings: [],
  followups: [],
}

const booking = (id: string, status: PersonFacts['bookings'][number]['status'], date: string) => ({
  id,
  createdAt: '2026-10-05T12:00:00Z',
  status,
  service: 'pilates',
  date,
  time: '09:00',
})

test('addDays crosses month, year and leap-day boundaries', () => {
  assert.equal(addDays('2026-10-30', 3), '2026-11-02')
  assert.equal(addDays('2026-12-30', 3), '2027-01-02')
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')
  assert.equal(addDays('2026-10-23', -14), '2026-10-09')
})

test('computeStage follows the journey: nuevo, pre-valorado, reservo, asistio, recurrente', () => {
  assert.equal(computeStage(base), 'nuevo')
  const pre = {
    ...base,
    prescreenings: [
      { id: 'p', createdAt: '2026-10-02T00:00:00Z', route: 'recomendacion' as const },
    ],
  }
  assert.equal(computeStage(pre), 'pre_valorado')
  const requested = {
    ...pre,
    requests: [
      {
        id: 'r',
        createdAt: '2026-10-03T00:00:00Z',
        status: 'pending' as const,
        serviceSlug: 'fisioterapia',
      },
    ],
  }
  assert.equal(computeStage(requested), 'reservo')
  assert.equal(
    computeStage({ ...pre, bookings: [booking('b1', 'confirmed', '2026-10-26')] }),
    'reservo',
  )
  assert.equal(
    computeStage({ ...pre, bookings: [booking('b1', 'attended', '2026-10-20')] }),
    'asistio',
  )
  const three = ['b1', 'b2', 'b3'].map((id, index) =>
    booking(id, 'attended', `2026-10-0${index + 1}`),
  )
  assert.equal(computeStage({ ...base, bookings: three }), 'recurrente')
})

test('cancelled requests and bookings do not count as reserved', () => {
  const facts = {
    ...base,
    requests: [
      {
        id: 'r',
        createdAt: '2026-10-03T00:00:00Z',
        status: 'cancelled' as const,
        serviceSlug: 'pilates',
      },
    ],
    bookings: [booking('b1', 'cancelled', '2026-10-26')],
  }
  assert.equal(computeStage(facts), 'nuevo')
})

test('personFlags counts overdue follow-ups and detects lapsed people', () => {
  const today = '2026-10-23'
  const facts: PersonFacts = {
    ...base,
    bookings: [booking('b1', 'attended', '2026-10-01')],
    followups: [
      {
        id: 'f1',
        createdAt: '2026-10-02T00:00:00Z',
        kind: 'post_clase',
        status: 'pending',
        dueDate: '2026-10-04',
      },
      {
        id: 'f2',
        createdAt: '2026-10-02T00:00:00Z',
        kind: 'manual',
        status: 'pending',
        dueDate: '2026-10-30',
      },
      {
        id: 'f3',
        createdAt: '2026-10-02T00:00:00Z',
        kind: 'manual',
        status: 'done',
        dueDate: '2026-10-03',
      },
    ],
  }
  assert.deepEqual(personFlags(facts, today), {
    pendingFollowups: 2,
    overdueFollowups: 1,
    lapsed: true,
  })
  // A class booked ahead means they are not lapsed.
  const withFuture = {
    ...facts,
    bookings: [...facts.bookings, booking('b2', 'confirmed', '2026-10-27')],
  }
  assert.equal(personFlags(withFuture, today).lapsed, false)
  // Attended 10 days ago is still recent.
  const recent = { ...facts, bookings: [booking('b1', 'attended', '2026-10-13')] }
  assert.equal(personFlags(recent, today).lapsed, false)
})

test('followupForAttendance schedules 2 days after attending and 1 day after a no-show', () => {
  assert.deepEqual(followupForAttendance('attended', '2026-10-23'), {
    kind: 'post_clase',
    dueDate: '2026-10-25',
    note: 'Preguntar cómo se sintió e invitar a reservar la próxima clase.',
  })
  const missed = followupForAttendance('no_show', '2026-10-30')
  assert.equal(missed.kind, 'inasistencia')
  assert.equal(missed.dueDate, '2026-10-31')
})

test('buildTimeline merges every source and orders newest first', () => {
  const facts: PersonFacts = {
    ...base,
    prescreenings: [{ id: 'p', createdAt: '2026-10-02T10:00:00Z', route: 'llamada' }],
    requests: [
      {
        id: 'r',
        createdAt: '2026-10-03T10:00:00Z',
        status: 'confirmed',
        serviceSlug: 'fisioterapia',
      },
    ],
    bookings: [{ ...booking('b1', 'attended', '2026-10-20'), attendedAt: '2026-10-20T15:30:00Z' }],
    followups: [
      {
        id: 'f',
        createdAt: '2026-10-20T16:00:00Z',
        kind: 'post_clase',
        status: 'pending',
        dueDate: '2026-10-22',
        note: 'Llamar',
      },
    ],
  }
  const timeline = buildTimeline(facts)
  assert.deepEqual(
    timeline.map((event) => event.kind),
    ['seguimiento', 'asistencia', 'reserva', 'solicitud', 'pre_valoracion', 'registro'],
  )
  assert.equal(timeline[1].title, 'Asistió a Pilates del 2026-10-20')
  assert.match(timeline[0].detail ?? '', /Pendiente · para el 2026-10-22 · Llamar/)
  assert.equal(timeline[4].detail, 'Requiere llamada antes de agendar.')
})

test('funnelCounts is cumulative', () => {
  const counts = funnelCounts([
    'nuevo',
    'nuevo',
    'pre_valorado',
    'reservo',
    'asistio',
    'recurrente',
  ])
  assert.deepEqual(counts, { nuevo: 6, pre_valorado: 4, reservo: 3, asistio: 2, recurrente: 1 })
})
