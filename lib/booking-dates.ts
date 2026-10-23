// Day picker helpers. All dates are Colombian calendar days (America/Bogota, UTC-5, no DST),
// independent of the visitor's device time zone.

const TIME_ZONE = 'America/Bogota'
const DAY_MS = 86_400_000

export type Day = { date: string; label: string }

/** Today's calendar date in Bogotá as YYYY-MM-DD. */
export function bogotaDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function longLabel(instant: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(instant)
}

/** Next `count` bookable days starting today. Sundays are skipped: the studio is closed. */
export function upcomingDays(now: Date, count = 7): Day[] {
  const today = bogotaDate(now)
  const noonToday = new Date(`${today}T12:00:00-05:00`).getTime()
  const days: Day[] = []
  for (let offset = 0; days.length < count; offset += 1) {
    const instant = new Date(noonToday + offset * DAY_MS)
    if (instant.getUTCDay() === 0) continue
    const label = offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : longLabel(instant)
    days.push({ date: bogotaDate(instant), label })
  }
  return days
}
