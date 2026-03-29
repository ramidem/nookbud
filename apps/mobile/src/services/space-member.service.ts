import { createMMKV } from 'react-native-mmkv';

import { UserService } from './user.service';

import CONFIG from '@/config';
import type { SpaceMember, SpaceMemberLabel, SpaceRole } from '@/types';

const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-space-member',
});

const INVITE_CODE_LENGTH = 6;
const INVITE_EXPIRY_DAYS = 7;
const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_STORAGE_KEY = 'space_invites';
const MS_PER_DAY = 86_400_000;

const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_NOT_A_MEMBER = 'You are not a member of this Space';
const ERROR_ALREADY_MEMBER = 'Already a member of this Space';
const ERROR_INVALID_INVITE = 'Invalid or expired invite code';
const ERROR_INVITE_EXPIRED = 'Invite code has expired';

export type SpaceInvite = {
  code: string;
  deepLink: string;
  expiresAt: Date;
  label?: SpaceMemberLabel;
  role: SpaceRole;
  spaceId: string;
};

type StoredInvite = {
  code: string;
  deepLink: string;
  expiresAt: string;
  label?: SpaceMemberLabel;
  role: SpaceRole;
  spaceId: string;
};

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

export const SpaceMemberService = {
  /**
   * Accept an invite code and join the Space
   */
  async acceptInvite(code: string): Promise<SpaceMember> {
    // TODO: Firebase — implement with Firestore
    const invite = SpaceMemberService.getInviteByCode(code);
    if (!invite) throw new Error(ERROR_INVALID_INVITE);

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new Error(ERROR_INVITE_EXPIRED);
    }

    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_ALREADY_MEMBER;
    void ERROR_NOT_A_MEMBER;

    return {
      id: 'stub',
      invitedBy: userId,
      joinedAt: new Date(),
      label: invite.label,
      role: invite.role,
      spaceId: invite.spaceId,
      userId,
    };
  },

  /**
   * Assign a role to a member (owner only, cannot assign 'owner')
   */
  async assignRole(
    _spaceId: string,
    _memberId: string,
    update: { label?: SpaceMemberLabel; role: SpaceRole },
  ): Promise<SpaceMember> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    return {
      id: 'stub',
      joinedAt: new Date(),
      label: update.label,
      role: update.role,
      spaceId: _spaceId,
      userId: _memberId,
    };
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
  async generateInviteCode(
    spaceId: string,
    role: SpaceRole,
    label?: SpaceMemberLabel,
  ): Promise<SpaceInvite> {
    // TODO: Firebase — implement with Firestore (store invite in Firestore subcollection)
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    SpaceMemberService.cleanExpiredInvites();

    const code = generateCode();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * MS_PER_DAY);
    const deepLink = `coparent://invite/${code}`;

    const invite: SpaceInvite = { code, deepLink, expiresAt, label, role, spaceId };

    const invites = readInvites();
    invites.push(invite);
    writeInvites(invites);

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
  async listMembers(_spaceId: string): Promise<(SpaceMember & { displayName: string })[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Remove a member from a Space (owner only, cannot remove self)
   */
  async removeMember(_spaceId: string, _memberId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
  },

  /**
   * Transfer Space ownership to another member
   */
  async transferOwnership(_spaceId: string, _newOwnerId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
  },
};
