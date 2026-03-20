import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { users } from './users';

export const relationships = sqliteTable('relationships', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  id: text('id').primaryKey(),

  // For partner invitation
  inviteExpiresAt: integer('invite_expires_at', { mode: 'timestamp' }),

  // Nullable until partner joins
  inviteToken: text('invite_token'),

  // UUID
  parentAId: text('parent_a_id')
    .notNull()
    .references(() => users.id),

  parentBId: text('parent_b_id').references(() => users.id),
});

export type Relationship = typeof relationships.$inferSelect;
export type NewRelationship = typeof relationships.$inferInsert;
