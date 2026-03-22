import { eq } from 'drizzle-orm';
import { createMMKV } from 'react-native-mmkv';

import CONFIG from '@/config';
import { getSupabaseClient } from '@/config/supabase';
import { db } from '@/database';
import { users, type User, type NewUser, type UserRole } from '@/database/schema';

// MMKV storage for quick key-value access
const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'coparent-user',
});

const CURRENT_USER_ID_KEY = 'current_user_id';

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

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
   * Create a local user from Google OAuth metadata.
   * Parses full_name into first/last and uses the Google email.
   * Skips profile setup screen entirely.
   */
  async createFromGoogle(data: {
    supabaseId: string;
    email: string;
    fullName?: string;
  }): Promise<User> {
    // Parse "First Last" or "First Middle Last" from Google's full_name
    const parts = (data.fullName ?? '').trim().split(/\s+/);
    const firstName = parts[0] ?? 'User';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : undefined;

    const newUser: NewUser = {
      defaultCurrency: getDeviceCurrency(),
      email: data.email,
      firstName,
      id: data.supabaseId,
      lastName,
      middleName,
      timezone: getDeviceTimezone(),
    };

    await db.insert(users).values(newUser).onConflictDoNothing();
    storage.set(CURRENT_USER_ID_KEY, data.supabaseId);

    const [user] = await db.select().from(users).where(eq(users.id, data.supabaseId));

    return user;
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
    const id = data.id ?? generateUUID();
    const newUser: NewUser = {
      defaultCurrency: data.defaultCurrency ?? getDeviceCurrency(),
      email: data.email,
      firstName: data.firstName,
      id,
      lastName: data.lastName,
      middleName: data.middleName,
      role: data.role,
      timezone: data.timezone ?? getDeviceTimezone(),
    };

    await db.insert(users).values(newUser);

    // Set as current user
    storage.set(CURRENT_USER_ID_KEY, id);

    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  },

  /**
   * Get the currently signed-in Supabase auth user (id + email).
   * Returns null if Supabase is not configured or no session exists.
   */
  async getCurrentAuthUser(): Promise<{ id: string; email?: string } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data } = await client.auth.getUser();

    if (!data.user) return null;

    return { email: data.user.email, id: data.user.id };
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
   * Manually set the current user ID in storage.
   * Use to re-anchor MMKV after a cleared state when the SQLite row already exists.
   */
  setCurrentUserId(id: string): void {
    storage.set(CURRENT_USER_ID_KEY, id);
  },

  /**
   * Upsert the current local user into Supabase public.users.
   * Called after Supabase auth is established so auth.uid() matches the row id.
   * The Supabase user id (from auth) replaces the local UUID so RLS works correctly.
   */
  async syncToSupabase(supabaseUserId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const localUser = await this.getCurrentUser();
    if (!localUser) return;

    const { error } = await client.from('users').upsert(
      {
        default_currency: localUser.defaultCurrency,
        email: localUser.email,
        first_name: localUser.firstName,
        id: supabaseUserId,
        last_name: localUser.lastName,
        middle_name: localUser.middleName,
        role: localUser.role,
        timezone: localUser.timezone,
      },
      { onConflict: 'id' },
    );

    if (error) {
      throw new Error(`Failed to sync user to Supabase: ${error.message}`);
    }

    // Update local user id to match Supabase auth.uid() so they stay in sync
    if (localUser.id !== supabaseUserId) {
      await db.update(users).set({ email: localUser.email }).where(eq(users.id, localUser.id));
      storage.set(CURRENT_USER_ID_KEY, supabaseUserId);
    }
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
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    await db
      .update(users)
      .set({
        ...(data.defaultCurrency && { defaultCurrency: data.defaultCurrency }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.middleName !== undefined && { middleName: data.middleName }),
        ...(data.role && { role: data.role }),
        ...(data.timezone && { timezone: data.timezone }),
      })
      .where(eq(users.id, userId));

    return this.getCurrentUser();
  },
};
