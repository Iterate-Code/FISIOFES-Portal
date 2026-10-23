// Reads the team's real Google Calendar the way they use it: one event per person per hour,
// titled "PILATES <NAME>" or "TRAINING <NAME>". Cancelled classes stay in the calendar with
// "cancela" in the title. Other events (e.g. "NO DUALES" blocks) do not take a spot.

export type CalendarService = 'pilates' | 'training'

export type CalendarEvent = {
  id: string
  summary: string
  /** ISO date-time with offset, e.g. 2026-10-23T16:00:00-05:00. All-day events are ignored. */
  start: string
  /** Set on events the portal created, so they are not counted twice (DB already counts them). */
  source?: string
}

const TIME_ZONE = 'America/Bogota'

export function parseTitle(summary: string): {
  service: CalendarService | null
  cancelled: boolean
} {
  const match = /^\s*(pilates|training|entrenamiento)\b/i.exec(summary)
  if (!match) return { service: null, cancelled: false }
  const word = match[1].toLowerCase()
  return {
    service: word === 'pilates' ? 'pilates' : 'training',
    cancelled: /cancel/i.test(summary),
  }
}

const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** Slot key used everywhere in the portal: YYYY-MM-DD:HH:MM:service. */
export function slotKey(date: string, time: string, service: CalendarService): string {
  return `${date}:${time}:${service}`
}

/** Spots taken per slot by people already in the real calendar (cancelled ones excluded). */
export function occupancyFromEvents(events: CalendarEvent[]): Record<string, number> {
  const taken: Record<string, number> = {}
  for (const event of events) {
    if (event.source === 'portal') continue
    const { service, cancelled } = parseTitle(event.summary)
    if (!service || cancelled) continue
    const instant = new Date(event.start)
    if (Number.isNaN(instant.getTime())) continue
    // Classes run on a 1-hour grid; an event starting at 16:30 still takes a spot of the 16:00 hour.
    const hour = timeFormat.format(instant).slice(0, 2)
    const key = slotKey(dateFormat.format(instant), `${hour}:00`, service)
    taken[key] = (taken[key] ?? 0) + 1
  }
  return taken
}

/** Title the portal writes, matching the team's convention so the calendar stays readable. */
export function eventTitle(service: CalendarService, name: string): string {
  const label = service === 'pilates' ? 'PILATES' : 'TRAINING'
  return `${label} ${name.trim().toUpperCase()}`
}
