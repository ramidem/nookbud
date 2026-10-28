import type { Metadata } from 'next';
import Link from 'next/link';
import { SIGN_UP } from '../../../auth/routes';
import { Notice } from '../../../ui/Notice';
import { type SearchParams, param } from '../../../ui/page-props';
import { body, heading, link } from '../../../ui/styles';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in · Nookbud' };

const notes: Record<string, { title: string; text: string }> = {
  invalid: {
    title: 'That link did not work',
    text: 'It has expired or was already used. Sign in, or ask for a new link.',
  },
  'signed-out': { title: 'Signed out', text: 'You are signed out on this device.' },
  'signed-out-everywhere': {
    title: 'Signed out everywhere',
    text: 'Every session on every device has ended.',
  },
  'password-changed': {
    title: 'Password changed',
    text: 'Sign in with your new password. Your other sessions have ended.',
  },
};

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = param(params.next);
  const note = notes[param(params.link) ?? param(params.note) ?? ''];
  return (
    <>
      <h1 className={heading}>Sign in</h1>
      <p className={`${body} mt-2`}>Welcome back.</p>
      {note ? (
        <div className="mt-6">
          <Notice title={note.title}>{note.text}</Notice>
        </div>
      ) : null}
      <div className="mt-8">
        <SignInForm next={next} />
      </div>
      <p className={`${body} mt-8 text-sm`}>
        New to Nookbud?{' '}
        <Link className={link} href={SIGN_UP}>
          Create an account
        </Link>
      </p>
    </>
  );
}
