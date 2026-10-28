import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuth } from '@/auth';
import { signOut } from '../../../../auth-actions/sign-out';
import { HOME, SIGN_IN, safeNext } from '../../../../auth/routes';
import { type SearchParams, param } from '../../../../ui/page-props';
import { body, button, heading } from '../../../../ui/styles';
import { CodeForm } from './CodeForm';

export const metadata: Metadata = { title: 'Two-step sign-in · Nookbud' };

export default async function CodePage({ searchParams }: { searchParams: SearchParams }) {
  const next = param((await searchParams).next);
  const auth = await getAuth();
  if (!(await auth.getUser())) redirect(SIGN_IN);
  if (!(await auth.twoStepStatus()).codeNeeded) redirect(safeNext(next, HOME));

  return (
    <>
      <h1 className={heading}>Enter your code</h1>
      <p className={`${body} mt-2`}>
        Two-step sign-in is on for this account. Open your authenticator app for the code.
      </p>
      <div className="mt-8">
        <CodeForm next={next} />
      </div>
      <form action={signOut} className="mt-8">
        <button className={`${button.ghost} -ml-3 text-sm`} type="submit">
          Cancel and sign out
        </button>
      </form>
    </>
  );
}
