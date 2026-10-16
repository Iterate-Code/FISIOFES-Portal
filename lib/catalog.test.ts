import test from 'node:test'
import assert from 'node:assert/strict'
import { CATALOG, formatCop, getCategory, startingPriceCop } from './catalog.ts'

test('desde is the cheapest single offer of each category', () => {
  assert.equal(startingPriceCop(getCategory('pilates')), 40_000)
  assert.equal(startingPriceCop(getCategory('entrenamiento-funcional')), 50_000)
  assert.equal(startingPriceCop(getCategory('fisioterapia')), 60_000)
  assert.equal(startingPriceCop(getCategory('bienestar')), 80_000)
  assert.equal(startingPriceCop(getCategory('procedimientos')), 170_000)
})

test('categories without single offers fall back to the cheapest package', () => {
  assert.equal(startingPriceCop(getCategory('dual')), 220_000)
  assert.equal(startingPriceCop(getCategory('pareja-grupo')), 700_000)
})

test('unconfirmed categories have no price and a consult note', () => {
  for (const slug of [
    'valoracion-funcional-longevidad',
    'tensamax',
    'empresas',
    'boutique-ortopedica',
  ]) {
    const category = getCategory(slug)
    assert.equal(startingPriceCop(category), null)
    assert.ok(category.consultNote)
  }
})

test('slugs are unique and every category has at least one offer', () => {
  const slugs = CATALOG.map((category) => category.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const category of CATALOG) assert.ok(category.offers.length > 0)
})

test('formatCop uses Colombian thousands separators', () => {
  assert.equal(formatCop(60_000), '$60.000')
  assert.equal(formatCop(1_400_000), '$1.400.000')
})
