import test from 'node:test'
import assert from 'node:assert/strict'
import { createGoogleCalendar, signAssertion } from './google.ts'

async function makeAccount() {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey))
  const pem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(der).toString('base64')}\n-----END PRIVATE KEY-----\n`
  return {
    account: { client_email: 'portal@example.iam.gserviceaccount.com', private_key: pem },
    pair,
  }
}

const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString())

test('signAssertion builds a valid RS256 JWT for the service account', async () => {
  const { account, pair } = await makeAccount()
  const jwt = await signAssertion(account, 1_800_000_000)
  const [header, claims, signature] = jwt.split('.')
  assert.deepEqual(decode(header), { alg: 'RS256', typ: 'JWT' })
  const body = decode(claims)
  assert.equal(body.iss, account.client_email)
  assert.equal(body.aud, 'https://oauth2.googleapis.com/token')
  assert.equal(body.exp - body.iat, 3600)
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    pair.publicKey,
    Buffer.from(signature, 'base64url'),
    new TextEncoder().encode(`${header}.${claims}`),
  )
  assert.equal(ok, true)
})

function fakeFetch(handlers: (url: string, init?: RequestInit) => Response) {
  const calls: { url: string; init?: RequestInit }[] = []
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init })
    return handlers(String(url), init)
  }) as typeof fetch
  return { impl, calls }
}

const tokenResponse = () => Response.json({ access_token: 'tok', expires_in: 3600 })

test('listEvents maps events, skips cancelled/all-day and sends the bearer token', async () => {
  const { account } = await makeAccount()
  const { impl, calls } = fakeFetch((url) =>
    url.includes('oauth2')
      ? tokenResponse()
      : Response.json({
          items: [
            {
              id: 'a',
              summary: 'PILATES UNO',
              status: 'confirmed',
              start: { dateTime: '2026-10-23T16:00:00-05:00' },
            },
            {
              id: 'b',
              summary: 'PILATES DOS',
              status: 'cancelled',
              start: { dateTime: '2026-10-23T16:00:00-05:00' },
            },
            { id: 'c', summary: 'Feriado', start: { date: '2026-10-23' } },
            {
              id: 'd',
              summary: 'PILATES TRES',
              start: { dateTime: '2026-10-23T17:00:00-05:00' },
              extendedProperties: { private: { source: 'portal' } },
            },
          ],
        }),
  )
  const client = createGoogleCalendar(account, impl)
  const events = await client.listEvents(
    'cal@x.com',
    '2026-10-23T00:00:00-05:00',
    '2026-10-23T23:59:59-05:00',
  )
  assert.deepEqual(
    events.map((event) => [event.id, event.source]),
    [
      ['a', undefined],
      ['d', 'portal'],
    ],
  )
  const list = calls.find((call) => call.url.includes('/calendars/'))
  assert.ok(list?.url.includes('singleEvents=true'))
  assert.equal((list?.init?.headers as Record<string, string>).authorization, 'Bearer tok')
})

test('the access token is reused between calls', async () => {
  const { account } = await makeAccount()
  const { impl, calls } = fakeFetch((url) =>
    url.includes('oauth2') ? tokenResponse() : Response.json({ items: [] }),
  )
  const client = createGoogleCalendar(account, impl)
  await client.listEvents('c', 'a', 'b')
  await client.listEvents('c', 'a', 'b')
  assert.equal(calls.filter((call) => call.url.includes('oauth2')).length, 1)
})

test('createEvent tags the event as coming from the portal and deleteEvent tolerates 404', async () => {
  const { account } = await makeAccount()
  const { impl, calls } = fakeFetch((url, init) => {
    if (url.includes('oauth2')) return tokenResponse()
    if (init?.method === 'DELETE') return new Response(null, { status: 404 })
    return Response.json({ id: 'new-id' })
  })
  const client = createGoogleCalendar(account, impl)
  const id = await client.createEvent('test@x.com', {
    summary: 'PILATES ROSA',
    startIso: '2026-10-26T09:00:00-05:00',
    endIso: '2026-10-26T10:00:00-05:00',
    bookingId: 'b1',
  })
  assert.equal(id, 'new-id')
  const body = JSON.parse(
    String(
      calls.find((call) => call.init?.method === 'POST' && !call.url.includes('oauth2'))?.init
        ?.body,
    ),
  )
  assert.equal(body.extendedProperties.private.source, 'portal')
  assert.equal(body.extendedProperties.private.bookingId, 'b1')
  await client.deleteEvent('test@x.com', 'gone')
})

test('API errors are surfaced so the portal can fail closed', async () => {
  const { account } = await makeAccount()
  const { impl } = fakeFetch((url) =>
    url.includes('oauth2') ? tokenResponse() : new Response('no', { status: 403 }),
  )
  const client = createGoogleCalendar(account, impl)
  await assert.rejects(() => client.listEvents('c', 'a', 'b'), /403/)
})
