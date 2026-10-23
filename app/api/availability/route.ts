import { inArray } from 'drizzle-orm'
import { getDb } from '../../../db'
import { classSlots } from '../../../db/schema'
import { getDailySlots, slotStart, type Service } from '../../../lib/booking-rules'
import { jsonError } from '../../../lib/api'
import { getCalendarSetup, realOccupancyForDay } from '../../../lib/calendar'
import { slotKey } from '../../../lib/calendar/parse'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date') ?? ''
  const service = url.searchParams.get('service') as Service
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !['pilates', 'training'].includes(service)) {
    return jsonError('Fecha o servicio inválido.')
  }

  const definitions = getDailySlots(date, service)
  if (!definitions.length) return Response.json({ slots: [] })
  // With the calendar connected, classes already in the team's real calendar take spots too.
  // If it is configured but unreachable we fail closed instead of risking double bookings.
  const setup = getCalendarSetup()
  let real: Record<string, number> = {}
  if (setup) {
    try {
      real = await realOccupancyForDay(setup, date)
    } catch (error) {
      console.error('Calendar read failed:', error instanceof Error ? error.message : error)
      return jsonError('No pudimos consultar la agenda. Inténtalo en unos minutos.', 503)
    }
  }
  const db = getDb()
  const stored = await db
    .select()
    .from(classSlots)
    .where(
      inArray(
        classSlots.id,
        definitions.map((slot) => slot.id),
      ),
    )
  const byId = new Map(stored.map((slot) => [slot.id, slot]))
  const now = Date.now()
  const slots = definitions
    .filter((slot) => slotStart(slot.date, slot.time).getTime() > now)
    .map((slot) => {
      const row = byId.get(slot.id)
      const taken =
        (row?.bookedCount ?? 0) + (real[slotKey(slot.date, slot.time, slot.service)] ?? 0)
      return {
        ...slot,
        instructor: row?.instructor ?? null,
        available: !row?.cancelled && taken < slot.capacity,
        spotsRemaining: Math.max(0, slot.capacity - taken),
      }
    })
  return Response.json({ slots, source: setup ? 'calendar' : 'portal' })
}
