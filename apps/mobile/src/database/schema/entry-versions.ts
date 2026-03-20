import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { entries } from './entries';
import { users } from './users';

export const entryVersions = sqliteTable('entry_versions', {
  id: text('id').primaryKey(), // UUID
  entryId: text('entry_id')
    .notNull()
    .references(() => entries.id),
  versionNumber: integer('version_number').notNull(),
  contentJson: text('content_json').notNull(), // JSON string of typed content
  diffJson: text('diff_json'), // JSON diff from previous version (null for v1)
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type EntryVersion = typeof entryVersions.$inferSelect;
export type NewEntryVersion = typeof entryVersions.$inferInsert;
