import { eq, and, gte, lte, desc, ne, inArray, sql } from 'drizzle-orm';

import { db } from '@/database';
import {
  entries,
  entryVersions,
  acknowledgments,
  type Entry,
  type EntryVersion,
  type EntryType,
  type EntryStatus,
  type AcknowledgmentStatus,
} from '@/database/schema';

export type TimelineEntry = {
  id: string;
  relationshipId: string;
  childId: string | null;
  type: EntryType;
  createdBy: string;
  status: EntryStatus;
  createdAt: Date;
  currentVersion: {
    id: string;
    versionNumber: number;
    contentJson: string;
    createdAt: Date;
  } | null;
  acknowledgmentStatus: AcknowledgmentStatus | null;
};

export type TimelineQueryParams = {
  relationshipId: string;
  childId?: string;
  types?: EntryType[];
  dateFrom?: Date;
  dateTo?: Date;
  status?: EntryStatus;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
};

export type TimelineResult = {
  entries: TimelineEntry[];
  total: number;
  hasMore: boolean;
};

export const TimelineService = {
  /**
   * Get entries for a specific child
   */
  async getByChild(relationshipId: string, childId: string, limit = 20): Promise<TimelineEntry[]> {
    const result = await this.query({
      childId,
      limit,
      relationshipId,
    });

    return result.entries;
  },

  /**
   * Get entries by type
   */
  async getByType(relationshipId: string, type: EntryType, limit = 20): Promise<TimelineEntry[]> {
    const result = await this.query({
      limit,
      relationshipId,
      types: [type],
    });

    return result.entries;
  },

  /**
   * Get disputed entries
   */
  async getDisputed(relationshipId: string): Promise<TimelineEntry[]> {
    const result = await this.query({
      limit: 100,
      relationshipId,
    });

    return result.entries.filter((entry) => entry.acknowledgmentStatus === 'disputed');
  },

  /**
   * Get pending acknowledgments for current user
   */
  async getPendingForUser(relationshipId: string, userId: string): Promise<TimelineEntry[]> {
    // Get entries created by the OTHER user that are pending
    const allEntries = await this.query({
      limit: 100,
      relationshipId,
    });

    return allEntries.entries.filter(
      (entry) => entry.createdBy !== userId && entry.acknowledgmentStatus === 'pending',
    );
  },

  /**
   * Get recent entries
   */
  async getRecent(relationshipId: string, limit = 10): Promise<TimelineEntry[]> {
    const result = await this.query({
      limit,
      relationshipId,
    });

    return result.entries;
  },

  /**
   * Query timeline entries with filters
   */
  async query(params: TimelineQueryParams): Promise<TimelineResult> {
    const {
      childId,
      dateFrom,
      dateTo,
      includeDeleted = false,
      limit = 20,
      offset = 0,
      relationshipId,
      status,
      types,
    } = params;

    // Build conditions
    const conditions = [eq(entries.relationshipId, relationshipId)];

    if (!includeDeleted) {
      conditions.push(ne(entries.status, 'soft_deleted'));
    }

    if (status) {
      conditions.push(eq(entries.status, status));
    }

    if (childId) {
      conditions.push(eq(entries.childId, childId));
    }

    if (types && types.length > 0) {
      conditions.push(inArray(entries.type, types));
    }

    if (dateFrom) {
      conditions.push(gte(entries.createdAt, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(entries.createdAt, dateTo));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(entries)
      .where(and(...conditions));
    const total = Number(countResult[0]?.count ?? 0);

    // Get entries
    const entryResults = await db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.createdAt))
      .limit(limit)
      .offset(offset);

    // Hydrate with versions and acknowledgments
    const timelineEntries: TimelineEntry[] = await Promise.all(
      entryResults.map(async (entry) => {
        // Get current version
        let currentVersion: TimelineEntry['currentVersion'] = null;
        if (entry.currentVersionId) {
          const [version] = await db
            .select({
              contentJson: entryVersions.contentJson,
              createdAt: entryVersions.createdAt,
              id: entryVersions.id,
              versionNumber: entryVersions.versionNumber,
            })
            .from(entryVersions)
            .where(eq(entryVersions.id, entry.currentVersionId));
          currentVersion = version ?? null;
        }

        // Get acknowledgment status
        const [ack] = await db
          .select({ status: acknowledgments.status })
          .from(acknowledgments)
          .where(eq(acknowledgments.entryId, entry.id));

        return {
          childId: entry.childId,
          createdAt: entry.createdAt,
          createdBy: entry.createdBy,
          acknowledgmentStatus: (ack?.status as AcknowledgmentStatus) ?? null,
          id: entry.id,
          currentVersion,
          relationshipId: entry.relationshipId,
          status: entry.status as EntryStatus,
          type: entry.type as EntryType,
        };
      }),
    );

    return {
      entries: timelineEntries,
      hasMore: offset + entryResults.length < total,
      total,
    };
  },

  /**
   * Parse content from timeline entry
   */
  parseContent<T = Record<string, unknown>>(entry: TimelineEntry): T | null {
    if (!entry.currentVersion) return null;
    try {
      return JSON.parse(entry.currentVersion.contentJson) as T;
    } catch {
      return null;
    }
  },
};
