import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

// Audit action types
export const AUDIT_ACTIONS = [
  'create',
  'update',
  'soft_delete',
  'acknowledge',
  'dispute',
  'respond',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// Entity types that can be audited
export const AUDIT_ENTITY_TYPES = [
  'user',
  'relationship',
  'child',
  'entry',
  'attachment',
  'acknowledgment',
  'dispute',
  'dispute_response',
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull().$type<AuditAction>(),
  entityType: text('entity_type').notNull().$type<AuditEntityType>(),
  entityId: text('entity_id').notNull(),
  metadataJson: text('metadata_json'), // Additional context as JSON
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
