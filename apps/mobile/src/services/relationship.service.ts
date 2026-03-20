import { eq } from 'drizzle-orm';
import { db } from '@/database';
import {
  relationships,
  type Relationship,
  type NewRelationship,
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

/**
 * Generate a random invite token
 */
function generateInviteToken(): string {
  // 8 character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const RelationshipService = {
  /**
   * Create a new relationship (parent A creates it)
   */
  async create(): Promise<Relationship> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const id = generateUUID();
    const inviteToken = generateInviteToken();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30); // 30 day expiry

    const newRelationship: NewRelationship = {
      id,
      parentAId: userId,
      parentBId: null,
      inviteToken,
      inviteExpiresAt,
    };

    await db.insert(relationships).values(newRelationship);

    // Audit log
    await AuditService.log(userId, 'create', 'relationship', id, {
      inviteToken,
    });

    const [relationship] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, id));
    return relationship;
  },

  /**
   * Get relationship by ID
   */
  async getById(id: string): Promise<Relationship | null> {
    const [relationship] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, id));
    return relationship ?? null;
  },

  /**
   * Get current user's relationship
   */
  async getCurrentRelationship(): Promise<Relationship | null> {
    const userId = UserService.getCurrentUserId();
    if (!userId) return null;

    // Check if user is parent A or parent B
    const [relationship] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.parentAId, userId));

    if (relationship) return relationship;

    // Check if user is parent B
    const [asParentB] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.parentBId, userId));

    return asParentB ?? null;
  },

  /**
   * Generate a new invite token for partner
   */
  async regenerateInvite(relationshipId: string): Promise<string> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const inviteToken = generateInviteToken();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30);

    await db
      .update(relationships)
      .set({ inviteToken, inviteExpiresAt })
      .where(eq(relationships.id, relationshipId));

    await AuditService.log(userId, 'update', 'relationship', relationshipId, {
      action: 'regenerate_invite',
      inviteToken,
    });

    return inviteToken;
  },

  /**
   * Accept an invite (parent B joins)
   */
  async acceptInvite(inviteToken: string): Promise<Relationship> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const [relationship] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.inviteToken, inviteToken));

    if (!relationship) {
      throw new Error('Invalid invite token');
    }

    if (relationship.inviteExpiresAt && relationship.inviteExpiresAt < new Date()) {
      throw new Error('Invite token expired');
    }

    if (relationship.parentBId) {
      throw new Error('Relationship already has a partner');
    }

    if (relationship.parentAId === userId) {
      throw new Error('Cannot join your own relationship');
    }

    await db
      .update(relationships)
      .set({
        parentBId: userId,
        inviteToken: null,
        inviteExpiresAt: null,
      })
      .where(eq(relationships.id, relationship.id));

    await AuditService.log(userId, 'update', 'relationship', relationship.id, {
      action: 'accept_invite',
    });

    const [updated] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, relationship.id));
    return updated;
  },

  /**
   * Check if current user is the other parent (not the creator)
   */
  isOtherParent(relationship: Relationship): boolean {
    const userId = UserService.getCurrentUserId();
    return relationship.parentBId === userId;
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
};
