import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { relationships } from './relationships';

export const children = sqliteTable('children', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),

  id: text('id').primaryKey(),

  name: text('name').notNull(),
  // UUID
  relationshipId: text('relationship_id')
    .notNull()
    .references(() => relationships.id),
});

export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
