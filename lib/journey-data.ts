// Loads everything the team needs to see "where is each person" and assembles it with the
// pure functions in journey.ts. Sized for a studio (hundreds of people), so it reads the
// tables whole instead of building per-person queries.
import { count, eq } from 'drizzle-orm'
import { getDb } from '../db'
import {
  appointmentRequests,
  bookings,
  classSlots,
  clients,
  contents,
  followups,
  prescreenings,
  touches,
} from '../db/schema'
import { bogotaDate } from './booking-dates'
import {
  STAGES,
  buildTimeline,
  computeStage,
  funnelCounts,
  personFlags,
  stageRank,
  type Flags,
  type PersonFacts,
  type Stage,
  type TimelineEvent,
} from './journey'

export type Person = {
  facts: PersonFacts
  stage: Stage
  flags: Flags
  timeline: TimelineEvent[]
  lastActivity: string | null
  plan: {
    planService: string
    creditsRemaining: number
    planExpiresAt: string
  } | null
}

export type ContentRow = {
  id: string
  slug: string
  title: string
  channel: string
  touches: number
  people: number
  preValorados: number
  reservaron: number
  asistieron: number
}

export async function loadJourney() {
  const db = getDb()
  const today = bogotaDate(new Date())
  const [
    clientRows,
    prescreeningRows,
    bookingRows,
    requestRows,
    followupRows,
    contentRows,
    touchRows,
  ] = await Promise.all([
    db.select().from(clients).limit(2000),
    db.select().from(prescreenings).limit(2000),
    db
      .select({
        id: bookings.id,
        clientId: bookings.clientId,
        status: bookings.status,
        createdAt: bookings.createdAt,
        attendedAt: bookings.attendedAt,
        service: classSlots.service,
        date: classSlots.date,
        time: classSlots.time,
      })
      .from(bookings)
      .innerJoin(classSlots, eq(classSlots.id, bookings.slotId))
      .limit(5000),
    db.select().from(appointmentRequests).limit(3000),
    db.select().from(followups).limit(5000),
    db.select().from(contents).limit(500),
    db
      .select({ slug: touches.contentSlug, total: count() })
      .from(touches)
      .groupBy(touches.contentSlug),
  ])

  const phoneByClientId = new Map(clientRows.map((client) => [client.id, client.phone]))
  const byPhone = new Map<string, PersonFacts>()
  const planByPhone = new Map<string, Person['plan']>()

  for (const client of clientRows) {
    byPhone.set(client.phone, {
      phone: client.phone,
      name: client.name,
      registered: true,
      registeredAt: client.createdAt,
      consentAt: client.consentAt,
      sourceChannel: client.sourceChannel,
      sourceContent: client.sourceContent,
      prescreenings: [],
      requests: [],
      bookings: [],
      followups: [],
    })
    planByPhone.set(client.phone, {
      planService: client.planService,
      creditsRemaining: client.creditsRemaining,
      planExpiresAt: client.planExpiresAt,
    })
  }

  // Oldest first, so the first-touch source of a lead is the earliest pre-assessment.
  for (const item of [...prescreeningRows].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    let facts = byPhone.get(item.phone)
    if (!facts) {
      facts = {
        phone: item.phone,
        name: item.name,
        registered: false,
        sourceChannel: item.sourceChannel,
        sourceContent: item.sourceContent,
        prescreenings: [],
        requests: [],
        bookings: [],
        followups: [],
      }
      byPhone.set(item.phone, facts)
    }
    facts.sourceChannel ??= item.sourceChannel
    facts.sourceContent ??= item.sourceContent
    facts.prescreenings.push({ id: item.id, createdAt: item.createdAt, route: item.route })
  }

  for (const item of requestRows) {
    const phone = phoneByClientId.get(item.clientId)
    if (!phone) continue
    byPhone.get(phone)?.requests.push({
      id: item.id,
      createdAt: item.createdAt,
      status: item.status,
      serviceSlug: item.serviceSlug,
    })
  }
  for (const item of bookingRows) {
    const phone = phoneByClientId.get(item.clientId)
    if (!phone) continue
    byPhone.get(phone)?.bookings.push({
      id: item.id,
      createdAt: item.createdAt,
      status: item.status,
      service: item.service,
      date: item.date,
      time: item.time,
      attendedAt: item.attendedAt,
    })
  }
  for (const item of followupRows) {
    byPhone.get(item.phone)?.followups.push({
      id: item.id,
      createdAt: item.createdAt,
      kind: item.kind,
      status: item.status,
      dueDate: item.dueDate,
      note: item.note,
      doneAt: item.doneAt,
    })
  }

  const people: Person[] = [...byPhone.values()].map((facts) => {
    const timeline = buildTimeline(facts)
    return {
      facts,
      stage: computeStage(facts),
      flags: personFlags(facts, today),
      timeline,
      lastActivity: timeline[0]?.at ?? null,
      plan: planByPhone.get(facts.phone) ?? null,
    }
  })
  people.sort((a, b) => Date.parse(b.lastActivity ?? '0') - Date.parse(a.lastActivity ?? '0'))

  const touchBySlug = new Map(touchRows.map((row) => [row.slug, row.total]))
  const contentStats: ContentRow[] = contentRows.map((piece) => {
    const mine = people.filter((person) => person.facts.sourceContent === piece.slug)
    const reached = (stage: Stage) =>
      mine.filter((person) => stageRank(person.stage) >= stageRank(stage)).length
    return {
      id: piece.id,
      slug: piece.slug,
      title: piece.title,
      channel: piece.channel,
      touches: touchBySlug.get(piece.slug) ?? 0,
      people: mine.length,
      preValorados: reached('pre_valorado'),
      reservaron: reached('reservo'),
      asistieron: reached('asistio'),
    }
  })

  return {
    today,
    people,
    contentStats,
    funnel: funnelCounts(people.map((person) => person.stage)),
    attention: {
      overdueFollowups: people.reduce((sum, person) => sum + person.flags.overdueFollowups, 0),
      pendingFollowups: people.reduce((sum, person) => sum + person.flags.pendingFollowups, 0),
      lapsed: people.filter((person) => person.flags.lapsed).length,
    },
    stages: STAGES,
  }
}
