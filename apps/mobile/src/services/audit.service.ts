import { eq, and, gte, lte } from 'drizzle-orm';

import { db } from '@/database';
import {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
  type AuditAction,
  type AuditEntityType,
} from '@/database/schema';

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_RADIX) | 0;
    const v = c === 'x' ? r : (r & UUID_VARIANT_MASK) | UUID_VARIANT_VALUE;

    return v.toString(UUID_RADIX);
  });
}

export const AuditService = {
  /**
   * Get all audit logs (for export)
   */
  async getAll(): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(auditLogs.createdAt);
  },

  /**
   * Get audit logs within a date range
   */
  async getByDateRange(from: Date, to: Date): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(and(gte(auditLogs.createdAt, from), lte(auditLogs.createdAt, to)))
      .orderBy(auditLogs.createdAt);
  },

  /**
   * Get audit logs for a specific entity
   */
  async getByEntity(entityType: AuditEntityType, entityId: string): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(auditLogs.createdAt);
  },

  /**
   * Get audit logs for a specific user
   */
  async getByUser(userId: string): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(auditLogs.createdAt);
  },

  /**
   * Log an action to the audit trail.
   * This is the foundation of legal defensibility - every mutation is recorded.
   */
  async log(params: {
    userId: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const { action, entityId, entityType, metadata, userId } = params;
    const id = generateUUID();
    const newLog: NewAuditLog = {
      action,
      entityId,
      entityType,
      id,
      metadataJson: metadata ? JSON.stringify(metadata) : null,
      userId,
    };

    await db.insert(auditLogs).values(newLog);

    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));

    return log;
  },

  /**
   * Parse metadata from a log entry
   */
  parseMetadata(log: AuditLog): Record<string, unknown> | null {
    if (!log.metadataJson) return null;
    try {
      return JSON.parse(log.metadataJson);
    } catch {
      return null;
    }
  },
};
