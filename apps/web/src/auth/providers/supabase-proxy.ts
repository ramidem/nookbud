import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getPublicEnv } from '../../env/public';
import type { AuthUser } from '../types';

/**
 * Refreshes the session cookies on every request, so a person stays signed in while they use
 * Nookbud and their session ends when it expires (R12). Returns the response to send on and the
 * user the session belongs to, checked with the provider.
 */
export async function refreshSupabaseSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: AuthUser | null }> {
  const env = getPublicEnv();
  let response = NextResponse.next({ request });

  const client = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          for (const { name, value } of toSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
        },
      },
    },
  );

  // getUser checks the token with the provider; never trust the cookie alone.
  const { data } = await client.auth.getUser();
  const user = data.user
    ? {
        id: data.user.id,
        email: data.user.email ?? null,
        emailVerified: Boolean(data.user.email_confirmed_at),
      }
    : null;
  return { response, user };
}
