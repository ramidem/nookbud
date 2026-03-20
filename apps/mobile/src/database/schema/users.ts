import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  // ISO 4217
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  defaultCurrency: text('default_currency').notNull().default('USD'),

  displayName: text('display_name').notNull(),

  // UUID
  email: text('email'),

  id: text('id').primaryKey(),
  timezone: text('timezone').notNull().default('UTC'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
