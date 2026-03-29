import type { EntryType, EntryStatus, AcknowledgmentStatus } from '@/types';

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
    // TODO: Firebase — implement with Firestore
    const result = await this.query({ childId, limit, spaceId });

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
    // TODO: Firebase — implement with Firestore
    const result = await this.query({ limit, spaceId, types: [type] });

    return result.entries;
  },

  /**
   * Get disputed entries
   */
  async getDisputed(spaceId: string): Promise<TimelineEntry[]> {
    // TODO: Firebase — implement with Firestore
    const result = await this.query({ limit: 100, spaceId });

    return result.entries.filter((entry) => entry.acknowledgmentStatus === 'disputed');
  },

  /**
   * Get pending acknowledgments for current user
   */
  async getPendingForUser(spaceId: string, userId: string): Promise<TimelineEntry[]> {
    // TODO: Firebase — implement with Firestore
    const allEntries = await this.query({ limit: 100, spaceId });

    return allEntries.entries.filter(
      (entry) => entry.createdBy !== userId && entry.acknowledgmentStatus === 'pending',
    );
  },

  /**
   * Get recent entries
   */
  async getRecent(spaceId: string, limit = RECENT_LIMIT): Promise<TimelineEntry[]> {
    // TODO: Firebase — implement with Firestore
    const result = await this.query({ limit, spaceId });

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
  async query(_params: TimelineQueryParams): Promise<TimelineResult> {
    // TODO: Firebase — implement with Firestore
    return {
      entries: [],
      hasMore: false,
      total: 0,
    };
  },
};
