import test from 'node:test'
import assert from 'node:assert/strict'
import { bogotaDate, upcomingDays } from './booking-dates.ts'
import { branchesFor, requestSchema, validateRequestRules } from './appointment-request.ts'

test('bogotaDate uses the Colombian calendar day, not UTC', () => {
  // 03:00 UTC on the 17th is still 22:00 on the 16th in Bogotá.
  assert.equal(bogotaDate(new Date('2026-10-17T03:00:00Z')), '2026-10-16')
  assert.equal(bogotaDate(new Date('2026-10-16T15:00:00Z')), '2026-10-16')
})

test('upcomingDays starts today, labels Hoy/Mañana and skips Sundays', () => {
  // 2026-10-16 is a Friday.
  const days = upcomingDays(new Date('2026-10-16T15:00:00Z'), 4)
  assert.deepEqual(
    days.map((day) => day.date),
    ['2026-10-16', '2026-10-17', '2026-10-19', '2026-10-20'],
  )
  assert.equal(days[0].label, 'Hoy')
  assert.equal(days[1].label, 'Mañana')
  assert.match(days[2].label, /lunes/i)
})

test('upcomingDays on a Sunday starts on Monday without a Hoy label', () => {
  // 2026-10-18 is a Sunday.
  const days = upcomingDays(new Date('2026-10-18T15:00:00Z'), 2)
  assert.deepEqual(
    days.map((day) => day.date),
    ['2026-10-19', '2026-10-20'],
  )
  assert.ok(days.every((day) => day.label !== 'Hoy'))
})

test('class categories are restricted to Senior’s Mall', () => {
  assert.deepEqual(branchesFor('pilates'), ['senior-mall'])
  assert.ok(branchesFor('fisioterapia').includes('calarca'))
})

test('request rules reject Calarcá for classes', () => {
  const base = { serviceSlug: 'pilates', branch: 'calarca', schedule: 'manana' } as const
  assert.ok(validateRequestRules(base))
  assert.equal(validateRequestRules({ ...base, serviceSlug: 'fisioterapia' }), null)
})

test('request schema validates enums, date format and note length', () => {
  const ok = { serviceSlug: 'fisioterapia', branch: 'calarca', schedule: 'tarde' }
  assert.equal(requestSchema.safeParse(ok).success, true)
  assert.equal(requestSchema.safeParse({ ...ok, branch: 'otra' }).success, false)
  assert.equal(requestSchema.safeParse({ ...ok, preferredDate: '16/10/2026' }).success, false)
  assert.equal(requestSchema.safeParse({ ...ok, note: 'x'.repeat(501) }).success, false)
  assert.equal(requestSchema.safeParse({ ...ok, preferredDate: '2026-10-20' }).success, true)
})

test('plan-covered class categories become instant bookings, the rest are requests', async () => {
  const { buildServiceOptions } = await import('./booking-options.ts')
  const categories = [
    { slug: 'pilates', title: 'Pilates' },
    { slug: 'entrenamiento-funcional', title: 'Entrenamiento funcional' },
    { slug: 'fisioterapia', title: 'Fisioterapia' },
  ]
  const now = new Date('2026-10-16T15:00:00Z')
  const modes = (plan: Parameters<typeof buildServiceOptions>[1]) =>
    buildServiceOptions(categories, plan, now).map((option) => option.mode)

  assert.deepEqual(modes(null), ['request', 'request', 'request'])
  const pilates = {
    planService: 'pilates',
    creditsRemaining: 3,
    planExpiresAt: '2026-11-30',
  } as const
  assert.deepEqual(modes(pilates), ['class', 'request', 'request'])
  assert.deepEqual(modes({ ...pilates, planService: 'dual' }), ['class', 'class', 'request'])
  assert.deepEqual(modes({ ...pilates, creditsRemaining: 0 }), ['request', 'request', 'request'])
  assert.deepEqual(modes({ ...pilates, planExpiresAt: '2026-10-01' }), [
    'request',
    'request',
    'request',
  ])
})
