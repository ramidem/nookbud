import * as Notifications from 'expo-notifications';
import { createMMKV } from 'react-native-mmkv';

import { UserService } from './user.service';

import CONFIG from '@/config';
import type { Entry, EntryType, Dispute } from '@/database/schema';

const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-notifications',
});

const PREFS_KEY = 'notification_prefs';
const PERMISSION_REQUESTED_KEY = 'notification_permission_requested';

export type NotificationPrefs = {
  newEntry: boolean;
  acknowledged: boolean;
  disputed: boolean;
  disputeResponse: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  acknowledged: true,
  disputeResponse: true,
  disputed: true,
  newEntry: true,
};

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  agreement: 'Agreement',
  communication: 'Communication',
  event: 'Event',
  expense: 'Expense',
  upload: 'Upload',
};

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    return Notifications.getPermissionsAsync().then(({ status }) => status);
  },

  getPrefs(): NotificationPrefs {
    const raw = storage.getString(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;

    try {
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PREFS;
    }
  },

  hasRequestedPermission(): boolean {
    return storage.getBoolean(PERMISSION_REQUESTED_KEY) === true;
  },

  /**
   * Check if an action was performed on the current user's entry.
   * The notification goes to the entry creator when someone else acts on their entry.
   */
  isOtherParentsAction(entryCreatorId: string): boolean {
    const currentUserId = UserService.getCurrentUserId();
    if (!currentUserId) return false;

    return entryCreatorId === currentUserId;
  },

  async notifyAcknowledged(entry: Entry): Promise<void> {
    const prefs = this.getPrefs();
    if (!prefs.acknowledged) return;

    if (!this.isOtherParentsAction(entry.createdBy)) return;

    await this.schedule({
      body: `Your ${ENTRY_TYPE_LABELS[entry.type].toLowerCase()} entry was acknowledged`,
      data: { entryId: entry.id },
      title: 'Entry Acknowledged',
    });
  },

  async notifyDisputeResponse(dispute: Dispute): Promise<void> {
    const prefs = this.getPrefs();
    if (!prefs.disputeResponse) return;

    if (!this.isOtherParentsAction(dispute.raisedBy)) return;

    await this.schedule({
      body: 'New response to a dispute on your entry',
      data: { entryId: dispute.entryId },
      title: 'Dispute Response',
    });
  },

  async notifyDisputed(entry: Entry): Promise<void> {
    const prefs = this.getPrefs();
    if (!prefs.disputed) return;

    if (!this.isOtherParentsAction(entry.createdBy)) return;

    await this.schedule({
      body: `Your ${ENTRY_TYPE_LABELS[entry.type].toLowerCase()} entry was disputed`,
      data: { entryId: entry.id },
      title: 'Entry Disputed',
    });
  },

  async notifyNewEntry(entry: Entry): Promise<void> {
    const prefs = this.getPrefs();
    if (!prefs.newEntry) return;

    // Only notify for the OTHER parent's actions
    const currentUserId = UserService.getCurrentUserId();
    if (!currentUserId || entry.createdBy === currentUserId) return;

    const typeLabel = ENTRY_TYPE_LABELS[entry.type];

    await this.schedule({
      body: `Partner added a new ${typeLabel.toLowerCase()} entry`,
      data: { entryId: entry.id },
      title: `New ${typeLabel} Added`,
    });
  },

  async requestPermissions(): Promise<boolean> {
    storage.set(PERMISSION_REQUESTED_KEY, true);

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();

    return status === 'granted';
  },

  savePrefs(prefs: NotificationPrefs): void {
    storage.set(PREFS_KEY, JSON.stringify(prefs));
  },

  async schedule(content: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    const status = await this.getPermissionStatus();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        body: content.body,
        data: content.data,
        sound: true,
        title: content.title,
      },
      trigger: null, // Immediate
    });
  },
};
