import { createMMKV } from 'react-native-mmkv';

import CONFIG from '@/config';
import type { User, UserRole } from '@/types';

// MMKV storage for quick key-value access
const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-user',
});

const CURRENT_USER_ID_KEY = 'current_user_id';

/**
 * Get device timezone
 */
function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Get device locale currency (defaults to USD)
 */
function getDeviceCurrency(): string {
  return 'USD';
}

export const UserService = {
  /**
   * Clear current user (for logout/reset)
   */
  clearCurrentUser(): void {
    storage.remove(CURRENT_USER_ID_KEY);
  },

  /**
   * Create a local user from Google OAuth metadata.
   * Parses full_name into first/last and uses the Google email.
   * Skips profile setup screen entirely.
   */
  async createFromGoogle(data: {
    supabaseId: string;
    email: string;
    fullName?: string;
  }): Promise<User> {
    // TODO: Firebase Auth — implement with Firebase Auth + Firestore
    const parts = (data.fullName ?? '').trim().split(/\s+/);
    const firstName = parts[0] ?? 'User';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : undefined;

    storage.set(CURRENT_USER_ID_KEY, data.supabaseId);

    return {
      createdAt: new Date(),
      defaultCurrency: getDeviceCurrency(),
      email: data.email,
      firstName,
      id: data.supabaseId,
      lastName,
      middleName,
      timezone: getDeviceTimezone(),
    };
  },

  /**
   * Create a new user
   */
  async createUser(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    role?: UserRole;
    email?: string;
    id?: string;
    timezone?: string;
    defaultCurrency?: string;
  }): Promise<User> {
    // TODO: Firebase — implement with Firestore
    const id = data.id ?? `local-${Date.now()}`;
    storage.set(CURRENT_USER_ID_KEY, id);

    return {
      createdAt: new Date(),
      defaultCurrency: data.defaultCurrency ?? getDeviceCurrency(),
      email: data.email,
      firstName: data.firstName,
      id,
      lastName: data.lastName,
      middleName: data.middleName,
      role: data.role,
      timezone: data.timezone ?? getDeviceTimezone(),
    };
  },

  /**
   * Get the currently signed-in auth user (id + email).
   * Returns null if not configured or no session exists.
   */
  async getCurrentAuthUser(): Promise<{ id: string; email?: string } | null> {
    // TODO: Firebase Auth — implement with Firebase Auth
    return null;
  },

  /**
   * Get current user from database
   */
  async getCurrentUser(): Promise<User | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Get current user ID from storage
   */
  getCurrentUserId(): string | null {
    return storage.getString(CURRENT_USER_ID_KEY) ?? null;
  },

  /**
   * Get user by ID
   */
  async getUserById(_id: string): Promise<User | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  /**
   * Check if user exists (for onboarding flow)
   */
  async hasUser(): Promise<boolean> {
    // TODO: Firebase — implement with Firestore
    const userId = this.getCurrentUserId();

    return userId !== null;
  },

  /**
   * Manually set the current user ID in storage.
   */
  setCurrentUserId(id: string): void {
    storage.set(CURRENT_USER_ID_KEY, id);
  },

  /**
   * Upsert the current local user into the cloud DB.
   * Called after auth is established so auth uid matches the row id.
   */
  async syncToSupabase(_supabaseUserId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore (renamed to syncToFirestore later)
  },

  /**
   * Update current user
   */
  async updateUser(data: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    role?: UserRole;
    email?: string;
    timezone?: string;
    defaultCurrency?: string;
  }): Promise<User | null> {
    // TODO: Firebase — implement with Firestore
    void data;

    return null;
  },

  /**
   * Upsert a user by ID — safe for both first-time create and retry-after-crash.
   */
  async upsertUser(data: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    role?: UserRole;
    timezone?: string;
    defaultCurrency?: string;
  }): Promise<User> {
    // TODO: Firebase — implement with Firestore
    storage.set(CURRENT_USER_ID_KEY, data.id);

    return {
      createdAt: new Date(),
      defaultCurrency: data.defaultCurrency ?? getDeviceCurrency(),
      email: data.email,
      firstName: data.firstName,
      id: data.id,
      lastName: data.lastName,
      middleName: data.middleName,
      role: data.role,
      timezone: data.timezone ?? getDeviceTimezone(),
    };
  },
};
