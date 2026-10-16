// Passwordless login by one-time code. Pure helpers: no database or request access here.

export const CODE_LENGTH = 6
export const CODE_TTL_MS = 10 * 60 * 1000
export const MAX_CODE_ATTEMPTS = 5
export const MAX_CODES_PER_WINDOW = 3
export const CODE_WINDOW_MS = 10 * 60 * 1000
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const SESSION_COOKIE = 'fisiofes_session'

const encoder = new TextEncoder()

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Uniform random numeric code (rejection sampling avoids modulo bias). */
export function generateCode(length = CODE_LENGTH): string {
  const limit = 256 - (256 % 10)
  let code = ''
  while (code.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    for (const byte of bytes) {
      if (byte < limit && code.length < length) code += String(byte % 10)
    }
  }
  return code
}

export function generateToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)))
}

export async function sha256Hex(value: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))
}

/** Keyed hash so a leaked table cannot be brute-forced without the server secret. */
export async function hashCode(code: string, phone: string, secret: string): Promise<string> {
  if (!secret) throw new Error('AUTH_SECRET is not configured')
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${phone}:${code}`))
  return toHex(new Uint8Array(signature))
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1)
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return diff === 0
}

export type CodeRow = { expiresAt: string; attempts: number; consumed: boolean }
export type CodeState = 'ok' | 'expired' | 'locked' | 'used'

export function codeState(row: CodeRow, now = new Date()): CodeState {
  if (row.consumed) return 'used'
  if (new Date(row.expiresAt).getTime() <= now.getTime()) return 'expired'
  if (row.attempts >= MAX_CODE_ATTEMPTS) return 'locked'
  return 'ok'
}

export function normalizeCode(value: string): string {
  return value.replace(/\D/g, '')
}

export function sessionCookie(token: string, maxAgeSeconds: number, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=') || null
  }
  return null
}
