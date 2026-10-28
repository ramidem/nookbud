import 'server-only';
import { redirect } from 'next/navigation';
import { getAuth } from './server';
import { SIGN_IN } from './routes';
import type { AuthUser } from './types';

/**
 * The signed-in, verified person for a page or action, or a redirect to sign in. Every signed-in
 * page calls this itself: the proxy's check is only for navigation (R30).
 */
export async function requireUser(returnTo?: string): Promise<AuthUser> {
  const user = await (await getAuth()).getUser();
  if (!user?.emailVerified) {
    redirect(returnTo ? `${SIGN_IN}?next=${encodeURIComponent(returnTo)}` : SIGN_IN);
  }
  return user;
}
