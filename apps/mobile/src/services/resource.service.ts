import RNFS from 'react-native-fs';

import { FileService } from './file.service';
import { UserService } from './user.service';

import type { Resource, ResourceCategory } from '@/types';

const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_VIEWER_CANNOT_UPLOAD = 'Viewers cannot upload resources';
const ERROR_VIEWER_CANNOT_DELETE = 'Viewers cannot delete resources';
const ERROR_RESOURCE_NOT_FOUND = 'Resource not found';

export type ResourceFilters = {
  category?: ResourceCategory;
  childId?: string;
};

export const ResourceService = {
  async getById(_resourceId: string): Promise<Resource | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  async listBySpace(_spaceId: string, _filters?: ResourceFilters): Promise<Resource[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  async listBySpaces(_spaceIds: string[], _filters?: ResourceFilters): Promise<Resource[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  async softDelete(_resourceId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_RESOURCE_NOT_FOUND;
    void ERROR_VIEWER_CANNOT_DELETE;
  },

  async upload(
    _spaceId: string,
    _fileUri: string,
    _metadata: {
      title: string;
      description?: string;
      category: ResourceCategory;
      childId?: string;
    },
  ): Promise<Resource> {
    // TODO: Firebase — implement with Firestore + Firebase Storage
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_VIEWER_CANNOT_UPLOAD;
    void FileService;

    throw new Error('Not yet implemented');
  },

  async verifyIntegrity(
    _resourceId: string,
  ): Promise<{ actualHash: string; expectedHash: string; verified: boolean }> {
    // TODO: Firebase — implement with Firebase Storage
    void RNFS;
    void FileService;

    throw new Error('Not yet implemented');
  },
};
