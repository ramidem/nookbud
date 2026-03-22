import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { spaces } from './spaces';

export const CHILD_ROLES = [
  'father',
  'mother',
  'step-father',
  'step-mother',
  'grandfather',
  'grandmother',
  'guardian',
  'foster-parent',
  'aunt-uncle',
  'other',
] as const;

export type ChildRole = (typeof CHILD_ROLES)[number];

export const CHILD_ROLE_DISPLAY: Record<ChildRole, string> = {
  'aunt-uncle': 'Aunt / Uncle',
  father: 'Father',
  'foster-parent': 'Foster Parent',
  grandfather: 'Grandfather',
  grandmother: 'Grandmother',
  guardian: 'Guardian',
  mother: 'Mother',
  other: 'Other',
  'step-father': 'Step-father',
  'step-mother': 'Step-mother',
};

export const children = sqliteTable('children', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),

  id: text('id').primaryKey(),

  name: text('name').notNull(),

  /** Caregiver's relationship to this child */
  role: text('role').$type<ChildRole>(),

  // UUID
  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id),
});

export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
