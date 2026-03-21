import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import RNFS from 'react-native-fs';

import { AuditService } from './audit.service';
import { FileService } from './file.service';
import { SpaceService } from './space.service';
import { UserService } from './user.service';

import { db } from '@/database';
import { resources, type Resource, type ResourceCategory } from '@/database/schema';

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

const ENTITY_TYPE_RESOURCE = 'resource' as const;
const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_VIEWER_CANNOT_UPLOAD = 'Viewers cannot upload resources';
const ERROR_VIEWER_CANNOT_DELETE = 'Viewers cannot delete resources';
const ERROR_RESOURCE_NOT_FOUND = 'Resource not found';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_RADIX) | 0;
    const v = c === 'x' ? r : (r & UUID_VARIANT_MASK) | UUID_VARIANT_VALUE;

    return v.toString(UUID_RADIX);
  });
}

export type ResourceFilters = {
  category?: ResourceCategory;
  childId?: string;
};

export const ResourceService = {
  async getById(resourceId: string): Promise<Resource | null> {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, resourceId), isNull(resources.deletedAt)));

    return resource ?? null;
  },

  async listBySpace(spaceId: string, filters?: ResourceFilters): Promise<Resource[]> {
    const conditions = [eq(resources.spaceId, spaceId), isNull(resources.deletedAt)];

    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.childId) {
      conditions.push(eq(resources.childId, filters.childId));
    }

    return db
      .select()
      .from(resources)
      .where(and(...conditions))
      .orderBy(desc(resources.createdAt));
  },

  async listBySpaces(spaceIds: string[], filters?: ResourceFilters): Promise<Resource[]> {
    if (spaceIds.length === 0) return [];

    const conditions = [inArray(resources.spaceId, spaceIds), isNull(resources.deletedAt)];

    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.childId) {
      conditions.push(eq(resources.childId, filters.childId));
    }

    return db
      .select()
      .from(resources)
      .where(and(...conditions))
      .orderBy(desc(resources.createdAt));
  },

  async softDelete(resourceId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const resource = await ResourceService.getById(resourceId);
    if (!resource) throw new Error(ERROR_RESOURCE_NOT_FOUND);

    const role = await SpaceService.getUserRole(resource.spaceId, userId);
    if (role === 'viewer') throw new Error(ERROR_VIEWER_CANNOT_DELETE);

    await db.update(resources).set({ deletedAt: new Date() }).where(eq(resources.id, resourceId));

    await AuditService.log({
      action: 'soft_delete',
      entityId: resourceId,
      entityType: ENTITY_TYPE_RESOURCE,
      metadata: { title: resource.title },
      userId,
    });
  },

  async upload(
    spaceId: string,
    fileUri: string,
    metadata: {
      title: string;
      description?: string;
      category: ResourceCategory;
      childId?: string;
    },
  ): Promise<Resource> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const role = await SpaceService.getUserRole(spaceId, userId);
    if (role === 'viewer') throw new Error(ERROR_VIEWER_CANNOT_UPLOAD);

    const savedFile = await FileService.saveFile(
      fileUri,
      metadata.title,
      'application/octet-stream',
    );
    const id = generateUUID();

    await db.insert(resources).values({
      category: metadata.category,
      childId: metadata.childId ?? null,
      description: metadata.description ?? null,
      fileHash: savedFile.fileHash,
      fileSizeBytes: savedFile.fileSize,
      id,
      mimeType: savedFile.mimeType,
      originalFilename: savedFile.originalFilename,
      spaceId,
      storagePath: savedFile.storagePath,
      title: metadata.title,
      uploadedBy: userId,
    });

    await AuditService.log({
      action: 'upload',
      entityId: id,
      entityType: ENTITY_TYPE_RESOURCE,
      metadata: { category: metadata.category, title: metadata.title },
      userId,
    });

    const [resource] = await db.select().from(resources).where(eq(resources.id, id));

    return resource;
  },

  async verifyIntegrity(
    resourceId: string,
  ): Promise<{ actualHash: string; expectedHash: string; verified: boolean }> {
    const resource = await ResourceService.getById(resourceId);
    if (!resource) throw new Error(ERROR_RESOURCE_NOT_FOUND);

    const fullPath = FileService.getFullPath(resource.storagePath);
    const verified = await FileService.verifyIntegrity(resource.storagePath, resource.fileHash);
    const actualHash = await RNFS.hash(fullPath, 'sha256');

    return {
      actualHash,
      expectedHash: resource.fileHash,
      verified,
    };
  },
};
