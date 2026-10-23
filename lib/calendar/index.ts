import { createGoogleCalendar, type CalendarClient, type ServiceAccount } from './google'
import { createMockCalendar } from './mock'
import { occupancyFromEvents } from './parse'

export type CalendarSetup = {
  client: CalendarClient
  /** Real calendars whose classes count towards occupancy (read only). */
  readIds: string[]
  /** Calendar where the portal writes its bookings. Use a test calendar until the pilot is approved. */
  writeId: string | null
  mock: boolean
}

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Calendar integration is optional: with no configuration the portal keeps using its own
 * slot table. Env: GOOGLE_SERVICE_ACCOUNT_JSON (secret), GOOGLE_CALENDAR_READ_IDS,
 * GOOGLE_CALENDAR_WRITE_ID. CALENDAR_MOCK=1 enables a local demo calendar (development only).
 */
export function getCalendarSetup(): CalendarSetup | null {
  if (process.env.CALENDAR_MOCK === '1' && process.env.NODE_ENV === 'development') {
    return { client: createMockCalendar(), readIds: ['demo'], writeId: 'demo-test', mock: true }
  }
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const readIds = list(process.env.GOOGLE_CALENDAR_READ_IDS)
  if (!raw || readIds.length === 0) return null
  let account: ServiceAccount
  try {
    account = JSON.parse(raw) as ServiceAccount
  } catch {
    console.error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON')
    return null
  }
  if (!account.client_email || !account.private_key) return null
  return {
    client: createGoogleCalendar(account),
    readIds,
    writeId: process.env.GOOGLE_CALENDAR_WRITE_ID?.trim() || null,
    mock: false,
  }
}

/** Spots taken in the real calendars on one Bogotá date, keyed by slotKey(). Throws on failure. */
export async function realOccupancyForDay(
  setup: CalendarSetup,
  date: string,
): Promise<Record<string, number>> {
  const from = `${date}T00:00:00-05:00`
  const to = `${date}T23:59:59-05:00`
  const batches = await Promise.all(
    setup.readIds.map((calendarId) => setup.client.listEvents(calendarId, from, to)),
  )
  return occupancyFromEvents(batches.flat())
}
