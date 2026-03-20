import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const relationships = sqliteTable('relationships', {
  id: text('id').primaryKey(), // UUID
  parentAId: text('parent_a_id')
    .notNull()
    .references(() => users.id),
  parentBId: text('parent_b_id').references(() => users.id), // Nullable until partner joins
  inviteToken: text('invite_token'), // For partner invitation
  inviteExpiresAt: integer('invite_expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Relationship = typeof relationships.$inferSelect;
export type NewRelationship = typeof relationships.$inferInsert;
