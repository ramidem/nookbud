import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relationships } from './relationships';

export const children = sqliteTable('children', {
  id: text('id').primaryKey(), // UUID
  relationshipId: text('relationship_id')
    .notNull()
    .references(() => relationships.id),
  name: text('name').notNull(),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
