import type { Metadata } from 'next';
import Link from 'next/link';
import { SIGN_IN } from '../../../auth/routes';
import { type SearchParams, param } from '../../../ui/page-props';
import { body, heading, link } from '../../../ui/styles';
import { ResendForm } from './ResendForm';

export const metadata: Metadata = { title: 'Check your email · Nookbud' };

export default async function CheckEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const email = param((await searchParams).email) ?? '';
  return (
    <>
      <h1 className={heading}>Check your email</h1>
      <p className={`${body} mt-2`}>
        We sent a link to{' '}
        {email ? (
          <strong className="font-medium text-foreground">{email}</strong>
        ) : (
          'your email address'
        )}
        . Open it to confirm your address and finish setting up. The link works once and expires in
        an hour.
      </p>
      <p className={`${body} mt-4`}>Nothing there? Check your spam folder, or send it again.</p>
      {email ? (
        <div className="mt-8">
          <ResendForm email={email} />
        </div>
      ) : null}
      <p className={`${body} mt-8 text-sm`}>
        Already confirmed?{' '}
        <Link className={link} href={SIGN_IN}>
          Sign in
        </Link>
      </p>
    </>
  );
}
