// Minimal Google Calendar client for Cloudflare Workers: a service account signs a JWT with
// WebCrypto (RS256), exchanges it for an access token and calls the Calendar REST API.
// No googleapis dependency. The calendar owner must share each calendar with the service
// account's e-mail (read-only for the real calendar, "make changes to events" for the one we write).

import type { CalendarEvent } from './parse.ts'

export type ServiceAccount = { client_email: string; private_key: string }

export type NewEvent = {
  summary: string
  description?: string
  startIso: string
  endIso: string
  bookingId: string
}

export interface CalendarClient {
  listEvents(calendarId: string, fromIso: string, toIso: string): Promise<CalendarEvent[]>
  createEvent(calendarId: string, event: NewEvent): Promise<string>
  deleteEvent(calendarId: string, eventId: string): Promise<void>
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/calendar'
const API = 'https://www.googleapis.com/calendar/v3/calendars'
const TIME_ZONE = 'America/Bogota'

const encoder = new TextEncoder()

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '')
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes.buffer
}

/** Builds the signed JWT assertion Google expects from a service account. */
export async function signAssertion(account: ServiceAccount, nowSeconds: number): Promise<string> {
  const header = base64Url(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))
  const claims = base64Url(
    encoder.encode(
      JSON.stringify({
        iss: account.client_email,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: nowSeconds,
        exp: nowSeconds + 3600,
      }),
    ),
  )
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(account.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(`${header}.${claims}`),
  )
  return `${header}.${claims}.${base64Url(new Uint8Array(signature))}`
}

type FetchLike = typeof fetch

type RawEvent = {
  id: string
  summary?: string
  status?: string
  start?: { dateTime?: string }
  extendedProperties?: { private?: Record<string, string> }
}

export function createGoogleCalendar(
  account: ServiceAccount,
  fetchImpl: FetchLike = fetch,
): CalendarClient {
  let cached: { token: string; expiresAt: number } | null = null

  async function token(): Promise<string> {
    const now = Date.now()
    if (cached && cached.expiresAt > now + 60_000) return cached.token
    const assertion = await signAssertion(account, Math.floor(now / 1000))
    const response = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    })
    if (!response.ok) throw new Error(`Google token request failed (${response.status})`)
    const data = (await response.json()) as { access_token: string; expires_in: number }
    cached = { token: data.access_token, expiresAt: now + data.expires_in * 1000 }
    return cached.token
  }

  async function call(url: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetchImpl(url, {
      ...init,
      headers: { ...init.headers, authorization: `Bearer ${await token()}` },
    })
    return response
  }

  return {
    async listEvents(calendarId, fromIso, toIso) {
      const params = new URLSearchParams({
        timeMin: fromIso,
        timeMax: toIso,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
        fields: 'items(id,summary,status,start,extendedProperties)',
      })
      const response = await call(`${API}/${encodeURIComponent(calendarId)}/events?${params}`)
      if (!response.ok) throw new Error(`Google Calendar list failed (${response.status})`)
      const data = (await response.json()) as { items?: RawEvent[] }
      return (data.items ?? [])
        .filter((item) => item.status !== 'cancelled' && item.start?.dateTime)
        .map((item) => ({
          id: item.id,
          summary: item.summary ?? '',
          start: item.start?.dateTime as string,
          source: item.extendedProperties?.private?.source,
        }))
    },

    async createEvent(calendarId, event) {
      const response = await call(`${API}/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.startIso, timeZone: TIME_ZONE },
          end: { dateTime: event.endIso, timeZone: TIME_ZONE },
          extendedProperties: { private: { source: 'portal', bookingId: event.bookingId } },
        }),
      })
      if (!response.ok) throw new Error(`Google Calendar create failed (${response.status})`)
      return ((await response.json()) as { id: string }).id
    },

    async deleteEvent(calendarId, eventId) {
      const response = await call(
        `${API}/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        { method: 'DELETE' },
      )
      // 404/410: already gone, which is what we wanted.
      if (!response.ok && response.status !== 404 && response.status !== 410) {
        throw new Error(`Google Calendar delete failed (${response.status})`)
      }
    },
  }
}
