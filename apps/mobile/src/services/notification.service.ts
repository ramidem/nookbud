import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { createMMKV } from 'react-native-mmkv';

import { UserService } from './user.service';

import CONFIG from '@/config';
import type { Entry, EntryType, Dispute } from '@/types';

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

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

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

function mapAuthorizationStatus(status: AuthorizationStatus): PermissionStatus {
  switch (status) {
    case AuthorizationStatus.AUTHORIZED:
    case AuthorizationStatus.PROVISIONAL:
      return 'granted';
    case AuthorizationStatus.DENIED:
      return 'denied';
    default:
      return 'undetermined';
  }
}

export const NotificationService = {
  async getPermissionStatus(): Promise<PermissionStatus> {
    const settings = await notifee.getNotificationSettings();

    return mapAuthorizationStatus(settings.authorizationStatus);
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
      data: { entryId: entry.id } as Record<string, string>,
      title: 'Entry Acknowledged',
    });
  },

  async notifyDisputeResponse(dispute: Dispute): Promise<void> {
    const prefs = this.getPrefs();
    if (!prefs.disputeResponse) return;

    if (!this.isOtherParentsAction(dispute.raisedBy)) return;

    await this.schedule({
      body: 'New response to a dispute on your entry',
      data: { entryId: dispute.entryId } as Record<string, string>,
      title: 'Dispute Response',
    });
  },

  async notifyDisputed(entry: Entry): Promise<void> {
    const prefs = this.getPrefs();
    if (!prefs.disputed) return;

    if (!this.isOtherParentsAction(entry.createdBy)) return;

    await this.schedule({
      body: `Your ${ENTRY_TYPE_LABELS[entry.type].toLowerCase()} entry was disputed`,
      data: { entryId: entry.id } as Record<string, string>,
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
      data: { entryId: entry.id } as Record<string, string>,
      title: `New ${typeLabel} Added`,
    });
  },

  async requestPermissions(): Promise<boolean> {
    storage.set(PERMISSION_REQUESTED_KEY, true);

    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) return true;

    const newSettings = await notifee.requestPermission();

    return newSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  },

  savePrefs(prefs: NotificationPrefs): void {
    storage.set(PREFS_KEY, JSON.stringify(prefs));
  },

  async schedule(content: {
    title: string;
    body: string;
    data?: Record<string, string | number | object>;
  }): Promise<void> {
    const status = await this.getPermissionStatus();
    if (status !== 'granted') return;

    await notifee.displayNotification({
      body: content.body,
      data: content.data,
      title: content.title,
    });
  },
};
