import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CODE_LENGTH,
  MAX_CODE_ATTEMPTS,
  codeState,
  generateCode,
  generateToken,
  hashCode,
  normalizeCode,
  readCookie,
  safeEqual,
  sessionCookie,
} from './auth.ts'

test('generateCode returns a numeric code of the requested length', () => {
  for (let run = 0; run < 200; run += 1) assert.match(generateCode(), /^\d{6}$/)
  assert.equal(generateCode(8).length, 8)
  assert.equal(CODE_LENGTH, 6)
})

test('generateToken is 64 hex chars and unique', () => {
  const a = generateToken()
  assert.match(a, /^[0-9a-f]{64}$/)
  assert.notEqual(a, generateToken())
})

test('hashCode is deterministic, keyed and bound to the phone', async () => {
  const base = await hashCode('123456', '+573001234567', 'secret-a')
  assert.equal(base, await hashCode('123456', '+573001234567', 'secret-a'))
  assert.notEqual(base, await hashCode('123456', '+573001234567', 'secret-b'))
  assert.notEqual(base, await hashCode('123456', '+573009999999', 'secret-a'))
  assert.notEqual(base, await hashCode('654321', '+573001234567', 'secret-a'))
  await assert.rejects(() => hashCode('123456', '+573001234567', ''))
})

test('safeEqual compares strings in full', () => {
  assert.equal(safeEqual('abc', 'abc'), true)
  assert.equal(safeEqual('abc', 'abd'), false)
  assert.equal(safeEqual('abc', 'abcd'), false)
})

test('codeState covers used, expired, locked and ok', () => {
  const now = new Date('2026-10-16T12:00:00Z')
  const future = '2026-10-16T12:05:00Z'
  const past = '2026-10-16T11:59:00Z'
  assert.equal(codeState({ expiresAt: future, attempts: 0, consumed: false }, now), 'ok')
  assert.equal(codeState({ expiresAt: future, attempts: 0, consumed: true }, now), 'used')
  assert.equal(codeState({ expiresAt: past, attempts: 0, consumed: false }, now), 'expired')
  assert.equal(
    codeState({ expiresAt: future, attempts: MAX_CODE_ATTEMPTS, consumed: false }, now),
    'locked',
  )
})

test('normalizeCode strips spaces and separators', () => {
  assert.equal(normalizeCode('123 456'), '123456')
  assert.equal(normalizeCode(' 12-34-56 '), '123456')
})

test('session cookie is HttpOnly, SameSite=Lax and Secure when asked', () => {
  const cookie = sessionCookie('tok', 60, true)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Lax/)
  assert.match(cookie, /Secure/)
  assert.doesNotMatch(sessionCookie('tok', 60, false), /Secure/)
})

test('readCookie finds a cookie by name', () => {
  assert.equal(readCookie('a=1; fisiofes_session=abc; b=2', 'fisiofes_session'), 'abc')
  assert.equal(readCookie('a=1', 'fisiofes_session'), null)
  assert.equal(readCookie(null, 'fisiofes_session'), null)
})
