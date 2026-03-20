import { eq, desc } from 'drizzle-orm';

import { AuditService } from './audit.service';
import { FileService } from './file.service';
import { NotificationService } from './notification.service';
import { UserService } from './user.service';

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
import { computeDiff } from '@/utils/diff.util';

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;
const ERROR_NO_CURRENT_USER = 'No current user';
const AUDIT_ACTION_CREATE = 'create';
const AUDIT_ENTITY_ENTRY = 'entry';

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
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const entryId = generateUUID();
    const versionId = generateUUID();

    // Start transaction
    await opsqlite.execute('BEGIN TRANSACTION');

    try {
      // Create entry
      const newEntry: NewEntry = {
        childId: data.childId,
        createdBy: userId,
        currentVersionId: versionId,
        id: entryId,
        relationshipId: data.relationshipId,
        status: 'active',
        type: data.type,
      };
      await db.insert(entries).values(newEntry);

      // Create initial version
      const newVersion: NewEntryVersion = {
        contentJson: JSON.stringify(data.content),
        // No diff for first version
        createdBy: userId,

        diffJson: null,

        entryId,
        id: versionId,
        versionNumber: 1,
      };
      await db.insert(entryVersions).values(newVersion);

      // Process attachments if any
      if (data.attachmentInputs && data.attachmentInputs.length > 0) {
        for (const input of data.attachmentInputs) {
          const saved = await FileService.saveFile(input.sourceUri, input.filename, input.mimeType);

          const attachmentId = generateUUID();
          const newAttachment: NewAttachment = {
            entryVersionId: versionId,
            fileHash: saved.fileHash,
            fileSizeBytes: saved.fileSize,
            id: attachmentId,
            mimeType: saved.mimeType,
            originalFilename: saved.originalFilename,
            storagePath: saved.storagePath,
            uploadedBy: userId,
          };
          await db.insert(attachments).values(newAttachment);

          await AuditService.log({
            action: AUDIT_ACTION_CREATE,
            entityId: attachmentId,
            entityType: 'attachment',
            metadata: {
              entryId,
              filename: saved.originalFilename,
              hash: saved.fileHash,
              versionId,
            },
            userId,
          });
        }
      }

      // Create pending acknowledgment for other parent
      const ackId = generateUUID();
      await db.insert(acknowledgments).values({
        actedBy: null,
        comment: null,
        entryId,
        id: ackId,
        status: 'pending',
      });

      await opsqlite.execute('COMMIT');

      // Audit log
      await AuditService.log({
        action: AUDIT_ACTION_CREATE,
        entityId: entryId,
        entityType: AUDIT_ENTITY_ENTRY,
        metadata: {
          childId: data.childId,
          relationshipId: data.relationshipId,
          type: data.type,
          versionId,
        },
        userId,
      });

      const [entry] = await db.select().from(entries).where(eq(entries.id, entryId));

      // Notify partner about the new entry (silently fails if permissions denied)
      NotificationService.notifyNewEntry(entry).catch(() => {});

      return entry;
    } catch (error) {
      await opsqlite.execute('ROLLBACK');
      throw error;
    }
  },

  /**
   * Get attachments for a version
   */
  async getAttachments(versionId: string) {
    return db.select().from(attachments).where(eq(attachments.entryVersionId, versionId));
  },

  /**
   * Get entry by ID
   */
  async getById(id: string): Promise<Entry | null> {
    const [entry] = await db.select().from(entries).where(eq(entries.id, id));

    return entry ?? null;
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

    const [ack] = await db.select().from(acknowledgments).where(eq(acknowledgments.entryId, id));

    return {
      ...entry,
      acknowledgmentStatus: ack?.status ?? null,
      currentVersion,
    };
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
  async softDelete(entryId: string): Promise<Entry> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const entry = await this.getById(entryId);
    if (!entry) throw new Error('Entry not found');

    await db.update(entries).set({ status: 'soft_deleted' }).where(eq(entries.id, entryId));

    await AuditService.log({
      action: 'soft_delete',
      entityId: entryId,
      entityType: AUDIT_ENTITY_ENTRY,
      metadata: {
        previousStatus: entry.status,
      },
      userId,
    });

    const [updated] = await db.select().from(entries).where(eq(entries.id, entryId));

    return updated;
  },

  /**
   * Update an entry (creates new version)
   */
  async update(
    entryId: string,
    data: {
      content: Record<string, unknown>;
      attachmentInputs?: AttachmentInput[];
    },
  ): Promise<Entry> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const entry = await this.getById(entryId);
    if (!entry) throw new Error('Entry not found');

    // Get current version
    const [currentVersion] = await db
      .select()
      .from(entryVersions)
      .where(eq(entryVersions.id, entry.currentVersionId ?? ''));

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
        contentJson: JSON.stringify(data.content),
        createdBy: userId,
        diffJson: JSON.stringify(diff),
        entryId,
        id: newVersionId,
        versionNumber: newVersionNumber,
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
          const saved = await FileService.saveFile(input.sourceUri, input.filename, input.mimeType);

          const attachmentId = generateUUID();
          const newAttachment: NewAttachment = {
            entryVersionId: newVersionId,
            fileHash: saved.fileHash,
            fileSizeBytes: saved.fileSize,
            id: attachmentId,
            mimeType: saved.mimeType,
            originalFilename: saved.originalFilename,
            storagePath: saved.storagePath,
            uploadedBy: userId,
          };
          await db.insert(attachments).values(newAttachment);

          await AuditService.log({
            action: AUDIT_ACTION_CREATE,
            entityId: attachmentId,
            entityType: 'attachment',
            metadata: {
              entryId,
              filename: saved.originalFilename,
              hash: saved.fileHash,
              versionId: newVersionId,
            },
            userId,
          });
        }
      }

      await opsqlite.execute('COMMIT');

      await AuditService.log({
        action: 'update',
        entityId: entryId,
        entityType: AUDIT_ENTITY_ENTRY,
        metadata: {
          diff,
          newVersionId,
          previousVersionId: currentVersion.id,
          versionNumber: newVersionNumber,
        },
        userId,
      });

      const [updated] = await db.select().from(entries).where(eq(entries.id, entryId));

      return updated;
    } catch (error) {
      await opsqlite.execute('ROLLBACK');
      throw error;
    }
  },
};
