import test from 'node:test'
import assert from 'node:assert/strict'
import {
  attributionSchema,
  mergeFirstTouch,
  parseAttribution,
  slugify,
  trackedLink,
} from './attribution.ts'

test('parseAttribution reads utm and short parameters and normalises them', () => {
  assert.deepEqual(parseAttribution('?utm_source=Instagram&utm_content=Reel-Pilates_1'), {
    channel: 'instagram',
    content: 'reel-pilates_1',
  })
  assert.deepEqual(parseAttribution('?src=tiktok&c=video 7'), {
    channel: 'tiktok',
    content: 'video-7',
  })
  assert.deepEqual(parseAttribution('?ref=whatsapp'), { channel: 'whatsapp' })
  assert.equal(parseAttribution('?page=2'), null)
  assert.equal(parseAttribution(''), null)
})

test('parseAttribution strips dangerous characters and caps length', () => {
  const result = parseAttribution(`?utm_content=${encodeURIComponent('<script>alert(1)</script>')}`)
  assert.equal(result?.content, 'script-alert-1-script')
  const long = parseAttribution(`?utm_content=${'a'.repeat(200)}`)
  assert.equal(long?.content?.length, 60)
})

test('mergeFirstTouch keeps the first attribution', () => {
  const first = { channel: 'instagram', content: 'reel-1' }
  const second = { channel: 'tiktok', content: 'video-2' }
  assert.deepEqual(mergeFirstTouch(null, second), second)
  assert.deepEqual(mergeFirstTouch(first, second), first)
  assert.deepEqual(mergeFirstTouch({}, second), second)
  assert.equal(mergeFirstTouch(null, null), null)
})

test('slugify handles accents, punctuation and length', () => {
  assert.equal(slugify('Reel: Pilates para abuelas!'), 'reel-pilates-para-abuelas')
  assert.equal(slugify('  ¿Dolor de rodilla? Mira esto  '), 'dolor-de-rodilla-mira-esto')
  assert.equal(slugify('x'.repeat(100)).length, 60)
})

test('trackedLink builds a link the capture code can read back', () => {
  const link = trackedLink('https://example.com', 'instagram', 'reel-1', '/prevaloracion')
  assert.equal(link, 'https://example.com/prevaloracion?utm_source=instagram&utm_content=reel-1')
  assert.deepEqual(parseAttribution(new URL(link).search), {
    channel: 'instagram',
    content: 'reel-1',
  })
})

test('attributionSchema accepts clean values and rejects anything else', () => {
  assert.equal(
    attributionSchema.safeParse({ channel: 'instagram', content: 'reel-1' }).success,
    true,
  )
  assert.equal(attributionSchema.safeParse(undefined).success, true)
  assert.equal(attributionSchema.safeParse({ content: 'Reel 1!' }).success, false)
})
