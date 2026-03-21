import { eq, and } from 'drizzle-orm';
import { createMMKV } from 'react-native-mmkv';

import { AuditService } from './audit.service';
import { UserService } from './user.service';

import CONFIG from '@/config';
import { db } from '@/database';
import {
  children,
  spaceMembers,
  spaces,
  users,
  type Child,
  type Space,
  type SpaceMember,
  type SpaceRole,
  type User,
} from '@/database/schema';

// MMKV storage for active space tracking
const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-space',
});

const ACTIVE_SPACE_ID_KEY = 'active_space_id';

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

const ENTITY_TYPE_SPACE = 'space' as const;
const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_NOT_A_MEMBER = 'You are not a member of this Space';
const ERROR_ONLY_OWNER_RENAME = 'Only owner can rename this Space';
const ERROR_ONLY_OWNER_APPEARANCE = 'Only owner can update Space appearance';
const ERROR_ONLY_OWNER_DELETE = 'Only owner can delete this Space';
const ERROR_OWNER_CANNOT_LEAVE = 'Owner must transfer ownership before leaving';

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

export type SpaceWithRole = Space & {
  memberCount: number;
  userRole: SpaceRole;
};

export type SpaceDetails = Space & {
  children: Child[];
  members: (SpaceMember & { user: User })[];
  userRole: SpaceRole;
};

export const SpaceService = {
  /**
   * Create a new Space and add the creator as owner
   */
  async createSpace(name: string, emoji?: string, color?: string): Promise<Space> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const id = generateUUID();
    const now = new Date();

    await db.insert(spaces).values({
      color: color ?? '#6F8F7B',
      createdAt: now,
      createdBy: userId,
      emoji: emoji ?? '🏠',
      id,
      name,
      updatedAt: now,
    });

    await db.insert(spaceMembers).values({
      id: generateUUID(),
      role: 'owner',
      spaceId: id,
      userId,
    });

    await AuditService.log({
      action: 'create',
      entityId: id,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { name },
      userId,
    });

    const [space] = await db.select().from(spaces).where(eq(spaces.id, id));

    return space;
  },

  /**
   * Delete a Space (owner only). Removes all members; entries and audit logs preserved.
   */
  async deleteSpace(spaceId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);
    if (role !== 'owner') throw new Error(ERROR_ONLY_OWNER_DELETE);

    // Remove all members so no one can access the Space
    await db.delete(spaceMembers).where(eq(spaceMembers.spaceId, spaceId));

    await AuditService.log({
      action: 'delete',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: {},
      userId,
    });
  },

  /**
   * Get the current active Space from MMKV, falling back to first available
   */
  async getCurrentSpace(): Promise<Space | null> {
    const activeId = storage.getString(ACTIVE_SPACE_ID_KEY);

    if (activeId) {
      const userId = UserService.getCurrentUserId();
      if (!userId) return null;

      // Verify user is still a member
      const role = await SpaceService.getUserRole(activeId, userId);
      if (role) {
        const [space] = await db.select().from(spaces).where(eq(spaces.id, activeId));
        if (space) return space;
      }
    }

    // Fall back to first Space
    const userSpaces = await SpaceService.listSpaces();
    if (userSpaces.length > 0) return userSpaces[0];

    return null;
  },

  /**
   * Get Space details including members, children, and current user's role
   */
  async getSpaceById(spaceId: string): Promise<SpaceDetails | null> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);

    const [space] = await db.select().from(spaces).where(eq(spaces.id, spaceId));
    if (!space) return null;

    // Get members with user details
    const memberRows = await db
      .select({
        member: spaceMembers,
        user: users,
      })
      .from(spaceMembers)
      .innerJoin(users, eq(spaceMembers.userId, users.id))
      .where(eq(spaceMembers.spaceId, spaceId));

    const membersWithUsers = memberRows.map((row) => ({
      ...row.member,
      user: row.user,
    }));

    // Get children belonging to this Space
    const spaceChildren = await db.select().from(children).where(eq(children.spaceId, spaceId));

    return {
      ...space,
      children: spaceChildren,
      members: membersWithUsers,
      userRole: role,
    };
  },

  /**
   * Get a user's role in a Space
   */
  async getUserRole(spaceId: string, userId?: string): Promise<SpaceRole | null> {
    const uid = userId ?? UserService.getCurrentUserId();
    if (!uid) return null;

    const [membership] = await db
      .select()
      .from(spaceMembers)
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, uid)));

    return membership?.role ?? null;
  },

  /**
   * Leave a Space (non-owner only)
   */
  async leaveSpace(spaceId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);
    if (role === 'owner') throw new Error(ERROR_OWNER_CANNOT_LEAVE);

    await db
      .delete(spaceMembers)
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, userId)));

    await AuditService.log({
      action: 'leave',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: {},
      userId,
    });
  },

  /**
   * List all Spaces the user is a member of, with member count and role
   */
  async listSpaces(userId?: string): Promise<SpaceWithRole[]> {
    const uid = userId ?? UserService.getCurrentUserId();
    if (!uid) return [];

    // Get all memberships for this user
    const memberships = await db.select().from(spaceMembers).where(eq(spaceMembers.userId, uid));

    if (memberships.length === 0) return [];

    const results: SpaceWithRole[] = [];

    for (const membership of memberships) {
      const [space] = await db.select().from(spaces).where(eq(spaces.id, membership.spaceId));

      if (!space) continue;

      // Count members in this Space
      const allMembers = await db
        .select()
        .from(spaceMembers)
        .where(eq(spaceMembers.spaceId, membership.spaceId));

      results.push({
        ...space,
        memberCount: allMembers.length,
        userRole: membership.role,
      });
    }

    // Order by created_at ASC
    results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return results;
  },

  /**
   * Rename a Space (owner only)
   */
  async renameSpace(spaceId: string, name: string): Promise<Space> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);
    if (role !== 'owner') throw new Error(ERROR_ONLY_OWNER_RENAME);

    const now = new Date();
    await db.update(spaces).set({ name, updatedAt: now }).where(eq(spaces.id, spaceId));

    await AuditService.log({
      action: 'update',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { field: 'name', name },
      userId,
    });

    const [updated] = await db.select().from(spaces).where(eq(spaces.id, spaceId));

    return updated;
  },

  /**
   * Save the active Space ID to MMKV
   */
  setCurrentSpace(spaceId: string): void {
    storage.set(ACTIVE_SPACE_ID_KEY, spaceId);
  },

  /**
   * Update Space appearance — emoji and/or color (owner only)
   */
  async updateSpaceAppearance(spaceId: string, emoji?: string, color?: string): Promise<Space> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);
    if (role !== 'owner') throw new Error(ERROR_ONLY_OWNER_APPEARANCE);

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (emoji !== undefined) updates.emoji = emoji;
    if (color !== undefined) updates.color = color;

    await db.update(spaces).set(updates).where(eq(spaces.id, spaceId));

    await AuditService.log({
      action: 'update',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { ...(emoji !== undefined && { emoji }), ...(color !== undefined && { color }) },
      userId,
    });

    const [updated] = await db.select().from(spaces).where(eq(spaces.id, spaceId));

    return updated;
  },
};
