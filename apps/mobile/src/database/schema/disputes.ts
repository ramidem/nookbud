import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { entries } from './entries';
import { users } from './users';

export const disputes = sqliteTable('disputes', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  // UUID
  entryId: text('entry_id')
    .notNull()
    .references(() => entries.id),
  id: text('id').primaryKey(),
  raisedBy: text('raised_by')
    .notNull()
    .references(() => users.id),
  reasonText: text('reason_text').notNull(),
});

export const disputeResponses = sqliteTable('dispute_responses', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  // UUID
  disputeId: text('dispute_id')
    .notNull()
    .references(() => disputes.id),
  id: text('id').primaryKey(),
  respondedBy: text('responded_by')
    .notNull()
    .references(() => users.id),
  responseText: text('response_text').notNull(),
});

export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;
export type DisputeResponse = typeof disputeResponses.$inferSelect;
export type NewDisputeResponse = typeof disputeResponses.$inferInsert;
