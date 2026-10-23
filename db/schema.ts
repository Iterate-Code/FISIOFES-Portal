import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').notNull().unique(),
  name: text('name').notNull(),
  email: text('email'),
  accessPinHash: text('access_pin_hash').notNull().default(''),
  planService: text('plan_service', { enum: ['pilates', 'training', 'dual'] })
    .notNull()
    .default('pilates'),
  creditsTotal: integer('credits_total').notNull().default(0),
  creditsRemaining: integer('credits_remaining').notNull().default(0),
  planExpiresAt: text('plan_expires_at').notNull().default('1970-01-01'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  // Set when the person accepts data processing at registration (Ley 1581 de 2012).
  consentAt: text('consent_at'),
  // First-touch attribution: which piece of content brought this person (see lib/attribution.ts).
  sourceChannel: text('source_channel'),
  sourceContent: text('source_content'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const classSlots = sqliteTable('class_slots', {
  id: text('id').primaryKey(),
  service: text('service', { enum: ['pilates', 'training'] }).notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  startsAt: text('starts_at').notNull(),
  capacity: integer('capacity').notNull(),
  bookedCount: integer('booked_count').notNull().default(0),
  instructor: text('instructor'),
  cancelled: integer('cancelled', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id),
    slotId: text('slot_id')
      .notNull()
      .references(() => classSlots.id),
    status: text('status', { enum: ['confirmed', 'cancelled', 'attended', 'no_show'] })
      .notNull()
      .default('confirmed'),
    cancellationToken: text('cancellation_token').notNull().unique(),
    creditRefunded: integer('credit_refunded', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    cancelledAt: text('cancelled_at'),
    // Mirror of the booking in Google Calendar (the portal's own record stays in this table).
    // Set by the team when marking attended / no_show.
    attendedAt: text('attended_at'),
    calendarEventId: text('calendar_event_id'),
    calendarSync: text('calendar_sync', { enum: ['none', 'ok', 'failed'] })
      .notNull()
      .default('none'),
  },
  (table) => [uniqueIndex('bookings_client_slot_unique').on(table.clientId, table.slotId)],
)

export const prescreenings = sqliteTable('prescreenings', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  // JSON of the validated answers; see lib/prescreening.ts.
  answers: text('answers').notNull(),
  route: text('route', { enum: ['llamada', 'recomendacion'] }).notNull(),
  redFlags: text('red_flags').notNull().default('[]'),
  recommendedSlug: text('recommended_slug').notNull(),
  questionnaireVersion: integer('questionnaire_version').notNull(),
  consentAt: text('consent_at').notNull(),
  sourceChannel: text('source_channel'),
  sourceContent: text('source_content'),
  contacted: integer('contacted', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const otpCodes = sqliteTable(
  'otp_codes',
  {
    id: text('id').primaryKey(),
    phone: text('phone').notNull(),
    // Keyed HMAC of the code (lib/auth.ts); the code itself is never stored.
    codeHash: text('code_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    attempts: integer('attempts').notNull().default(0),
    consumed: integer('consumed', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('otp_codes_phone_created_idx').on(table.phone, table.createdAt)],
)

export const sessions = sqliteTable('sessions', {
  // SHA-256 of the cookie token; the raw token only exists in the browser.
  tokenHash: text('token_hash').primaryKey(),
  clientId: integer('client_id')
    .notNull()
    .references(() => clients.id),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
})

export const appointmentRequests = sqliteTable('appointment_requests', {
  id: text('id').primaryKey(),
  clientId: integer('client_id')
    .notNull()
    .references(() => clients.id),
  // Slug of a category in lib/catalog.ts.
  serviceSlug: text('service_slug').notNull(),
  branch: text('branch', { enum: ['calarca', 'senior-mall', 'sin-preferencia'] }).notNull(),
  schedule: text('schedule', { enum: ['manana', 'tarde', 'sin-preferencia'] }).notNull(),
  preferredDate: text('preferred_date'),
  note: text('note'),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] })
    .notNull()
    .default('pending'),
  createdAt: text('created_at').notNull(),
})

// A piece of content (video, post, reel) the team publishes. Its slug travels in the link
// (?utm_source=<channel>&utm_content=<slug>) so every person can be traced back to it.
export const contents = sqliteTable('contents', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  channel: text('channel').notNull(),
  createdAt: text('created_at').notNull(),
})

// One row per first visit coming from a registered piece of content (top of the funnel).
export const touches = sqliteTable(
  'touches',
  {
    id: text('id').primaryKey(),
    contentSlug: text('content_slug').notNull(),
    channel: text('channel').notNull(),
    path: text('path').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('touches_content_idx').on(table.contentSlug)],
)

// Tasks for the team after a class or a lead: "write to her in 2 days", "ask what happened".
export const followups = sqliteTable(
  'followups',
  {
    id: text('id').primaryKey(),
    // Phone (+57...) is the person key: leads without an account also get follow-ups.
    phone: text('phone').notNull(),
    kind: text('kind', {
      enum: ['post_clase', 'inasistencia', 'pre_valoracion', 'solicitud', 'manual'],
    }).notNull(),
    bookingId: text('booking_id'),
    dueDate: text('due_date').notNull(),
    status: text('status', { enum: ['pending', 'done', 'skipped'] })
      .notNull()
      .default('pending'),
    note: text('note'),
    createdAt: text('created_at').notNull(),
    doneAt: text('done_at'),
  },
  (table) => [index('followups_phone_idx').on(table.phone)],
)
