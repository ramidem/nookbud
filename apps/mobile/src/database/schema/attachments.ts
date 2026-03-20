import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { entryVersions } from './entry-versions';
import { users } from './users';

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(), // UUID
  entryVersionId: text('entry_version_id')
    .notNull()
    .references(() => entryVersions.id),
  originalFilename: text('original_filename').notNull(),
  storagePath: text('storage_path').notNull(), // Path in app documents
  fileHash: text('file_hash').notNull(), // SHA-256 hex string
  fileSizeBytes: integer('file_size_bytes').notNull(),
  mimeType: text('mime_type').notNull(),
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => users.id),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
