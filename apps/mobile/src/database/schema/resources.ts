import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { children } from './children';
import { spaces } from './spaces';
import { users } from './users';

export const RESOURCE_CATEGORIES = [
  'medical',
  'school',
  'legal',
  'financial',
  'identity',
  'insurance',
  'other',
] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_CATEGORY_DISPLAY: Record<ResourceCategory, string> = {
  financial: 'Financial',
  identity: 'Identity',
  insurance: 'Insurance',
  legal: 'Legal',
  medical: 'Medical',
  other: 'Other',
  school: 'School',
};

export const resources = sqliteTable('resources', {
  category: text('category').notNull().$type<ResourceCategory>(),

  childId: text('child_id').references(() => children.id),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  deletedAt: integer('deleted_at', { mode: 'timestamp' }),

  description: text('description'),

  fileHash: text('file_hash').notNull(),

  fileSizeBytes: integer('file_size_bytes').notNull(),

  id: text('id').primaryKey(),

  mimeType: text('mime_type').notNull(),

  originalFilename: text('original_filename').notNull(),

  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id),

  storagePath: text('storage_path').notNull(),

  title: text('title').notNull(),

  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => users.id),
});

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
