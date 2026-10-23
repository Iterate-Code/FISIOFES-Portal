import test from 'node:test'
import assert from 'node:assert/strict'
import {
  eventTitle,
  occupancyFromEvents,
  parseTitle,
  slotKey,
  type CalendarEvent,
} from './parse.ts'

// Titles copied from the real calendar's conventions, with invented names.
test('parseTitle recognises the real naming conventions', () => {
  assert.deepEqual(parseTitle('PILATES ANA GOMEZ'), { service: 'pilates', cancelled: false })
  assert.deepEqual(parseTitle('pilates Ana Gomez '), { service: 'pilates', cancelled: false })
  assert.deepEqual(parseTitle(' PILATES LINA VALENCIA cancela por temas laborales'), {
    service: 'pilates',
    cancelled: true,
  })
  assert.deepEqual(parseTitle('TRAINING SANDRA PEREZ'), { service: 'training', cancelled: false })
  assert.deepEqual(parseTitle('PILATES CORTESIA CAROL PEREZ 3000000000'), {
    service: 'pilates',
    cancelled: false,
  })
  assert.deepEqual(parseTitle('omar perez arl sura (cancela)'), { service: null, cancelled: false })
})

test('parseTitle ignores blocks that are not a person', () => {
  assert.equal(parseTitle('NO DUALES ').service, null)
  assert.equal(parseTitle('NO DUALES').service, null)
  assert.equal(parseTitle('MALL MASAJE DESCONTRACTURANTE JUAN PEREZ').service, null)
})

const at = (id: string, summary: string, start: string, source?: string): CalendarEvent => ({
  id,
  summary,
  start,
  source,
})

test('occupancyFromEvents counts people per hour and service in Bogotá time', () => {
  const events = [
    at('1', 'PILATES A UNO', '2026-10-23T16:00:00-05:00'),
    at('2', 'PILATES B DOS', '2026-10-23T16:00:00-05:00'),
    at('3', 'pilates c tres', '2026-10-23T16:30:00-05:00'),
    at('4', 'TRAINING D CUATRO', '2026-10-23T16:00:00-05:00'),
    at('5', 'NO DUALES ', '2026-10-23T16:00:00-05:00'),
    at('6', 'PILATES E CINCO cancela', '2026-10-23T16:00:00-05:00'),
    at('7', 'PILATES F SEIS', '2026-10-23T17:00:00-05:00'),
  ]
  const taken = occupancyFromEvents(events)
  assert.equal(taken[slotKey('2026-10-23', '16:00', 'pilates')], 3)
  assert.equal(taken[slotKey('2026-10-23', '16:00', 'training')], 1)
  assert.equal(taken[slotKey('2026-10-23', '17:00', 'pilates')], 1)
})

test('occupancyFromEvents normalises other offsets to Bogotá and skips portal events', () => {
  // 21:00Z is 16:00 in Bogotá.
  const taken = occupancyFromEvents([
    at('1', 'PILATES UNO', '2026-10-23T21:00:00Z'),
    at('2', 'PILATES DOS', '2026-10-23T16:00:00-05:00', 'portal'),
    at('3', 'PILATES TRES', 'not a date'),
  ])
  assert.deepEqual(taken, { [slotKey('2026-10-23', '16:00', 'pilates')]: 1 })
})

test('eventTitle follows the team convention', () => {
  assert.equal(eventTitle('pilates', '  Rosa Prueba '), 'PILATES ROSA PRUEBA')
  assert.equal(eventTitle('training', 'Ana'), 'TRAINING ANA')
})
