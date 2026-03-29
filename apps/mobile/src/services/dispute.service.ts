import { FileService } from './file.service';
import { NotificationService } from './notification.service';
import { UserService } from './user.service';

import type { Dispute, DisputeResponse } from '@/types';

export type DisputeWithResponses = Dispute & {
  responses: DisputeResponse[];
};

export const DisputeService = {
  /**
   * Add evidence to a dispute response
   * Creates a special entry to hold the evidence attachments
   */
  async addEvidence(
    _disputeId: string,
    _attachmentInputs: Array<{
      sourceUri: string;
      filename: string;
      mimeType: string;
    }>,
  ): Promise<void> {
    // TODO: Firebase — implement with Firestore + Firebase Storage
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');
    void FileService;
  },

  /**
   * Get dispute for an entry
   */
  async getByEntry(_entryId: string): Promise<DisputeWithResponses | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get dispute by ID
   */
  async getById(_id: string): Promise<Dispute | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get response count for a dispute
   */
  async getResponseCount(_disputeId: string): Promise<number> {
    // TODO: Firebase — implement with Firestore
    return 0;
  },

  /**
   * Get all responses for a dispute
   */
  async getResponses(_disputeId: string): Promise<DisputeResponse[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Add a response to a dispute
   */
  async respond(_disputeId: string, _responseText: string): Promise<DisputeResponse> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');
    void NotificationService;

    throw new Error('Not yet implemented');
  },
};
