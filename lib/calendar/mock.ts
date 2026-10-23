// Local-only calendar for demos and tests: deterministic "real" classes per day plus an
// in-memory list of events the portal creates. Enabled with CALENDAR_MOCK=1 in development.

import type { CalendarClient, NewEvent } from './google.ts'
import type { CalendarEvent } from './parse.ts'

const created: (CalendarEvent & { calendarId: string })[] = []

function hash(text: string): number {
  let value = 7
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) % 100003
  return value
}

/** Invented classes for a given Bogotá date, so occupancy varies by hour and service. */
function demoEvents(date: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const hour of ['06', '07', '08', '09', '10', '11', '16', '17', '18', '19']) {
    for (const service of ['PILATES', 'TRAINING']) {
      const people = hash(`${date}${hour}${service}`) % 6
      for (let index = 0; index < people; index += 1) {
        events.push({
          id: `mock-${date}-${hour}-${service}-${index}`,
          summary: `${service} CLIENTE ${index + 1}`,
          start: `${date}T${hour}:00:00-05:00`,
        })
      }
    }
    events.push({
      id: `mock-${date}-${hour}-cancel`,
      summary: 'PILATES CLIENTE X cancela',
      start: `${date}T${hour}:00:00-05:00`,
    })
  }
  return events
}

export function createMockCalendar(): CalendarClient {
  return {
    async listEvents(calendarId, fromIso, toIso) {
      const from = new Date(fromIso).getTime()
      const to = new Date(toIso).getTime()
      const days = new Set<string>()
      for (let at = from; at < to; at += 3_600_000) {
        days.add(new Date(at - 5 * 3_600_000).toISOString().slice(0, 10))
      }
      const base = [...days].flatMap(demoEvents)
      const mine = created.filter((event) => event.calendarId === calendarId)
      return [...base, ...mine].filter((event) => {
        const at = new Date(event.start).getTime()
        return at >= from && at < to
      })
    },
    async createEvent(calendarId, event: NewEvent) {
      const id = `mock-created-${created.length + 1}`
      created.push({
        id,
        calendarId,
        summary: event.summary,
        start: event.startIso,
        source: 'portal',
      })
      return id
    },
    async deleteEvent(_calendarId, eventId) {
      const index = created.findIndex((event) => event.id === eventId)
      if (index >= 0) created.splice(index, 1)
    },
  }
}

export function mockCreatedEvents() {
  return [...created]
}
