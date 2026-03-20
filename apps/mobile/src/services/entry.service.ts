import { eq, and, desc } from 'drizzle-orm';
import { db, opsqlite } from '@/database';
import {
  entries,
  entryVersions,
  attachments,
  acknowledgments,
  type Entry,
  type NewEntry,
  type EntryVersion,
  type NewEntryVersion,
  type NewAttachment,
  type EntryType,
} from '@/database/schema';
import { AuditService } from './audit.service';
import { FileService, type SavedFile } from './file.service';
import { UserService } from './user.service';
import { computeDiff } from '@/utils/diff.util';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
    relationshipId: string;
    type: EntryType;
    content: Record<string, unknown>;
    childId?: string;
    attachmentInputs?: AttachmentInput[];
  }): Promise<Entry> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const entryId = generateUUID();
    const versionId = generateUUID();

    // Start transaction
    await opsqlite.execute('BEGIN TRANSACTION');

    try {
      // Create entry
      const newEntry: NewEntry = {
        id: entryId,
        relationshipId: data.relationshipId,
        childId: data.childId,
        type: data.type,
        createdBy: userId,
        status: 'active',
        currentVersionId: versionId,
      };
      await db.insert(entries).values(newEntry);

      // Create initial version
      const newVersion: NewEntryVersion = {
        id: versionId,
        entryId,
        versionNumber: 1,
        contentJson: JSON.stringify(data.content),
        diffJson: null, // No diff for first version
        createdBy: userId,
      };
      await db.insert(entryVersions).values(newVersion);

      // Process attachments if any
      if (data.attachmentInputs && data.attachmentInputs.length > 0) {
        for (const input of data.attachmentInputs) {
          const saved = await FileService.saveFile(
            input.sourceUri,
            input.filename,
            input.mimeType
          );

          const attachmentId = generateUUID();
          const newAttachment: NewAttachment = {
            id: attachmentId,
            entryVersionId: versionId,
            originalFilename: saved.originalFilename,
            storagePath: saved.storagePath,
            fileHash: saved.fileHash,
            fileSizeBytes: saved.fileSize,
            mimeType: saved.mimeType,
            uploadedBy: userId,
          };
          await db.insert(attachments).values(newAttachment);

          await AuditService.log(userId, 'create', 'attachment', attachmentId, {
            entryId,
            versionId,
            filename: saved.originalFilename,
            hash: saved.fileHash,
          });
        }
      }

      // Create pending acknowledgment for other parent
      const ackId = generateUUID();
      await db.insert(acknowledgments).values({
        id: ackId,
        entryId,
        status: 'pending',
        actedBy: null,
        comment: null,
      });

      await opsqlite.execute('COMMIT');

      // Audit log
      await AuditService.log(userId, 'create', 'entry', entryId, {
        type: data.type,
        versionId,
        relationshipId: data.relationshipId,
        childId: data.childId,
      });

      const [entry] = await db
        .select()
        .from(entries)
        .where(eq(entries.id, entryId));
      return entry;
    } catch (error) {
      await opsqlite.execute('ROLLBACK');
      throw error;
    }
  },

  /**
   * Update an entry (creates new version)
   */
  async update(
    entryId: string,
    data: {
      content: Record<string, unknown>;
      attachmentInputs?: AttachmentInput[];
    }
  ): Promise<Entry> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const entry = await this.getById(entryId);
    if (!entry) throw new Error('Entry not found');

    // Get current version
    const [currentVersion] = await db
      .select()
      .from(entryVersions)
      .where(eq(entryVersions.id, entry.currentVersionId!));

    if (!currentVersion) throw new Error('Current version not found');

    const previousContent = JSON.parse(currentVersion.contentJson);
    const newVersionId = generateUUID();
    const newVersionNumber = currentVersion.versionNumber + 1;

    // Compute diff
    const diff = computeDiff(previousContent, data.content);

    await opsqlite.execute('BEGIN TRANSACTION');

    try {
      // Create new version
      const newVersion: NewEntryVersion = {
        id: newVersionId,
        entryId,
        versionNumber: newVersionNumber,
        contentJson: JSON.stringify(data.content),
        diffJson: JSON.stringify(diff),
        createdBy: userId,
      };
      await db.insert(entryVersions).values(newVersion);

      // Update entry's current version pointer
      await db
        .update(entries)
        .set({ currentVersionId: newVersionId })
        .where(eq(entries.id, entryId));

      // Process new attachments if any
      if (data.attachmentInputs && data.attachmentInputs.length > 0) {
        for (const input of data.attachmentInputs) {
          const saved = await FileService.saveFile(
            input.sourceUri,
            input.filename,
            input.mimeType
          );

          const attachmentId = generateUUID();
          const newAttachment: NewAttachment = {
            id: attachmentId,
            entryVersionId: newVersionId,
            originalFilename: saved.originalFilename,
            storagePath: saved.storagePath,
            fileHash: saved.fileHash,
            fileSizeBytes: saved.fileSize,
            mimeType: saved.mimeType,
            uploadedBy: userId,
          };
          await db.insert(attachments).values(newAttachment);

          await AuditService.log(userId, 'create', 'attachment', attachmentId, {
            entryId,
            versionId: newVersionId,
            filename: saved.originalFilename,
            hash: saved.fileHash,
          });
        }
      }

      await opsqlite.execute('COMMIT');

      await AuditService.log(userId, 'update', 'entry', entryId, {
        previousVersionId: currentVersion.id,
        newVersionId,
        versionNumber: newVersionNumber,
        diff,
      });

      const [updated] = await db
        .select()
        .from(entries)
        .where(eq(entries.id, entryId));
      return updated;
    } catch (error) {
      await opsqlite.execute('ROLLBACK');
      throw error;
    }
  },

  /**
   * Soft delete an entry
   */
  async softDelete(entryId: string): Promise<Entry> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error('No current user');

    const entry = await this.getById(entryId);
    if (!entry) throw new Error('Entry not found');

    await db
      .update(entries)
      .set({ status: 'soft_deleted' })
      .where(eq(entries.id, entryId));

    await AuditService.log(userId, 'soft_delete', 'entry', entryId, {
      previousStatus: entry.status,
    });

    const [updated] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entryId));
    return updated;
  },

  /**
   * Get entry by ID
   */
  async getById(id: string): Promise<Entry | null> {
    const [entry] = await db.select().from(entries).where(eq(entries.id, id));
    return entry ?? null;
  },

  /**
   * Get entry with current version and acknowledgment status
   */
  async getWithDetails(id: string): Promise<EntryWithVersion | null> {
    const entry = await this.getById(id);
    if (!entry) return null;

    let currentVersion: EntryVersion | null = null;
    if (entry.currentVersionId) {
      const [version] = await db
        .select()
        .from(entryVersions)
        .where(eq(entryVersions.id, entry.currentVersionId));
      currentVersion = version ?? null;
    }

    const [ack] = await db
      .select()
      .from(acknowledgments)
      .where(eq(acknowledgments.entryId, id));

    return {
      ...entry,
      currentVersion,
      acknowledgmentStatus: ack?.status ?? null,
    };
  },

  /**
   * Get all versions of an entry
   */
  async getVersionHistory(entryId: string): Promise<EntryVersion[]> {
    return db
      .select()
      .from(entryVersions)
      .where(eq(entryVersions.entryId, entryId))
      .orderBy(desc(entryVersions.versionNumber));
  },

  /**
   * Get attachments for a version
   */
  async getAttachments(versionId: string) {
    return db
      .select()
      .from(attachments)
      .where(eq(attachments.entryVersionId, versionId));
  },

  /**
   * Parse content from version
   */
  parseContent<T = Record<string, unknown>>(version: EntryVersion): T {
    return JSON.parse(version.contentJson) as T;
  },
};
