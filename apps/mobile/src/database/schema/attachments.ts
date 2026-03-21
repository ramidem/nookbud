import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { entryVersions } from './entry-versions';
import { users } from './users';

export const attachments = sqliteTable('attachments', {
  // UUID
  entryVersionId: text('entry_version_id')
    .notNull()
    .references(() => entryVersions.id),
  // Path in app documents
  fileHash: text('file_hash').notNull(),

  // SHA-256 hex string
  fileSizeBytes: integer('file_size_bytes').notNull(),

  id: text('id').primaryKey(),

  mimeType: text('mime_type').notNull(),
  originalFilename: text('original_filename').notNull(),
  storagePath: text('storage_path').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => users.id),
});

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
