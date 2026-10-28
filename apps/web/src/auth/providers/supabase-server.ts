import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { getPublicEnv } from '../../env/public';
import { sessionCookieOptions } from './cookies';

/** A Supabase client for this request, with the session read from and written to cookies. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const env = getPublicEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions: sessionCookieOptions,
    // Calls come from this server, so pass on who is really asking: the devices list shows the
    // person's browser (R20), and per-address limits count the person, not the server (R16).
    global: { headers: forwardedHeaders(requestHeaders) },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // A Server Component cannot set cookies. Refreshing the session is the job of the proxy.
        }
      },
    },
  });
}

function forwardedHeaders(from: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  const userAgent = from.get('user-agent');
  const forwardedFor = from.get('x-forwarded-for');
  if (userAgent) out['user-agent'] = userAgent;
  if (forwardedFor) out['x-forwarded-for'] = forwardedFor;
  return out;
}
