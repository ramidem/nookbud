'use server';

import { redirect } from 'next/navigation';
import { getAuth } from '@/auth';
import { SIGN_IN } from '../auth/routes';

/** Ends the session on the server, not just on this device (R13). */
export async function signOut() {
  const auth = await getAuth();
  await auth.signOut();
  redirect(`${SIGN_IN}?note=signed-out`);
}

/** Ends every session on every device (R20). */
export async function signOutEverywhere() {
  const auth = await getAuth();
  await auth.signOut({ everywhere: true });
  redirect(`${SIGN_IN}?note=signed-out-everywhere`);
}
