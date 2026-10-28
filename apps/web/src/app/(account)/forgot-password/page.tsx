import type { Metadata } from 'next';
import Link from 'next/link';
import { SIGN_IN } from '../../../auth/routes';
import { body, heading, link } from '../../../ui/styles';
import { ForgotForm } from './ForgotForm';

export const metadata: Metadata = { title: 'Reset your password · Nookbud' };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className={heading}>Reset your password</h1>
      <p className={`${body} mt-2`}>
        Enter your email and we will send you a link to choose a new password.
      </p>
      <div className="mt-8">
        <ForgotForm />
      </div>
      <p className={`${body} mt-8 text-sm`}>
        Remembered it?{' '}
        <Link className={link} href={SIGN_IN}>
          Sign in
        </Link>
      </p>
    </>
  );
}
