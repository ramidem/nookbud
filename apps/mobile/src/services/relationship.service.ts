import { AuditService } from './audit.service';
import { UserService } from './user.service';

import type { Relationship, Space, SpaceMember } from '@/types';

const INVITE_TOKEN_LENGTH = 8;
const ENTITY_TYPE_SPACE = 'space' as const;
const ERROR_NO_CURRENT_USER = 'No current user';

/**
 * Generate a random invite token
 */
function generateInviteToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let token = '';
  for (let i = 0; i < INVITE_TOKEN_LENGTH; i += 1) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return token;
}

// Suppress unused warnings
void (ENTITY_TYPE_SPACE as string);

export const RelationshipService = {
  /**
   * Accept an invite — kept as stub for compatibility.
   * Real invite flow will move to SpaceService in Story 39.
   */
  async acceptInvite(_inviteToken: string): Promise<Relationship> {
    // TODO: Firebase — implement invite flow with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void AuditService;

    throw new Error('Invite flow not yet migrated to Spaces');
  },

  /**
   * Create a new space (parent A creates it)
   */
  async create(): Promise<Relationship> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void AuditService;

    return {
      createdAt: new Date(),
      id: 'stub',
      inviteExpiresAt: null,
      inviteToken: null,
      parentAId: userId,
      parentBId: null,
    };
  },

  /**
   * Get space by ID
   */
  async getById(_id: string): Promise<Relationship | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get current user's space (first one found)
   */
  async getCurrentRelationship(): Promise<Relationship | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get the other parent's ID
   */
  getOtherParentId(relationship: Relationship): string | null {
    const userId = UserService.getCurrentUserId();
    if (relationship.parentAId === userId) {
      return relationship.parentBId;
    }
    if (relationship.parentBId === userId) {
      return relationship.parentAId;
    }

    return null;
  },

  /**
   * Check if current user is the other parent (not the creator)
   */
  isOtherParent(relationship: Relationship): boolean {
    const userId = UserService.getCurrentUserId();

    return relationship.parentBId === userId;
  },

  /**
   * Generate a new invite token — stub until Story 39
   */
  async regenerateInvite(_spaceId: string): Promise<string> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    return generateInviteToken();
  },
};

// Export Space/SpaceMember so existing importers of this file continue to compile
export type { Space, SpaceMember };
