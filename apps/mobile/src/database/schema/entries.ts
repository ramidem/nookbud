import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relationships } from './relationships';
import { children } from './children';
import { users } from './users';

// Entry types enum (stored as text in SQLite)
export const ENTRY_TYPES = [
  'expense',
  'event',
  'agreement',
  'communication',
  'upload',
] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

// Entry status enum
export const ENTRY_STATUSES = ['active', 'soft_deleted'] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(), // UUID
  relationshipId: text('relationship_id')
    .notNull()
    .references(() => relationships.id),
  childId: text('child_id').references(() => children.id), // Optional, for child-specific entries
  type: text('type').notNull().$type<EntryType>(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull().$type<EntryStatus>().default('active'),
  currentVersionId: text('current_version_id'), // Updated when new version created
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
