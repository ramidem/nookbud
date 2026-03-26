import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { users } from './users';

// Audit action types
export const AUDIT_ACTIONS = [
  'create',
  'update',
  'soft_delete',
  'delete',
  'leave',
  'acknowledge',
  'dispute',
  'respond',
  'generate_invite',
  'accept_invite',
  'assign_role',
  'remove_member',
  'transfer_ownership',
  'upload',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// Entity types that can be audited
export const AUDIT_ENTITY_TYPES = [
  'user',
  'relationship',
  'space',
  'child',
  'entry',
  'attachment',
  'acknowledgment',
  'dispute',
  'dispute_response',
  'resource',
  'task',
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const auditLogs = sqliteTable('audit_logs', {
  action: text('action').notNull().$type<AuditAction>(),
  // Additional context as JSON
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  entityId: text('entity_id').notNull(),

  entityType: text('entity_type').notNull().$type<AuditEntityType>(),

  id: text('id').primaryKey(),

  metadataJson: text('metadata_json'),
  // UUID
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
