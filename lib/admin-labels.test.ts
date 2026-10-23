import test from 'node:test'
import assert from 'node:assert/strict'
import { categoryTitle, summarizeAnswers, whatsappLink } from './admin-labels.ts'
import type { Answers } from './prescreening.ts'

const answers: Answers = {
  goal: 'dolor',
  painArea: 'cadera-rodilla',
  painLevel: 5,
  painDuration: 'mas-3-meses',
  falls: 'una-vez',
  conditions: ['presion', 'diabetes'],
  chestSymptoms: false,
  branch: 'calarca',
  schedule: 'manana',
}

test('summarizeAnswers writes one readable line per topic', () => {
  const lines = summarizeAnswers(answers)
  assert.deepEqual(lines, [
    'Objetivo: Aliviar un dolor',
    'Molestia: cadera o rodilla, dolor 5/10, hace más de 3 meses',
    'Caídas en el último año: una caída',
    'Síntomas de pecho al esfuerzo: No',
    'Condiciones: presión alta, diabetes',
    'Prefiere: Calarcá · Mañana',
  ])
})

test('summarizeAnswers handles no pain and no conditions', () => {
  const lines = summarizeAnswers({
    ...answers,
    painArea: 'ninguna',
    painLevel: 0,
    painDuration: 'no-aplica',
    conditions: [],
    chestSymptoms: true,
  })
  assert.equal(lines[1], 'Molestia: ninguna')
  assert.equal(lines[3], 'Síntomas de pecho al esfuerzo: Sí')
  assert.equal(lines[4], 'Condiciones: ninguna')
})

test('categoryTitle falls back to the slug for unknown categories', () => {
  assert.equal(categoryTitle('fisioterapia'), 'Fisioterapia y rehabilitación')
  assert.equal(categoryTitle('desconocida'), 'desconocida')
})

test('whatsappLink keeps digits only', () => {
  assert.equal(whatsappLink('+573205550101'), 'https://wa.me/573205550101')
})
