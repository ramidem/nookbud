import { eq } from 'drizzle-orm';
import { db } from '@/database';
import {
  acknowledgments,
  disputes,
  entries,
  type Acknowledgment,
  type NewDispute,
} from '@/database/schema';
import { AuditService } from './audit.service';
import { UserService } from './user.service';

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

export const AcknowledgmentService = {
  /**
   * Acknowledge an entry
   */
  async acknowledge(entryId: string, comment?: string): Promise<Acknowledgment> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    // Verify entry exists and user is not the creator
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entryId));

    if (!entry) throw new Error('Entry not found');
    if (entry.createdBy === userId) {
      throw new Error('Cannot acknowledge your own entry');
    }

    // Get or create acknowledgment
    const [existing] = await db
      .select()
      .from(acknowledgments)
      .where(eq(acknowledgments.entryId, entryId));

    if (existing && existing.status !== 'pending') {
      throw new Error('Entry has already been acknowledged or disputed');
    }

    const now = new Date();

    if (existing) {
      // Update existing
      await db
        .update(acknowledgments)
        .set({
          status: 'acknowledged',
          actedBy: userId,
          comment: comment ?? null,
          createdAt: now,
        })
        .where(eq(acknowledgments.id, existing.id));

      await AuditService.log(userId, 'acknowledge', 'entry', entryId, {
        acknowledgmentId: existing.id,
        comment,
      });

      const [updated] = await db
        .select()
        .from(acknowledgments)
        .where(eq(acknowledgments.id, existing.id));
      return updated;
    } else {
      // Create new
      const id = generateUUID();
      await db.insert(acknowledgments).values({
        id,
        entryId,
        status: 'acknowledged',
        actedBy: userId,
        comment: comment ?? null,
      });

      await AuditService.log(userId, 'acknowledge', 'entry', entryId, {
        acknowledgmentId: id,
        comment,
      });

      const [created] = await db
        .select()
        .from(acknowledgments)
        .where(eq(acknowledgments.id, id));
      return created;
    }
  },

  /**
   * Dispute an entry
   */
  async dispute(entryId: string, reason: string): Promise<Acknowledgment> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    if (!reason || reason.trim().length === 0) {
      throw new Error('Dispute reason is required');
    }

    // Verify entry exists and user is not the creator
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entryId));

    if (!entry) throw new Error('Entry not found');
    if (entry.createdBy === userId) {
      throw new Error('Cannot dispute your own entry');
    }

    // Get or create acknowledgment
    const [existing] = await db
      .select()
      .from(acknowledgments)
      .where(eq(acknowledgments.entryId, entryId));

    if (existing && existing.status === 'disputed') {
      throw new Error('Entry is already disputed');
    }

    const now = new Date();

    // Create dispute record
    const disputeId = generateUUID();
    const newDispute: NewDispute = {
      id: disputeId,
      entryId,
      raisedBy: userId,
      reasonText: reason.trim(),
    };
    await db.insert(disputes).values(newDispute);

    // Update/create acknowledgment
    if (existing) {
      await db
        .update(acknowledgments)
        .set({
          status: 'disputed',
          actedBy: userId,
          comment: reason.trim(),
          createdAt: now,
        })
        .where(eq(acknowledgments.id, existing.id));

      await AuditService.log(userId, 'dispute', 'entry', entryId, {
        acknowledgmentId: existing.id,
        disputeId,
        reason,
      });

      const [updated] = await db
        .select()
        .from(acknowledgments)
        .where(eq(acknowledgments.id, existing.id));
      return updated;
    } else {
      const ackId = generateUUID();
      await db.insert(acknowledgments).values({
        id: ackId,
        entryId,
        status: 'disputed',
        actedBy: userId,
        comment: reason.trim(),
      });

      await AuditService.log(userId, 'dispute', 'entry', entryId, {
        acknowledgmentId: ackId,
        disputeId,
        reason,
      });

      const [created] = await db
        .select()
        .from(acknowledgments)
        .where(eq(acknowledgments.id, ackId));
      return created;
    }
  },

  /**
   * Get acknowledgment for an entry
   */
  async getByEntry(entryId: string): Promise<Acknowledgment | null> {
    const [ack] = await db
      .select()
      .from(acknowledgments)
      .where(eq(acknowledgments.entryId, entryId));
    return ack ?? null;
  },

  /**
   * Check if current user can act on an entry
   */
  async canAct(entryId: string): Promise<boolean> {
    const userId = UserService.getCurrentUserId();
    if (!userId) return false;

    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entryId));

    if (!entry) return false;
    if (entry.createdBy === userId) return false;

    const [ack] = await db
      .select()
      .from(acknowledgments)
      .where(eq(acknowledgments.entryId, entryId));

    // Can act if no acknowledgment or status is pending
    return !ack || ack.status === 'pending';
  },
};
