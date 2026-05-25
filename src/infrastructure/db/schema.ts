import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import type { FlowDefinition } from '@/domain/flow/entity'

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
])

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'low',
  'normal',
  'high',
  'urgent',
])

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  notifyEmail: text('notify_email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  keywords: text('keywords').array().notNull().default([]),
  category: text('category'),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const flows = pgTable('flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  name: text('name').notNull(),
  definition: jsonb('definition').notNull().$type<FlowDefinition>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .references(() => tenants.id)
    .notNull(),
  flowId: uuid('flow_id').references(() => flows.id),
  senderEmail: text('sender_email').notNull(),
  senderName: text('sender_name'),
  category: text('category'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  priority: ticketPriorityEnum('priority').default('normal').notNull(),
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
})

export const ticketComments = pgTable('ticket_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id')
    .references(() => tickets.id)
    .notNull(),
  authorId: text('author_id').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type TenantRow = typeof tenants.$inferSelect
export type FaqRow = typeof faqs.$inferSelect
export type FlowRow = typeof flows.$inferSelect
export type TicketRow = typeof tickets.$inferSelect
export type TicketCommentRow = typeof ticketComments.$inferSelect
