import { UserService } from './user.service';

import { useLocalStorageStore } from '@/stores';
import type { Child, Space, SpaceMember, SpaceRole, User } from '@/types';

const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_NOT_A_MEMBER = 'You are not a member of this Space';
const ERROR_ONLY_OWNER_RENAME = 'Only owner can rename this Space';
const ERROR_ONLY_OWNER_APPEARANCE = 'Only owner can update Space appearance';
const ERROR_ONLY_OWNER_ARCHIVE = 'Only owner can archive this Space';
const ERROR_OWNER_CANNOT_LEAVE = 'Owner must transfer ownership before leaving';

export type SpaceWithRole = Space & {
  memberCount: number;
  userRole: SpaceRole;
};

export type SpaceDetails = Space & {
  children: Child[];
  members: (SpaceMember & { user: User })[];
  userRole: SpaceRole;
};

export type ListSpacesOptions = {
  includeArchived?: boolean;
};

export const SpaceService = {
  /**
   * Archive a Space (owner only). Sets archivedAt timestamp.
   */
  async archiveSpace(_spaceId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
  },

  /**
   * Create a new Space and add the creator as owner
   */
  async createSpace(_name: string, _emoji?: string, _color?: string): Promise<Space> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    return {
      archivedAt: null,
      color: '#6F8F7B',
      createdAt: new Date(),
      createdBy: userId,
      emoji: '🏠',
      id: 'stub',
      name: _name,
      updatedAt: new Date(),
    };
  },

  /**
   * Delete a Space (owner only). Removes all members; entries and audit logs preserved.
   */
  async deleteSpace(_spaceId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
  },

  /**
   * Get the current active Space, falling back to first available
   */
  async getCurrentSpace(): Promise<Space | null> {
    // TODO: Firebase — implement with Firestore
    void ERROR_NOT_A_MEMBER;

    return null;
  },

  /**
   * Get Space details including members, children, and current user's role
   */
  async getSpaceById(_spaceId: string): Promise<SpaceDetails | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get a user's role in a Space
   */
  async getUserRole(_spaceId: string, _userId?: string): Promise<SpaceRole | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Leave a Space (non-owner only)
   */
  async leaveSpace(_spaceId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_NOT_A_MEMBER;
    void ERROR_OWNER_CANNOT_LEAVE;
  },

  /**
   * List all Spaces the user is a member of, with member count and role
   */
  async listSpaces(_options?: ListSpacesOptions): Promise<SpaceWithRole[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Rename a Space (owner only)
   */
  async renameSpace(_spaceId: string, _name: string): Promise<Space> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_NOT_A_MEMBER;
    void ERROR_ONLY_OWNER_RENAME;

    return {
      archivedAt: null,
      color: '#6F8F7B',
      createdAt: new Date(),
      createdBy: userId,
      emoji: '🏠',
      id: _spaceId,
      name: _name,
      updatedAt: new Date(),
    };
  },

  /**
   * Save the active Space ID to the store (persisted via MMKV)
   */
  setCurrentSpace(spaceId: string | null): void {
    useLocalStorageStore.getState().setActiveSpaceId(spaceId);
  },

  /**
   * Unarchive a Space (owner only). Clears archivedAt timestamp.
   */
  async unarchiveSpace(_spaceId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_ONLY_OWNER_ARCHIVE;
  },

  /**
   * Update Space appearance — emoji and/or color (owner only)
   */
  async updateSpaceAppearance(_spaceId: string, _emoji?: string, _color?: string): Promise<Space> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_NOT_A_MEMBER;
    void ERROR_ONLY_OWNER_APPEARANCE;

    return {
      archivedAt: null,
      color: _color ?? '#6F8F7B',
      createdAt: new Date(),
      createdBy: userId,
      emoji: _emoji ?? '🏠',
      id: _spaceId,
      name: '',
      updatedAt: new Date(),
    };
  },
};
