import type { CookieOptionsWithName } from '@supabase/ssr';

/**
 * How the session cookies are set (R15). Only the server reads them, so browser JavaScript never
 * can (`httpOnly`). They travel only over HTTPS outside local development, and only on requests
 * that start on this site or follow a link to it (`lax`).
 */
export const sessionCookieOptions: CookieOptionsWithName = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};
