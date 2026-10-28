import { type NextRequest, NextResponse } from 'next/server';
import { refreshSession } from './auth/proxy';
import { HOME, SIGN_IN, SIGN_IN_CODE, SIGNED_OUT_ONLY, isProtected } from './auth/routes';

/**
 * Keeps sessions fresh and sends signed-out visitors to sign in (R12). This is an optimistic check
 * for navigation only: every page and action checks the user again on the server.
 */
export async function proxy(request: NextRequest) {
  const { response, user, codeNeeded } = await refreshSession(request);
  const { pathname, search } = request.nextUrl;

  // Signed in with the password but the two-step code is still owed: nowhere else until it is given.
  if (user && codeNeeded && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = SIGN_IN_CODE;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withCookies(NextResponse.redirect(url), response);
  }

  if (isProtected(pathname) && !user?.emailVerified) {
    const url = request.nextUrl.clone();
    url.pathname = SIGN_IN;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withCookies(NextResponse.redirect(url), response);
  }

  if (user?.emailVerified && !codeNeeded && SIGNED_OUT_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = HOME;
    url.search = '';
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

/** A redirect must carry the refreshed session cookies, or the person is signed out by accident. */
function withCookies(redirect: NextResponse, from: NextResponse) {
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Everything except static files, images and the documentation, which never need a session.
  matcher: [
    '/((?!_next/static|_next/image|favicon|design/|documentation|.*\\.(?:png|svg|jpg|ico|webmanifest)$).*)',
  ],
};
