import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { spaces } from './spaces';
import { users } from './users';

export const SPACE_ROLES = ['owner', 'parent', 'guardian', 'lawyer', 'viewer'] as const;
export type SpaceRole = (typeof SPACE_ROLES)[number];

export const spaceMembers = sqliteTable('space_members', {
  id: text('id').primaryKey(),

  invitedBy: text('invited_by').references(() => users.id),

  joinedAt: integer('joined_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  role: text('role').notNull().$type<SpaceRole>().default('parent'),

  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id),

  userId: text('user_id')
    .notNull()
    .references(() => users.id),
});

export type SpaceMember = typeof spaceMembers.$inferSelect;
export type NewSpaceMember = typeof spaceMembers.$inferInsert;
