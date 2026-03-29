import { UserService } from './user.service';

import type { Child, ChildRole } from '@/types';

export const ChildService = {
  /**
   * Get children count for a space
   */
  async count(_spaceId: string): Promise<number> {
    // TODO: Firebase — implement with Firestore
    return 0;
  },

  /**
   * Create a new child record
   */
  async create(data: {
    spaceId?: string;
    /** @deprecated Use spaceId — kept for screen compatibility until Story 39+ */
    relationshipId?: string;
    name: string;
    dateOfBirth?: Date;
    role?: ChildRole;
  }): Promise<Child> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const resolvedSpaceId = data.spaceId ?? data.relationshipId ?? '';

    return {
      createdAt: new Date(),
      dateOfBirth: data.dateOfBirth,
      id: 'stub',
      name: data.name,
      role: data.role,
      spaceId: resolvedSpaceId,
    };
  },

  /**
   * Get child by ID
   */
  async getById(_id: string): Promise<Child | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get all children for a space
   * @deprecated Use listBySpace — kept for screen compatibility until Story 39+
   */
  async listByRelationship(spaceId: string): Promise<Child[]> {
    return this.listBySpace(spaceId);
  },

  /**
   * Get all children for a space
   */
  async listBySpace(_spaceId: string): Promise<Child[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Update a child's information
   */
  async update(_id: string, _data: { name?: string; dateOfBirth?: Date | null }): Promise<Child> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    throw new Error('Not yet implemented');
  },
};
