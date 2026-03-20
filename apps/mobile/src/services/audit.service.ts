import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '@/database';
import {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
  type AuditAction,
  type AuditEntityType,
} from '@/database/schema';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const AuditService = {
  /**
   * Log an action to the audit trail.
   * This is the foundation of legal defensibility - every mutation is recorded.
   */
  async log(
    userId: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<AuditLog> {
    const id = generateUUID();
    const newLog: NewAuditLog = {
      id,
      userId,
      action,
      entityType,
      entityId,
      metadataJson: metadata ? JSON.stringify(metadata) : null,
    };

    await db.insert(auditLogs).values(newLog);

    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return log;
  },

  /**
   * Get audit logs for a specific entity
   */
  async getByEntity(
    entityType: AuditEntityType,
    entityId: string
  ): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )
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
   * Get all audit logs (for export)
   */
  async getAll(): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(auditLogs.createdAt);
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
