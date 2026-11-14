import { type NextRequest, NextResponse } from 'next/server';
import { type EmailLinkType, getAuth } from '@/auth';
import { siteOrigin } from '../../../auth-actions/origin';
import { HOME, NEW_PASSWORD, SIGN_IN, WELCOME, safeNext } from '../../../auth/routes';

const TYPES: EmailLinkType[] = ['email', 'recovery', 'email_change'];

/**
 * Every link in a Nookbud email lands here (R9, R14). The link is checked on the server, works
 * once, and signs the person in. A bad link goes to sign-in with a message, never to an error page.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get('token_hash');
  const type = params.get('type') as EmailLinkType | null;
  const fallback = type === 'recovery' ? NEW_PASSWORD : type === 'email' ? WELCOME : HOME;
  const next = safeNext(params.get('next'), fallback);

  // Behind Tailscale Serve, Next builds request.url from its own localhost address.
  // Send the browser back to the host it actually used.
  const origin = await siteOrigin();

  if (tokenHash && type && TYPES.includes(type)) {
    const auth = await getAuth();
    const result = await auth.verifyEmailLink({ tokenHash, type });
    if (result.ok) return NextResponse.redirect(new URL(next, origin));
  }

  const url = new URL(SIGN_IN, origin);
  url.searchParams.set('link', 'invalid');
  return NextResponse.redirect(url);
}
