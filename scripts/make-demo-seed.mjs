// Prints SQL with invented people so a demo deployment looks alive (board, files, follow-ups).
// Dates are relative to today (America/Bogota), so the demo never looks stale.
//   node scripts/make-demo-seed.mjs > demo-seed.sql
// All names and phone numbers are fake (+57300000xxxx). Never run this on the real database.

const DAY = 86_400_000
const bogota = (date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(date)
const today = bogota(new Date())
const addDays = (date, days) =>
  new Date(new Date(`${date}T12:00:00Z`).getTime() + days * DAY).toISOString().slice(0, 10)
// Moves a date off Sunday (the studio is closed).
const weekday = (date) => {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay()
  return day === 0 ? addDays(date, 1) : date
}
const at = (date, time = '12:00') => new Date(`${date}T${time}:00-05:00`).toISOString()
const q = (value) => (value === null || value === undefined ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`)
const out = []
const run = (sql) => out.push(`${sql};`)

const phone = (n) => `+5730000000${String(n).padStart(2, '0')}`
let counter = 0
const id = (prefix) => `${prefix}-demo-${String((counter += 1)).padStart(3, '0')}`

const contents = [
  ['reel-pilates-para-abuelas', 'Reel: Pilates para abuelas', 'instagram', 38],
  ['video-dolor-de-rodilla', 'Video: Dolor de rodilla', 'tiktok', 22],
  ['post-primera-clase', 'Post: Tu primera clase', 'facebook', 9],
]
for (const [slug, title, channel, visits] of contents) {
  run(`INSERT INTO contents (id, slug, title, channel, created_at) VALUES (${q(id('content'))}, ${q(slug)}, ${q(title)}, ${q(channel)}, ${q(at(addDays(today, -40)))})`)
  for (let index = 0; index < visits; index += 1) {
    run(`INSERT INTO touches (id, content_slug, channel, path, created_at) VALUES (${q(id('touch'))}, ${q(slug)}, ${q(channel)}, ${q(index % 3 ? '/' : '/prevaloracion')}, ${q(at(addDays(today, -(index % 30) - 1), '10:00'))})`)
  }
}

const answers = (goal, area, level, duration, falls, conditions, chest) =>
  JSON.stringify({
    goal, painArea: area, painLevel: level, painDuration: duration, falls, conditions,
    chestSymptoms: chest, branch: 'senior-mall', schedule: 'manana',
  })

// registered: name, phone number, plan, source, daysAgo created
const people = [
  { n: 1, name: 'Rosa Demo', plan: ['dual', 8, 4], source: ['instagram', 'reel-pilates-para-abuelas'], created: 40 },
  { n: 2, name: 'Luis Demo', plan: ['pilates', 4, 3], source: ['tiktok', 'video-dolor-de-rodilla'], created: 25 },
  { n: 3, name: 'Marta Demo', plan: ['pilates', 4, 2], source: ['instagram', 'reel-pilates-para-abuelas'], created: 45 },
  { n: 4, name: 'Jorge Demo', plan: ['training', 8, 7], source: ['instagram', 'reel-pilates-para-abuelas'], created: 6 },
  { n: 5, name: 'Elena Demo', plan: null, source: ['tiktok', 'video-dolor-de-rodilla'], created: 5 },
  { n: 6, name: 'Pablo Demo', plan: null, source: ['facebook', 'post-primera-clase'], created: 4 },
  { n: 7, name: 'Clara Demo', plan: null, source: ['instagram', 'reel-pilates-para-abuelas'], created: 2 },
  { n: 8, name: 'Hugo Demo', plan: ['pilates', 4, 3], source: ['facebook', 'post-primera-clase'], created: 12 },
]
for (const p of people) {
  const [service, total, left] = p.plan ?? ['pilates', 0, 0]
  run(`INSERT INTO clients (phone, name, plan_service, credits_total, credits_remaining, plan_expires_at, active, created_at, updated_at, consent_at, source_channel, source_content) VALUES (${q(phone(p.n))}, ${q(p.name)}, ${q(service)}, ${total}, ${left}, ${q(p.plan ? addDays(today, 20) : '1970-01-01')}, 1, ${q(at(addDays(today, -p.created)))}, ${q(at(today))}, ${q(at(addDays(today, -p.created)))}, ${q(p.source[0])}, ${q(p.source[1])})`)
}

const prescreening = (n, name, daysAgo, route, flags, slug, source, a) =>
  run(`INSERT INTO prescreenings (id, name, phone, answers, route, red_flags, recommended_slug, questionnaire_version, consent_at, source_channel, source_content, contacted, created_at) VALUES (${q(id('pre'))}, ${q(name)}, ${q(phone(n))}, ${q(a)}, ${q(route)}, ${q(JSON.stringify(flags))}, ${q(slug)}, 1, ${q(at(addDays(today, -daysAgo)))}, ${q(source?.[0] ?? null)}, ${q(source?.[1] ?? null)}, ${route === 'llamada' ? 0 : 1}, ${q(at(addDays(today, -daysAgo), '09:30'))})`)

prescreening(4, 'Jorge Demo', 7, 'recomendacion', [], 'pilates', ['instagram', 'reel-pilates-para-abuelas'], answers('fuerza', 'ninguna', 0, 'no-aplica', 'no', [], false))
prescreening(5, 'Elena Demo', 5, 'llamada', ['caidas-repetidas'], 'fisioterapia', ['tiktok', 'video-dolor-de-rodilla'], answers('dolor', 'cadera-rodilla', 6, 'mas-3-meses', 'varias', ['presion'], false))
prescreening(6, 'Pablo Demo', 4, 'recomendacion', [], 'valoracion-funcional-longevidad', ['facebook', 'post-primera-clase'], answers('longevidad', 'ninguna', 0, 'no-aplica', 'una-vez', [], false))
// Leads without an account
prescreening(9, 'Ana Lead Demo', 3, 'recomendacion', [], 'pilates', ['instagram', 'reel-pilates-para-abuelas'], answers('fuerza', 'ninguna', 0, 'no-aplica', 'no', [], false))
prescreening(10, 'Tomás Lead Demo', 2, 'llamada', ['sintomas-pecho'], 'valoracion-funcional-longevidad', ['tiktok', 'video-dolor-de-rodilla'], answers('longevidad', 'ninguna', 0, 'no-aplica', 'no', ['cardiaca'], true))
prescreening(11, 'Sofía Lead Demo', 1, 'recomendacion', [], 'fisioterapia', null, answers('dolor', 'cuello-espalda', 5, 'seis-semanas-3-meses', 'no', [], false))

const slotDone = new Set()
const booking = (n, daysFromToday, time, status, service = 'pilates') => {
  const date = weekday(addDays(today, daysFromToday))
  const slotId = `${date}:${time}:${service}`
  if (!slotDone.has(slotId)) {
    slotDone.add(slotId)
    run(`INSERT INTO class_slots (id, service, date, time, starts_at, capacity, booked_count, cancelled, created_at) VALUES (${q(slotId)}, ${q(service)}, ${q(date)}, ${q(time)}, ${q(at(date, time))}, ${service === 'pilates' ? 5 : 4}, 1, 0, ${q(at(addDays(today, -60)))})`)
  }
  const bookingId = id('booking')
  const past = status === 'attended' || status === 'no_show'
  run(`INSERT INTO bookings (id, client_id, slot_id, status, cancellation_token, credit_refunded, created_at, attended_at, calendar_sync) VALUES (${q(bookingId)}, (SELECT id FROM clients WHERE phone = ${q(phone(n))}), ${q(slotId)}, ${q(status)}, ${q(`token-${bookingId}`)}, ${status === 'cancelled' ? 1 : 0}, ${q(at(addDays(date, -3), '15:00'))}, ${past ? q(at(date, time)) : 'NULL'}, 'none')`)
  return bookingId
}

for (const offset of [-25, -18, -11, -4]) booking(1, offset, '09:00', 'attended')
booking(1, 3, '09:00', 'confirmed')
booking(2, -5, '07:00', 'attended')
booking(3, -20, '17:00', 'attended')
booking(4, 1, '10:00', 'confirmed', 'training')
booking(4, -9, '10:00', 'cancelled', 'training')
const missed = booking(8, -1, '18:00', 'no_show')

run(`INSERT INTO appointment_requests (id, client_id, service_slug, branch, schedule, preferred_date, note, status, created_at) VALUES (${q(id('req'))}, (SELECT id FROM clients WHERE phone = ${q(phone(5))}), 'fisioterapia', 'calarca', 'manana', NULL, 'Dolor de rodilla al subir escaleras', 'pending', ${q(at(addDays(today, -5), '11:00'))})`)
run(`INSERT INTO appointment_requests (id, client_id, service_slug, branch, schedule, preferred_date, note, status, created_at) VALUES (${q(id('req'))}, (SELECT id FROM clients WHERE phone = ${q(phone(6))}), 'valoracion-funcional-longevidad', 'senior-mall', 'tarde', NULL, NULL, 'confirmed', ${q(at(addDays(today, -4), '16:00'))})`)

const followup = (n, kind, due, status, note, bookingId = null) =>
  run(`INSERT INTO followups (id, phone, kind, booking_id, due_date, status, note, created_at, done_at) VALUES (${q(id('followup'))}, ${q(phone(n))}, ${q(kind)}, ${q(bookingId)}, ${q(due)}, ${q(status)}, ${q(note)}, ${q(at(addDays(today, -3), '17:00'))}, ${status === 'done' ? q(at(addDays(today, -2), '10:00')) : 'NULL'})`)

followup(1, 'post_clase', addDays(today, -2), 'done', 'Preguntar como se sintio e invitar a reservar la proxima clase.')
followup(1, 'post_clase', addDays(today, 1), 'pending', 'Preguntar como se sintio e invitar a reservar la proxima clase.')
followup(2, 'post_clase', addDays(today, -2), 'pending', 'Preguntar como se sintio e invitar a reservar la proxima clase.')
followup(8, 'inasistencia', today, 'pending', 'Preguntar que paso y ofrecer reagendar.', missed)
followup(5, 'manual', addDays(today, 1), 'pending', 'Llamar antes de agendar: caidas repetidas.')

console.log(out.join('\n'))
