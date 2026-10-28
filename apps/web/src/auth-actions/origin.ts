import 'server-only';
import { headers } from 'next/headers';

/**
 * This site's own address for the current request, for links in emails (R5). Supabase only sends
 * people to addresses on its allow-list, so a forged Host header cannot redirect a link elsewhere.
 */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}
