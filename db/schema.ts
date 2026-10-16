import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

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
  contacted: integer('contacted', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
