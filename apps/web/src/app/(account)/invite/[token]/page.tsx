import type { Metadata } from 'next';
import Link from 'next/link';
import { getAuth } from '@/auth';
import { getSpaces } from '@/data';
import { INVITE, SIGN_IN, SIGN_UP } from '../../../../auth/routes';
import { Notice } from '../../../../ui/Notice';
import { body, button, heading, link } from '../../../../ui/styles';
import { AcceptForm } from './AcceptForm';

export const metadata: Metadata = { robots: { index: false }, title: 'Invitation · Nookbud' };

const closed = {
  expired: 'This invitation has expired. Ask the person who invited you for a new one.',
  revoked: 'This invitation was withdrawn, or the space no longer exists.',
  used: 'This invitation has already been used.',
};

/** The page an invitation link opens (INV-1, INV-2, INV-7). */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const here = `${INVITE}/${token}`;
  const user = await (await getAuth()).getUser();

  if (!user?.emailVerified) {
    return (
      <>
        <h1 className={heading}>You have been invited to Nookbud</h1>
        <p className={`${body} mt-2`}>
          Someone invited you to a space: a private place to keep a child’s schedule and records
          with the people who care for them. Sign in, or create an account with the email address
          the invitation was sent to.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={button.primary} href={`${SIGN_UP}?next=${encodeURIComponent(here)}`}>
            Create an account
          </Link>
          <Link className={button.secondary} href={`${SIGN_IN}?next=${encodeURIComponent(here)}`}>
            Sign in
          </Link>
        </div>
        <p className={`${body} mt-6 text-sm`}>
          After you confirm your email, the invitation is waiting on your home page.
        </p>
      </>
    );
  }

  const preview = /^[0-9a-f]{64}$/.test(token) ? await (await getSpaces()).preview(token) : null;
  if (!preview || preview.status !== 'open') {
    return (
      <>
        <h1 className={heading}>This invitation cannot be used</h1>
        <div className="mt-6">
          <Notice>
            {preview ? closed[preview.status as keyof typeof closed] : closed.revoked}
          </Notice>
        </div>
      </>
    );
  }

  const mismatch = user.email?.toLowerCase() !== preview.email;
  return (
    <>
      <h1 className={heading}>Join {preview.spaceName}</h1>
      <p className={`${body} mt-2`}>
        You are invited as {preview.role === 'owner' ? 'an owner' : 'a member'}. Everyone in the
        space will see your name.
      </p>
      <div className="mt-8">
        {mismatch ? (
          <Notice title="This invitation is for someone else">
            It was sent to {preview.email}, and you are signed in as {user.email}. Sign in with the
            invited email to join.{' '}
            <Link className={link} href={`${SIGN_IN}?next=${encodeURIComponent(here)}`}>
              Switch account
            </Link>
          </Notice>
        ) : (
          <AcceptForm spaceName={preview.spaceName} token={token} />
        )}
      </div>
    </>
  );
}
