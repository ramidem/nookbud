import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import CONFIG from '@/config';

let supabaseInstance: SupabaseClient | null = null;

function hasSupabaseConfig(): boolean {
  return Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
}

/**
 * Returns the Supabase client if credentials are configured, or null if not.
 * The app works fully offline without Supabase — this is additive.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = CONFIG.SUPABASE_URL as string;
    const key = CONFIG.SUPABASE_ANON_KEY as string;

    supabaseInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: AsyncStorage,
      },
    });
  }

  return supabaseInstance;
}

export { hasSupabaseConfig };
