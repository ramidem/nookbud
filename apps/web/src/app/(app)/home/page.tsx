import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfiles, getSpaces } from '@/data';
import { acceptMyInvitation } from '../../../auth-actions/spaces';
import { WELCOME, spacePath } from '../../../auth/routes';
import { formatWhen } from '../../../profile/device';
import { Notice } from '../../../ui/Notice';
import { type SearchParams, param } from '../../../ui/page-props';
import { body, button, card, focusRing, heading } from '../../../ui/styles';
import { CreateSpaceForm } from './CreateSpaceForm';

export const metadata: Metadata = { title: 'Home · Nookbud' };

const notes: Record<string, string> = {
  'space-deleted': 'The space was deleted. Nobody can open it any more.',
  left: 'You left the space.',
  'invitation-failed':
    'That invitation could not be accepted. It may have expired or been withdrawn.',
};

const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const [profile, spaces] = await Promise.all([(await getProfiles()).get(), getSpaces()]);
  if (profile && !profile.onboardedAt) redirect(WELCOME);
  const [mine, invitations] = await Promise.all([spaces.list(), spaces.invitationsForMe()]);
  const note = notes[param((await searchParams).note) ?? ''];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className={heading}>
          {profile?.displayName ? `Hello, ${profile.displayName}` : 'Hello'}
        </h1>
        <p className={`${body} mt-2`}>Two homes. One childhood.</p>
      </div>

      {note ? <Notice>{note}</Notice> : null}

      {invitations.length > 0 ? (
        <section aria-labelledby="invitations" className="grid gap-3">
          <h2 className={sectionTitle} id="invitations">
            Invitations for you
          </h2>
          {invitations.map((inv) => (
            <div
              className={`${card} flex flex-wrap items-center justify-between gap-4 bg-tint-sage`}
              key={inv.id}
            >
              <p className="text-base text-foreground">
                You are invited to <strong className="font-semibold">{inv.spaceName}</strong>
                {inv.role === 'owner' ? ' as an owner' : ''}.{' '}
                <span className="text-subtitle">
                  Open until {formatWhen(inv.expiresAt, profile?.timeZone)}.
                </span>
              </p>
              <form action={acceptMyInvitation}>
                <input name="invitation" type="hidden" value={inv.id} />
                <button className={button.primary} type="submit">
                  Join {inv.spaceName}
                </button>
              </form>
            </div>
          ))}
        </section>
      ) : null}

      {mine.length > 0 ? (
        <section aria-labelledby="spaces" className="grid gap-3">
          <h2 className={sectionTitle} id="spaces">
            Your spaces
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {mine.map((space) => (
              <li key={space.id}>
                <Link
                  className={`${card} block transition-colors hover:border-border-strong ${focusRing}`}
                  href={spacePath(space.id)}
                >
                  <span className="block text-[1.125rem] font-semibold text-foreground">
                    {space.name}
                  </span>
                  <span className="mt-1 block text-sm text-subtitle">
                    {space.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="new-space" className={`${card} max-w-[40rem]`}>
        <h2 className={sectionTitle} id="new-space">
          {mine.length ? 'Create another space' : 'Create a space'}
        </h2>
        <p className={`${body} mt-1`}>
          A space is the private place where you and the people you care with keep the record. Only
          the people you invite can see it.
        </p>
        <div className="mt-5">
          <CreateSpaceForm first={mine.length === 0} />
        </div>
      </section>
    </div>
  );
}
