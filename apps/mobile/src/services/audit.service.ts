import type { AuditAction, AuditEntityType, AuditLog } from '@/types';

export const AuditService = {
  /**
   * Get all audit logs (for export)
   */
  async getAll(): Promise<AuditLog[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Get audit logs within a date range
   */
  async getByDateRange(_from: Date, _to: Date): Promise<AuditLog[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Get audit logs for a specific entity
   */
  async getByEntity(_entityType: AuditEntityType, _entityId: string): Promise<AuditLog[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Get audit logs for a specific user
   */
  async getByUser(_userId: string): Promise<AuditLog[]> {
    // TODO: Firebase — implement with Firestore
    return [];
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
    // TODO: Firebase — implement with Firestore
    const stub: AuditLog = {
      action: params.action,
      createdAt: new Date(),
      entityId: params.entityId,
      entityType: params.entityType,
      id: 'stub',
      metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
      userId: params.userId,
    };

    return stub;
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
