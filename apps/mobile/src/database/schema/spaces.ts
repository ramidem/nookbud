import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { users } from './users';

export const spaces = sqliteTable('spaces', {
  color: text('color').notNull().default('#6F8F7B'),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),

  emoji: text('emoji').notNull().default('🏠'),

  id: text('id').primaryKey(),

  name: text('name').notNull(),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Space = typeof spaces.$inferSelect;
export type NewSpace = typeof spaces.$inferInsert;
