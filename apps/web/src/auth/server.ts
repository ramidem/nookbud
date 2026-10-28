import 'server-only';
import { createSupabaseAuth } from './providers/supabase';
import { createSupabaseAuthDeps } from './providers/supabase-deps';
import { createSupabaseServerClient } from './providers/supabase-server';
import type { AuthService } from './types';

/** Auth for the current request. This is the one place the app picks its auth provider. */
export async function getAuth(): Promise<AuthService> {
  const client = await createSupabaseServerClient();
  return createSupabaseAuth(client, createSupabaseAuthDeps(client));
}
