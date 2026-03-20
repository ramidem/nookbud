import { eq } from 'drizzle-orm';

import { AuditService } from './audit.service';
import { FileService } from './file.service';
import { UserService } from './user.service';

import { db } from '@/database';
import {
  disputes,
  disputeResponses,
  attachments,
  entryVersions,
  type Dispute,
  type DisputeResponse,
  type NewDisputeResponse,
  type NewAttachment,
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

export type DisputeWithResponses = Dispute & {
  responses: DisputeResponse[];
};

export const DisputeService = {
  /**
   * Add evidence to a dispute response
   * Creates a special entry version to hold the evidence attachments
   */
  async addEvidence(
    disputeId: string,
    attachmentInputs: Array<{
      sourceUri: string;
      filename: string;
      mimeType: string;
    }>,
  ): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    if (!attachmentInputs || attachmentInputs.length === 0) {
      throw new Error('At least one attachment is required');
    }

    const dispute = await this.getById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    // Create a response with evidence
    const responseId = generateUUID();
    const newResponse: NewDisputeResponse = {
      disputeId,
      id: responseId,
      respondedBy: userId,
      responseText: `[Evidence attached: ${attachmentInputs.length} file(s)]`,
    };
    await db.insert(disputeResponses).values(newResponse);

    // Create a pseudo entry version to hold attachments
    // This is a workaround since attachments are linked to entry_versions
    const evidenceVersionId = generateUUID();
    await db.insert(entryVersions).values({
      // Special marker for dispute evidence
      contentJson: JSON.stringify({
        disputeId,
        responseId,
        type: 'dispute_evidence',
      }),

      createdBy: userId,

      diffJson: null,
      entryId: dispute.entryId,
      id: evidenceVersionId,
      versionNumber: -1,
    });

    // Save and link attachments
    for (const input of attachmentInputs) {
      const saved = await FileService.saveFile(input.sourceUri, input.filename, input.mimeType);

      const attachmentId = generateUUID();
      const newAttachment: NewAttachment = {
        entryVersionId: evidenceVersionId,
        fileHash: saved.fileHash,
        fileSizeBytes: saved.fileSize,
        id: attachmentId,
        mimeType: saved.mimeType,
        originalFilename: saved.originalFilename,
        storagePath: saved.storagePath,
        uploadedBy: userId,
      };
      await db.insert(attachments).values(newAttachment);

      await AuditService.log({
        action: 'create',
        entityId: attachmentId,
        entityType: 'attachment',
        metadata: {
          disputeId,
          filename: saved.originalFilename,
          hash: saved.fileHash,
          responseId,
          type: 'dispute_evidence',
        },
        userId,
      });
    }

    await AuditService.log({
      action: 'respond',
      entityId: disputeId,
      entityType: 'dispute',
      metadata: {
        evidenceCount: attachmentInputs.length,
        responseId,
        type: 'evidence',
      },
      userId,
    });
  },

  /**
   * Get dispute for an entry
   */
  async getByEntry(entryId: string): Promise<DisputeWithResponses | null> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.entryId, entryId));

    if (!dispute) return null;

    const responses = await db
      .select()
      .from(disputeResponses)
      .where(eq(disputeResponses.disputeId, dispute.id))
      .orderBy(disputeResponses.createdAt);

    return {
      ...dispute,
      responses,
    };
  },

  /**
   * Get dispute by ID
   */
  async getById(id: string): Promise<Dispute | null> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id));

    return dispute ?? null;
  },

  /**
   * Get response count for a dispute
   */
  async getResponseCount(disputeId: string): Promise<number> {
    const responses = await this.getResponses(disputeId);

    return responses.length;
  },

  /**
   * Get all responses for a dispute
   */
  async getResponses(disputeId: string): Promise<DisputeResponse[]> {
    return db
      .select()
      .from(disputeResponses)
      .where(eq(disputeResponses.disputeId, disputeId))
      .orderBy(disputeResponses.createdAt);
  },

  /**
   * Add a response to a dispute
   */
  async respond(disputeId: string, responseText: string): Promise<DisputeResponse> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Response text is required');
    }

    const dispute = await this.getById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    const id = generateUUID();
    const newResponse: NewDisputeResponse = {
      disputeId,
      id,
      respondedBy: userId,
      responseText: responseText.trim(),
    };

    await db.insert(disputeResponses).values(newResponse);

    await AuditService.log({
      action: 'respond',
      entityId: disputeId,
      entityType: 'dispute',
      metadata: {
        entryId: dispute.entryId,
        responseId: id,
      },
      userId,
    });

    const [response] = await db.select().from(disputeResponses).where(eq(disputeResponses.id, id));

    return response;
  },
};
