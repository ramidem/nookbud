import type { Metadata } from 'next';
import Link from 'next/link';
import { SIGN_IN } from '../../../auth/routes';
import { body, heading, link } from '../../../ui/styles';
import { SignUpForm } from './SignUpForm';

export const metadata: Metadata = { title: 'Create an account · Nookbud' };

export default function SignUpPage() {
  return (
    <>
      <h1 className={heading}>Create your account</h1>
      <p className={`${body} mt-2`}>Two homes. One childhood. Start with your email.</p>
      <div className="mt-8">
        <SignUpForm />
      </div>
      <p className={`${body} mt-8 text-sm`}>
        Already have an account?{' '}
        <Link className={link} href={SIGN_IN}>
          Sign in
        </Link>
      </p>
    </>
  );
}
