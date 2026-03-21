import { eq, and, asc } from 'drizzle-orm';
import { createMMKV } from 'react-native-mmkv';

import { AuditService } from './audit.service';
import { SpaceService } from './space.service';
import { UserService } from './user.service';

import CONFIG from '@/config';
import { db } from '@/database';
import { spaceMembers, users, type SpaceMember, type SpaceRole } from '@/database/schema';

const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-space-member',
});

const INVITE_CODE_LENGTH = 6;
const INVITE_EXPIRY_DAYS = 7;
const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_STORAGE_KEY = 'space_invites';
const MS_PER_DAY = 86_400_000;

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

const ENTITY_TYPE_SPACE = 'space' as const;
const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_NOT_A_MEMBER = 'You are not a member of this Space';
const ERROR_ONLY_OWNER = 'Only the Space owner can perform this action';
const ERROR_INVALID_INVITE = 'Invalid or expired invite code';
const ERROR_INVITE_EXPIRED = 'Invite code has expired';
const ERROR_ALREADY_MEMBER = 'Already a member of this Space';
const ERROR_CANNOT_CHANGE_OWN_ROLE = 'Cannot change your own role';
const ERROR_CANNOT_ASSIGN_OWNER = 'Cannot assign owner role — use transferOwnership';
const ERROR_CANNOT_REMOVE_SELF = 'Owner cannot remove self — use leaveSpace or deleteSpace';
const ERROR_NEW_OWNER_NOT_MEMBER = 'New owner must be a current member of this Space';

export type SpaceInvite = {
  code: string;
  deepLink: string;
  expiresAt: Date;
  role: SpaceRole;
  spaceId: string;
};

type StoredInvite = {
  code: string;
  deepLink: string;
  expiresAt: string;
  role: SpaceRole;
  spaceId: string;
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_RADIX) | 0;
    const v = c === 'x' ? r : (r & UUID_VARIANT_MASK) | UUID_VARIANT_VALUE;

    return v.toString(UUID_RADIX);
  });
}

function generateCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
  }

  return code;
}

function readInvites(): SpaceInvite[] {
  const raw = storage.getString(INVITE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const stored: StoredInvite[] = JSON.parse(raw);

    return stored.map((inv) => ({ ...inv, expiresAt: new Date(inv.expiresAt) }));
  } catch {
    return [];
  }
}

function writeInvites(invites: SpaceInvite[]): void {
  const stored: StoredInvite[] = invites.map((inv) => ({
    ...inv,
    expiresAt: inv.expiresAt.toISOString(),
  }));
  storage.set(INVITE_STORAGE_KEY, JSON.stringify(stored));
}

async function verifyOwner(spaceId: string, userId: string): Promise<void> {
  const role = await SpaceService.getUserRole(spaceId, userId);
  if (!role) throw new Error(ERROR_NOT_A_MEMBER);
  if (role !== 'owner') throw new Error(ERROR_ONLY_OWNER);
}

export const SpaceMemberService = {
  /**
   * Accept an invite code and join the Space
   */
  async acceptInvite(code: string): Promise<SpaceMember> {
    const invite = SpaceMemberService.getInviteByCode(code);
    if (!invite) throw new Error(ERROR_INVALID_INVITE);

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new Error(ERROR_INVITE_EXPIRED);
    }

    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const existingRole = await SpaceService.getUserRole(invite.spaceId, userId);
    if (existingRole) throw new Error(ERROR_ALREADY_MEMBER);

    const id = generateUUID();
    await db.insert(spaceMembers).values({
      id,
      invitedBy: userId,
      joinedAt: new Date(),
      role: invite.role,
      spaceId: invite.spaceId,
      userId,
    });

    // Remove used invite
    const invites = readInvites().filter((inv) => inv.code.toUpperCase() !== code.toUpperCase());
    writeInvites(invites);

    await AuditService.log({
      action: 'accept_invite',
      entityId: invite.spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { code: invite.code, role: invite.role },
      userId,
    });

    const [member] = await db.select().from(spaceMembers).where(eq(spaceMembers.id, id));

    return member;
  },

  /**
   * Assign a role to a member (owner only, cannot assign 'owner')
   */
  async assignRole(spaceId: string, memberId: string, newRole: SpaceRole): Promise<SpaceMember> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    await verifyOwner(spaceId, userId);

    if (memberId === userId) throw new Error(ERROR_CANNOT_CHANGE_OWN_ROLE);
    if (newRole === 'owner') throw new Error(ERROR_CANNOT_ASSIGN_OWNER);

    await db
      .update(spaceMembers)
      .set({ role: newRole })
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, memberId)));

    await AuditService.log({
      action: 'assign_role',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { memberId, newRole },
      userId,
    });

    const [updated] = await db
      .select()
      .from(spaceMembers)
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, memberId)));

    return updated;
  },

  /**
   * Remove expired invites from MMKV
   */
  cleanExpiredInvites(): void {
    const invites = readInvites();
    const now = Date.now();
    const valid = invites.filter((inv) => inv.expiresAt.getTime() > now);
    writeInvites(valid);
  },

  /**
   * Generate an invite code for a Space (owner only)
   */
  async generateInviteCode(spaceId: string, role: SpaceRole): Promise<SpaceInvite> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    await verifyOwner(spaceId, userId);

    // Clean up expired invites while we're here
    SpaceMemberService.cleanExpiredInvites();

    const code = generateCode();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * MS_PER_DAY);
    const deepLink = `coparent://invite/${code}`;

    const invite: SpaceInvite = { code, deepLink, expiresAt, role, spaceId };

    const invites = readInvites();
    invites.push(invite);
    writeInvites(invites);

    await AuditService.log({
      action: 'generate_invite',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { code, role },
      userId,
    });

    return invite;
  },

  /**
   * Look up an invite by code (case-insensitive), returns null if not found or expired
   */
  getInviteByCode(code: string): SpaceInvite | null {
    const invites = readInvites();
    const upper = code.toUpperCase();
    const invite = invites.find((inv) => inv.code.toUpperCase() === upper);

    if (!invite) return null;
    if (invite.expiresAt.getTime() < Date.now()) return null;

    return invite;
  },

  /**
   * List all members of a Space (must be a member to view)
   */
  async listMembers(spaceId: string): Promise<(SpaceMember & { displayName: string })[]> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);

    const rows = await db
      .select({ member: spaceMembers, user: users })
      .from(spaceMembers)
      .innerJoin(users, eq(spaceMembers.userId, users.id))
      .where(eq(spaceMembers.spaceId, spaceId))
      .orderBy(asc(spaceMembers.joinedAt));

    return rows.map((row) => ({
      ...row.member,
      displayName: row.user.displayName,
    }));
  },

  /**
   * Remove a member from a Space (owner only, cannot remove self)
   */
  async removeMember(spaceId: string, memberId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    await verifyOwner(spaceId, userId);

    if (memberId === userId) throw new Error(ERROR_CANNOT_REMOVE_SELF);

    await db
      .delete(spaceMembers)
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, memberId)));

    await AuditService.log({
      action: 'remove_member',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { memberId },
      userId,
    });
  },

  /**
   * Transfer Space ownership to another member
   */
  async transferOwnership(spaceId: string, newOwnerId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    await verifyOwner(spaceId, userId);

    const newOwnerRole = await SpaceService.getUserRole(spaceId, newOwnerId);
    if (!newOwnerRole) throw new Error(ERROR_NEW_OWNER_NOT_MEMBER);

    // Demote current owner to editor
    await db
      .update(spaceMembers)
      .set({ role: 'editor' })
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, userId)));

    // Promote new owner
    await db
      .update(spaceMembers)
      .set({ role: 'owner' })
      .where(and(eq(spaceMembers.spaceId, spaceId), eq(spaceMembers.userId, newOwnerId)));

    await AuditService.log({
      action: 'transfer_ownership',
      entityId: spaceId,
      entityType: ENTITY_TYPE_SPACE,
      metadata: { newOwnerId, previousOwnerId: userId },
      userId,
    });
  },
};
