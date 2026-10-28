import type { Metadata } from 'next';
import { body, heading } from '../../../../ui/styles';
import { NewPasswordForm } from './NewPasswordForm';

export const metadata: Metadata = { title: 'Choose a new password · Nookbud' };

export default function NewPasswordPage() {
  return (
    <>
      <h1 className={heading}>Choose a new password</h1>
      <p className={`${body} mt-2`}>
        When you save it, you are signed out on every device. Then you sign in with the new
        password.
      </p>
      <div className="mt-8">
        <NewPasswordForm />
      </div>
    </>
  );
}
