import { eq } from 'drizzle-orm';
import { createMMKV } from 'react-native-mmkv';

import CONFIG from '@/config';
import { db } from '@/database';
import { users, type User, type NewUser } from '@/database/schema';

// MMKV storage for quick key-value access
const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-user',
});

const CURRENT_USER_ID_KEY = 'current_user_id';

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
  // In a real app, you'd use react-native-localize
  // For now, default to USD
  return 'USD';
}

export const UserService = {
  /**
   * Clear current user (for logout/reset)
   */
  clearCurrentUser(): void {
    storage.delete(CURRENT_USER_ID_KEY);
  },

  /**
   * Create a new user
   */
  async createUser(data: {
    displayName: string;
    email?: string;
    timezone?: string;
    defaultCurrency?: string;
  }): Promise<User> {
    const id = generateUUID();
    const newUser: NewUser = {
      defaultCurrency: data.defaultCurrency ?? getDeviceCurrency(),
      displayName: data.displayName,
      email: data.email,
      id,
      timezone: data.timezone ?? getDeviceTimezone(),
    };

    await db.insert(users).values(newUser);

    // Set as current user
    storage.set(CURRENT_USER_ID_KEY, id);

    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  },

  /**
   * Get current user from database
   */
  async getCurrentUser(): Promise<User | null> {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    return user ?? null;
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
  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user ?? null;
  },

  /**
   * Check if user exists (for onboarding flow)
   */
  async hasUser(): Promise<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    const user = await this.getUserById(userId);

    return user !== null;
  },

  /**
   * Update current user
   */
  async updateUser(data: {
    displayName?: string;
    email?: string;
    timezone?: string;
    defaultCurrency?: string;
  }): Promise<User | null> {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    await db
      .update(users)
      .set({
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.defaultCurrency && { defaultCurrency: data.defaultCurrency }),
      })
      .where(eq(users.id, userId));

    return this.getCurrentUser();
  },
};
