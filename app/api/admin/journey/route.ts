import { eq } from 'drizzle-orm'
import { getDb } from '../../../../db'
import { prescreenings } from '../../../../db/schema'
import { summarizeAnswers } from '../../../../lib/admin-labels'
import { jsonError, requireAdmin } from '../../../../lib/api'
import { STAGE_LABELS } from '../../../../lib/journey'
import { loadJourney } from '../../../../lib/journey-data'
import { answersSchema } from '../../../../lib/prescreening'

/**
 * Admin only. Without `phone`: board (funnel, attention, people, content stats).
 * With `phone`: the full file of one person, with the merged timeline.
 */
export async function GET(request: Request) {
  if (!(await requireAdmin())) return jsonError('No autorizado.', 403)
  const journey = await loadJourney()
  const phone = new URL(request.url).searchParams.get('phone')

  if (phone) {
    const person = journey.people.find((item) => item.facts.phone === phone)
    if (!person) return jsonError('Persona no encontrada.', 404)
    const sheets = await getDb().select().from(prescreenings).where(eq(prescreenings.phone, phone))
    return Response.json({
      today: journey.today,
      person: {
        phone: person.facts.phone,
        name: person.facts.name,
        registered: person.facts.registered,
        stage: person.stage,
        stageLabel: STAGE_LABELS[person.stage],
        sourceChannel: person.facts.sourceChannel ?? null,
        sourceContent: person.facts.sourceContent ?? null,
        flags: person.flags,
        plan: person.plan,
      },
      timeline: person.timeline,
      followups: person.facts.followups,
      prescreenings: sheets
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((sheet) => {
          const parsed = answersSchema.safeParse(JSON.parse(sheet.answers))
          return {
            id: sheet.id,
            createdAt: sheet.createdAt,
            route: sheet.route,
            redFlags: JSON.parse(sheet.redFlags) as string[],
            lines: parsed.success ? summarizeAnswers(parsed.data) : [],
          }
        }),
    })
  }

  return Response.json({
    today: journey.today,
    funnel: journey.funnel,
    attention: journey.attention,
    contents: journey.contentStats,
    people: journey.people.slice(0, 500).map((person) => ({
      phone: person.facts.phone,
      name: person.facts.name,
      registered: person.facts.registered,
      stage: person.stage,
      stageLabel: STAGE_LABELS[person.stage],
      sourceContent: person.facts.sourceContent ?? null,
      sourceChannel: person.facts.sourceChannel ?? null,
      pendingFollowups: person.flags.pendingFollowups,
      overdueFollowups: person.flags.overdueFollowups,
      lapsed: person.flags.lapsed,
      lastActivity: person.lastActivity,
    })),
  })
}
