import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../db'
import { contents, touches } from '../../../db/schema'

const bodySchema = z.object({
  channel: z.string().regex(/^[a-z0-9_-]{1,40}$/),
  content: z.string().regex(/^[a-z0-9_-]{1,60}$/),
  path: z.string().max(120).startsWith('/'),
})

/**
 * Counts a first visit that arrived through a registered piece of content. Public by design,
 * so it only accepts slugs the team created in /admin and never reveals whether one exists.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return new Response(null, { status: 204 })
  const db = getDb()
  const [piece] = await db
    .select({ slug: contents.slug })
    .from(contents)
    .where(eq(contents.slug, parsed.data.content))
    .limit(1)
  if (piece) {
    await db.insert(touches).values({
      id: crypto.randomUUID(),
      contentSlug: piece.slug,
      channel: parsed.data.channel,
      path: parsed.data.path,
      createdAt: new Date().toISOString(),
    })
  }
  return new Response(null, { status: 204 })
}
