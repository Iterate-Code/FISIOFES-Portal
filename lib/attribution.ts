// Content attribution: every piece of content the team publishes gets a link such as
//   https://<site>/?utm_source=instagram&utm_content=reel-pilates-adulta
// The first link a person arrives with is remembered (first touch) and travels with their
// pre-assessment or registration, so the team can see which content brings people in.
import { z } from 'zod'

export type Attribution = { channel?: string; content?: string }

export const ATTRIBUTION_STORAGE_KEY = 'fisiofes_attr'

const token = (max: number) => z.string().regex(new RegExp(`^[a-z0-9_-]{1,${max}}$`))

/** Shape accepted by the API. Values are already normalised by the browser, but re-checked. */
export const attributionSchema = z
  .object({ channel: token(40).optional(), content: token(60).optional() })
  .optional()

function clean(value: string | null, max: number): string | undefined {
  if (!value) return undefined
  const text = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
  return text || undefined
}

/** Reads utm_source / utm_content (or the short forms src, ref, c) from a query string. */
export function parseAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search)
  const channel = clean(params.get('utm_source') ?? params.get('src') ?? params.get('ref'), 40)
  const content = clean(params.get('utm_content') ?? params.get('c'), 60)
  if (!channel && !content) return null
  return { ...(channel ? { channel } : {}), ...(content ? { content } : {}) }
}

/** First touch wins: once something is stored, later links do not overwrite it. */
export function mergeFirstTouch(
  stored: Attribution | null,
  incoming: Attribution | null,
): Attribution | null {
  if (stored && (stored.channel || stored.content)) return stored
  return incoming
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function trackedLink(origin: string, channel: string, slug: string, path = '/'): string {
  const params = new URLSearchParams({ utm_source: channel, utm_content: slug })
  return `${origin}${path}?${params}`
}
