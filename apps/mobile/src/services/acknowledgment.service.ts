import { NotificationService } from './notification.service';
import { UserService } from './user.service';

import type { Acknowledgment } from '@/types';

export const AcknowledgmentService = {
  /**
   * Acknowledge an entry
   */
  async acknowledge(_entryId: string, _comment?: string): Promise<Acknowledgment> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');
    void NotificationService;

    throw new Error('Not yet implemented');
  },

  /**
   * Check if current user can act on an entry
   */
  async canAct(_entryId: string): Promise<boolean> {
    // TODO: Firebase — implement with Firestore
    return false;
  },

  /**
   * Dispute an entry
   */
  async dispute(_entryId: string, _reason: string): Promise<Acknowledgment> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');
    void NotificationService;

    throw new Error('Not yet implemented');
  },

  /**
   * Get acknowledgment for an entry
   */
  async getByEntry(_entryId: string): Promise<Acknowledgment | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },
};
