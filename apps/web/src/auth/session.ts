import 'server-only';
import { redirect } from 'next/navigation';
import { getAuth } from './server';
import { SIGN_IN, SIGN_IN_CODE } from './routes';
import type { AuthUser } from './types';

/**
 * The signed-in, verified person for a page or action, or a redirect to sign in. Every signed-in
 * page calls this itself: the proxy's check is only for navigation (R30).
 */
export async function requireUser(returnTo?: string): Promise<AuthUser> {
  const auth = await getAuth();
  const user = await auth.getUser();
  const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : '';
  if (!user?.emailVerified) redirect(`${SIGN_IN}${next}`);
  if ((await auth.twoStepStatus()).codeNeeded) redirect(`${SIGN_IN_CODE}${next}`);
  return user;
}
