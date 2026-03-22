import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const USER_ROLES = ['mother', 'father', 'guardian', 'other'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_DISPLAY: Record<UserRole, string> = {
  father: 'Father',
  guardian: 'Guardian',
  mother: 'Mother',
  other: 'Other',
};

export const users = sqliteTable('users', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  // Timezone and currency auto-detected; editable in settings
  defaultCurrency: text('default_currency').notNull().default('USD'),

  email: text('email'),

  firstName: text('first_name').notNull(),

  // UUID
  id: text('id').primaryKey(),

  lastName: text('last_name').notNull(),

  middleName: text('middle_name'),

  role: text('role').$type<UserRole>(),

  timezone: text('timezone').notNull().default('UTC'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
