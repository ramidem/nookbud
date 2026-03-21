import { eq, and, gte, lte, desc, ne, inArray, sql } from 'drizzle-orm';

import { db } from '@/database';
import {
  entries,
  entryVersions,
  acknowledgments,
  spaces,
  type EntryType,
  type EntryStatus,
  type AcknowledgmentStatus,
} from '@/database/schema';

export type TimelineEntry = {
  id: string;
  spaceId: string;
  spaceName?: string;
  spaceEmoji?: string;
  spaceColor?: string;
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
  spaceId?: string;
  spaceIds?: string[];
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

const DEFAULT_LIMIT = 20;
const RECENT_LIMIT = 10;

export const TimelineService = {
  /**
   * Get entries for a specific child
   */
  async getByChild(
    spaceId: string,
    childId: string,
    limit = DEFAULT_LIMIT,
  ): Promise<TimelineEntry[]> {
    const result = await this.query({
      childId,
      limit,
      spaceId,
    });

    return result.entries;
  },

  /**
   * Get entries by type
   */
  async getByType(
    spaceId: string,
    type: EntryType,
    limit = DEFAULT_LIMIT,
  ): Promise<TimelineEntry[]> {
    const result = await this.query({
      limit,
      spaceId,
      types: [type],
    });

    return result.entries;
  },

  /**
   * Get disputed entries
   */
  async getDisputed(spaceId: string): Promise<TimelineEntry[]> {
    const result = await this.query({
      limit: 100,
      spaceId,
    });

    return result.entries.filter((entry) => entry.acknowledgmentStatus === 'disputed');
  },

  /**
   * Get pending acknowledgments for current user
   */
  async getPendingForUser(spaceId: string, userId: string): Promise<TimelineEntry[]> {
    // Get entries created by the OTHER user that are pending
    const allEntries = await this.query({
      limit: 100,
      spaceId,
    });

    return allEntries.entries.filter(
      (entry) => entry.createdBy !== userId && entry.acknowledgmentStatus === 'pending',
    );
  },

  /**
   * Get recent entries
   */
  async getRecent(spaceId: string, limit = RECENT_LIMIT): Promise<TimelineEntry[]> {
    const result = await this.query({
      limit,
      spaceId,
    });

    return result.entries;
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

  /**
   * Query timeline entries with filters
   */
  async query(params: TimelineQueryParams): Promise<TimelineResult> {
    const {
      childId,
      dateFrom,
      dateTo,
      includeDeleted = false,
      limit = DEFAULT_LIMIT,
      offset = 0,
      spaceId,
      spaceIds,
      status,
      types,
    } = params;

    // Build conditions — multi-space (All Spaces) or single-space
    const conditions = [];

    if (spaceIds && spaceIds.length > 0) {
      conditions.push(inArray(entries.spaceId, spaceIds));
    } else {
      conditions.push(eq(entries.spaceId, spaceId ?? ''));
    }

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

    // Pre-load space metadata when querying multiple spaces
    const isMultiSpace = spaceIds && spaceIds.length > 0;
    const spaceMap = new Map<string, { name: string; emoji: string; color: string }>();

    if (isMultiSpace) {
      const spaceRows = await db
        .select({ color: spaces.color, emoji: spaces.emoji, id: spaces.id, name: spaces.name })
        .from(spaces)
        .where(inArray(spaces.id, spaceIds));

      for (const row of spaceRows) {
        spaceMap.set(row.id, { color: row.color, emoji: row.emoji, name: row.name });
      }
    }

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

        const spaceMeta = spaceMap.get(entry.spaceId);

        return {
          acknowledgmentStatus: (ack?.status as AcknowledgmentStatus) ?? null,
          childId: entry.childId,
          createdAt: entry.createdAt,
          createdBy: entry.createdBy,
          currentVersion,
          id: entry.id,
          spaceColor: spaceMeta?.color,
          spaceEmoji: spaceMeta?.emoji,
          spaceId: entry.spaceId,
          spaceName: spaceMeta?.name,
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
};
