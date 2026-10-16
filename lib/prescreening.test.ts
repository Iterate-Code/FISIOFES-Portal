import test from 'node:test'
import assert from 'node:assert/strict'
import { submissionSchema, triage, type Answers } from './prescreening.ts'

const base: Answers = {
  goal: 'fuerza',
  painArea: 'ninguna',
  painLevel: 0,
  painDuration: 'no-aplica',
  falls: 'no',
  conditions: [],
  chestSymptoms: false,
  branch: 'sin-preferencia',
  schedule: 'sin-preferencia',
}

test('healthy strength goal gets a Pilates recommendation without a call', () => {
  const outcome = triage(base)
  assert.equal(outcome.route, 'recomendacion')
  assert.equal(outcome.recommendedSlug, 'pilates')
  assert.deepEqual(outcome.redFlags, [])
})

test('pain or recovery goals recommend fisioterapia', () => {
  assert.equal(triage({ ...base, goal: 'dolor' }).recommendedSlug, 'fisioterapia')
  assert.equal(triage({ ...base, goal: 'recuperacion' }).recommendedSlug, 'fisioterapia')
  const painful = triage({ ...base, painArea: 'cadera-rodilla', painLevel: 5 })
  assert.equal(painful.recommendedSlug, 'fisioterapia')
})

test('longevity goal or a single fall recommends the functional assessment', () => {
  assert.equal(
    triage({ ...base, goal: 'longevidad' }).recommendedSlug,
    'valoracion-funcional-longevidad',
  )
  assert.equal(
    triage({ ...base, falls: 'una-vez' }).recommendedSlug,
    'valoracion-funcional-longevidad',
  )
})

test('strength goal with cardiac or bone condition starts with an assessment', () => {
  assert.equal(
    triage({ ...base, conditions: ['cardiaca'] }).recommendedSlug,
    'valoracion-funcional-longevidad',
  )
  assert.equal(
    triage({ ...base, conditions: ['osteoporosis'] }).recommendedSlug,
    'valoracion-funcional-longevidad',
  )
})

test('each red flag routes to a phone call', () => {
  const cases: Array<[Partial<Answers>, string]> = [
    [{ chestSymptoms: true }, 'sintomas-pecho'],
    [{ falls: 'varias' }, 'caidas-repetidas'],
    [{ conditions: ['cirugia-reciente'] }, 'cirugia-reciente'],
    [{ painLevel: 8 }, 'dolor-intenso'],
    [{ conditions: ['embarazo'] }, 'embarazo'],
  ]
  for (const [patch, flag] of cases) {
    const outcome = triage({ ...base, ...patch })
    assert.equal(outcome.route, 'llamada', flag)
    assert.ok(outcome.redFlags.includes(flag as never), flag)
  }
})

test('non-flag conditions are kept as review notes', () => {
  const outcome = triage({ ...base, conditions: ['presion', 'diabetes'] })
  assert.equal(outcome.route, 'recomendacion')
  assert.deepEqual(outcome.reviewNotes, ['presion', 'diabetes'])
})

test('submission requires consent and valid enums', () => {
  const valid = { name: 'Ana Pérez', phone: '3001234567', consent: true, answers: base }
  assert.equal(submissionSchema.safeParse(valid).success, true)
  assert.equal(submissionSchema.safeParse({ ...valid, consent: false }).success, false)
  assert.equal(
    submissionSchema.safeParse({ ...valid, answers: { ...base, goal: 'otro' } }).success,
    false,
  )
  assert.equal(
    submissionSchema.safeParse({ ...valid, answers: { ...base, painLevel: 11 } }).success,
    false,
  )
})
