import { eq } from 'drizzle-orm';

import { AuditService } from './audit.service';
import { UserService } from './user.service';

import { db } from '@/database';
import { relationships, type Relationship, type NewRelationship } from '@/database/schema';

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

const INVITE_TOKEN_LENGTH = 8;
const ENTITY_TYPE_RELATIONSHIP = 'relationship' as const;
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

export const RelationshipService = {
  /**
   * Accept an invite (parent B joins)
   */
  async acceptInvite(inviteToken: string): Promise<Relationship> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

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
        inviteExpiresAt: null,
        inviteToken: null,
        parentBId: userId,
      })
      .where(eq(relationships.id, relationship.id));

    await AuditService.log({
      action: 'update',
      entityId: relationship.id,
      entityType: ENTITY_TYPE_RELATIONSHIP,
      metadata: {
        action: 'accept_invite',
      },
      userId,
    });

    const [updated] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, relationship.id));

    return updated;
  },

  /**
   * Create a new relationship (parent A creates it)
   */
  async create(): Promise<Relationship> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const id = generateUUID();
    const inviteToken = generateInviteToken();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30); // 30 day expiry

    const newRelationship: NewRelationship = {
      id,
      inviteExpiresAt,
      inviteToken,
      parentAId: userId,
      parentBId: null,
    };

    await db.insert(relationships).values(newRelationship);

    // Audit log
    await AuditService.log({
      action: 'create',
      entityId: id,
      entityType: ENTITY_TYPE_RELATIONSHIP,
      metadata: {
        inviteToken,
      },
      userId,
    });

    const [relationship] = await db.select().from(relationships).where(eq(relationships.id, id));

    return relationship;
  },

  /**
   * Get relationship by ID
   */
  async getById(id: string): Promise<Relationship | null> {
    const [relationship] = await db.select().from(relationships).where(eq(relationships.id, id));

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
   * Generate a new invite token for partner
   */
  async regenerateInvite(relationshipId: string): Promise<string> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const inviteToken = generateInviteToken();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30);

    await db
      .update(relationships)
      .set({ inviteExpiresAt, inviteToken })
      .where(eq(relationships.id, relationshipId));

    await AuditService.log({
      action: 'update',
      entityId: relationshipId,
      entityType: ENTITY_TYPE_RELATIONSHIP,
      metadata: {
        action: 'regenerate_invite',
        inviteToken,
      },
      userId,
    });

    return inviteToken;
  },
};
