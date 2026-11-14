'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireUser } from '@/auth';
import { getSpaces } from '@/data';
import { HOME_SPACE_COOKIE } from '../app/(app)/home/glance';
import { HOME } from '../auth/routes';

/** Remember which space Home should open, then go there. */
export async function selectHomeSpace(form: FormData) {
  await requireUser(HOME);
  const id = String(form.get('space') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect(HOME);
  const space = await (await getSpaces()).get(id);
  if (!space) redirect(HOME);
  const cookieStore = await cookies();
  cookieStore.set(HOME_SPACE_COOKIE, id, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(HOME);
}
