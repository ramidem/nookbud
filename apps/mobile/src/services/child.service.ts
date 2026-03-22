import { eq } from 'drizzle-orm';

import { AuditService } from './audit.service';
import { UserService } from './user.service';

import { db } from '@/database';
import { children, type Child, type NewChild, type ChildRole } from '@/database/schema';

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

export const ChildService = {
  /**
   * Get children count for a space
   */
  async count(spaceId: string): Promise<number> {
    const result = await db.select().from(children).where(eq(children.spaceId, spaceId));

    return result.length;
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
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const id = generateUUID();
    const resolvedSpaceId = data.spaceId ?? data.relationshipId ?? '';
    const newChild: NewChild = {
      dateOfBirth: data.dateOfBirth,
      id,
      name: data.name,
      role: data.role,
      spaceId: resolvedSpaceId,
    };

    await db.insert(children).values(newChild);

    await AuditService.log({
      action: 'create',
      entityId: id,
      entityType: 'child',
      metadata: {
        name: data.name,
        spaceId: resolvedSpaceId,
      },
      userId,
    });

    const [child] = await db.select().from(children).where(eq(children.id, id));

    return child;
  },

  /**
   * Get child by ID
   */
  async getById(id: string): Promise<Child | null> {
    const [child] = await db.select().from(children).where(eq(children.id, id));

    return child ?? null;
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
  async listBySpace(spaceId: string): Promise<Child[]> {
    return db.select().from(children).where(eq(children.spaceId, spaceId)).orderBy(children.name);
  },

  /**
   * Update a child's information
   */
  async update(id: string, data: { name?: string; dateOfBirth?: Date | null }): Promise<Child> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const existingChild = await this.getById(id);
    if (!existingChild) throw new Error('Child not found');

    await db
      .update(children)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
      })
      .where(eq(children.id, id));

    await AuditService.log({
      action: 'update',
      entityId: id,
      entityType: 'child',
      metadata: {
        changes: data,
        previous: {
          dateOfBirth: existingChild.dateOfBirth,
          name: existingChild.name,
        },
      },
      userId,
    });

    const [updated] = await db.select().from(children).where(eq(children.id, id));

    return updated;
  },
};
