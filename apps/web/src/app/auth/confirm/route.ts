import { type NextRequest, NextResponse } from 'next/server';
import { type EmailLinkType, getAuth } from '@/auth';
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

  if (tokenHash && type && TYPES.includes(type)) {
    const auth = await getAuth();
    const result = await auth.verifyEmailLink({ tokenHash, type });
    if (result.ok) return NextResponse.redirect(new URL(next, request.url));
  }

  const url = new URL(SIGN_IN, request.url);
  url.searchParams.set('link', 'invalid');
  return NextResponse.redirect(url);
}
