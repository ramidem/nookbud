import { FileService } from './file.service';
import { UserService } from './user.service';

import type { Entry, EntryType, EntryVersion } from '@/types';
import { computeDiff } from '@/utils/diff.util';

const ERROR_NO_CURRENT_USER = 'No current user';

export type EntryWithVersion = Entry & {
  currentVersion: EntryVersion | null;
  acknowledgmentStatus: 'pending' | 'acknowledged' | 'disputed' | null;
};

export type AttachmentInput = {
  sourceUri: string;
  filename: string;
  mimeType: string;
};

export const EntryService = {
  /**
   * Create a new entry with initial version
   */
  async create(data: {
    spaceId?: string;
    /** @deprecated Use spaceId — kept for screen compatibility until Story 39+ */
    relationshipId?: string;
    type: EntryType;
    content: Record<string, unknown>;
    childId?: string;
    attachmentInputs?: AttachmentInput[];
  }): Promise<Entry> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void FileService;

    return {
      childId: data.childId ?? null,
      createdAt: new Date(),
      createdBy: userId,
      currentVersionId: 'stub',
      id: 'stub',
      spaceId: data.spaceId ?? data.relationshipId ?? '',
      status: 'active',
      type: data.type,
    };
  },

  /**
   * Get attachments for a version
   */
  async getAttachments(_versionId: string) {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Get entry by ID
   */
  async getById(_id: string): Promise<Entry | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get all versions of an entry
   */
  async getVersionHistory(_entryId: string): Promise<EntryVersion[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Get entry with current version and acknowledgment status
   */
  async getWithDetails(_id: string): Promise<EntryWithVersion | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Parse content from version
   */
  parseContent<T = Record<string, unknown>>(version: EntryVersion): T {
    return JSON.parse(version.contentJson) as T;
  },

  /**
   * Soft delete an entry
   */
  async softDelete(_entryId: string): Promise<Entry> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    throw new Error('Not yet implemented');
  },

  /**
   * Update an entry (creates new version)
   */
  async update(
    _entryId: string,
    _data: {
      content: Record<string, unknown>;
      attachmentInputs?: AttachmentInput[];
    },
  ): Promise<Entry> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void computeDiff;

    throw new Error('Not yet implemented');
  },
};
