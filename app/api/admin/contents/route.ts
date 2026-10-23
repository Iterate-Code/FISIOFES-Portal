import { desc } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../../../db'
import { contents } from '../../../../db/schema'
import { jsonError, requireAdmin } from '../../../../lib/api'
import { slugify } from '../../../../lib/attribution'

const bodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  channel: z.string().regex(/^[a-z0-9_-]{2,40}$/),
})

export async function GET() {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const rows = await getDb().select().from(contents).orderBy(desc(contents.createdAt)).limit(500)
  return Response.json({ contents: rows })
}

/** Registers a piece of content and returns its slug, used in the tracked links. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError('Escribe un título y elige el canal.')
  const base = slugify(parsed.data.title)
  if (!base) return jsonError('El título debe tener letras o números.')

  const db = getDb()
  const taken = new Set(
    (await db.select({ slug: contents.slug }).from(contents)).map((r) => r.slug),
  )
  let slug = base
  for (let attempt = 2; taken.has(slug); attempt += 1) slug = `${base.slice(0, 55)}-${attempt}`
  const row = {
    id: crypto.randomUUID(),
    slug,
    title: parsed.data.title,
    channel: parsed.data.channel,
    createdAt: new Date().toISOString(),
  }
  await db.insert(contents).values(row)
  return Response.json({ content: row }, { status: 201 })
}
