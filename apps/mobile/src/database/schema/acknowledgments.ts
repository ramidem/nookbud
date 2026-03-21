import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { entries } from './entries';
import { users } from './users';

// Acknowledgment status enum
export const ACKNOWLEDGMENT_STATUSES = ['pending', 'acknowledged', 'disputed'] as const;
export type AcknowledgmentStatus = (typeof ACKNOWLEDGMENT_STATUSES)[number];

export const acknowledgments = sqliteTable('acknowledgments', {
  actedBy: text('acted_by').references(() => users.id),

  // Who acknowledged/disputed (null if pending)
  comment: text('comment'),

  // Optional comment with acknowledgment/dispute
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  // UUID
  entryId: text('entry_id')
    .notNull()
    .references(() => entries.id),

  id: text('id').primaryKey(),
  status: text('status').notNull().$type<AcknowledgmentStatus>().default('pending'),
});

export type Acknowledgment = typeof acknowledgments.$inferSelect;
export type NewAcknowledgment = typeof acknowledgments.$inferInsert;
