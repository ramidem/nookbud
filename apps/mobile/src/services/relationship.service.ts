import { eq } from 'drizzle-orm';

import { AuditService } from './audit.service';
import { UserService } from './user.service';

import { db } from '@/database';
import {
  spaces,
  spaceMembers,
  type Space,
  type NewSpace,
  type NewSpaceMember,
  type Relationship,
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

/**
 * Build a Relationship-compatible object from a Space + its members.
 * This bridges the old 2-parent model until the UI migrates to Spaces (Story 39+).
 */
async function toRelationship(space: Space): Promise<Relationship> {
  const members = await db.select().from(spaceMembers).where(eq(spaceMembers.spaceId, space.id));

  const owner = members.find((m) => m.role === 'owner');
  const otherMember = members.find((m) => m.role !== 'owner');

  return {
    createdAt: space.createdAt,
    id: space.id,
    inviteExpiresAt: null,
    inviteToken: null,
    parentAId: owner?.userId ?? space.createdBy,
    parentBId: otherMember?.userId ?? null,
  };
}

export const RelationshipService = {
  /**
   * Accept an invite — kept as stub for compatibility.
   * Real invite flow will move to SpaceService in Story 39.
   */
  async acceptInvite(_inviteToken: string): Promise<Relationship> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    // Invite token matching is no longer stored in spaces table.
    // This stub throws until Story 39 implements the new invite flow.
    throw new Error('Invite flow not yet migrated to Spaces');
  },

  /**
   * Create a new space (parent A creates it)
   */
  async create(): Promise<Relationship> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const id = generateUUID();

    const newSpace: NewSpace = {
      createdBy: userId,
      id,
      name: 'My Space',
    };

    await db.insert(spaces).values(newSpace);

    // Add creator as owner
    const memberId = generateUUID();
    const newMember: NewSpaceMember = {
      id: memberId,
      role: 'owner',
      spaceId: id,
      userId,
    };
    await db.insert(spaceMembers).values(newMember);

    // Audit log
    await AuditService.log({
      action: 'create',
      entityId: id,
      entityType: ENTITY_TYPE_SPACE,
      metadata: {},
      userId,
    });

    const [space] = await db.select().from(spaces).where(eq(spaces.id, id));

    return toRelationship(space);
  },

  /**
   * Get space by ID
   */
  async getById(id: string): Promise<Relationship | null> {
    const [space] = await db.select().from(spaces).where(eq(spaces.id, id));
    if (!space) return null;

    return toRelationship(space);
  },

  /**
   * Get current user's space (first one found)
   */
  async getCurrentRelationship(): Promise<Relationship | null> {
    const userId = UserService.getCurrentUserId();
    if (!userId) return null;

    // Find any space where user is a member
    const [membership] = await db
      .select()
      .from(spaceMembers)
      .where(eq(spaceMembers.userId, userId));

    if (!membership) return null;

    const [space] = await db.select().from(spaces).where(eq(spaces.id, membership.spaceId));
    if (!space) return null;

    return toRelationship(space);
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

    // Invite tokens are no longer stored on the spaces table.
    // Story 39 will implement the new invite mechanism.
    return generateInviteToken();
  },
};
