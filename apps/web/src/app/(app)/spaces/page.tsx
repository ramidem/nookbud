import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProfiles, getSpaces } from '@/data';
import { WELCOME } from '../../../auth/routes';
import { Notice } from '../../../ui/Notice';
import { type SearchParams, param } from '../../../ui/page-props';
import { body, card, heading } from '../../../ui/styles';
import { InvitationCard } from '../InvitationsList';
import { CreateSpaceForm } from './CreateSpaceForm';
import { SpaceCards } from './SpaceCards';

export const metadata: Metadata = { title: 'Spaces · Nookbud' };

const notes: Record<string, string> = {
  'space-deleted': 'The space was deleted. Nobody can open it any more.',
  left: 'You left the space.',
  'invitation-failed':
    'That invitation could not be accepted. It may have expired or been withdrawn.',
};

const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';

export default async function SpacesPage({ searchParams }: { searchParams: SearchParams }) {
  const [profile, spaces] = await Promise.all([(await getProfiles()).get(), getSpaces()]);
  if (profile && !profile.onboardedAt) redirect(WELCOME);
  const [mine, invitations] = await Promise.all([spaces.list(), spaces.invitationsForMe()]);
  const note = notes[param((await searchParams).note) ?? ''];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className={heading}>Your spaces</h1>
        <p className={`${body} mt-2`}>
          A space is the private place where you and the people you care with keep the record.
        </p>
      </div>

      {note ? <Notice>{note}</Notice> : null}

      {invitations.length > 0 ? (
        <section aria-labelledby="invitations" className="grid gap-3">
          <h2 className={sectionTitle} id="invitations">
            Invitations for you
          </h2>
          {invitations.map((invitation) => (
            <InvitationCard
              invitation={invitation}
              key={invitation.id}
              timeZone={profile?.timeZone}
            />
          ))}
        </section>
      ) : null}

      {mine.length > 0 ? (
        <section aria-labelledby="spaces" className="grid gap-3">
          <h2 className={sectionTitle} id="spaces">
            Spaces you belong to
          </h2>
          <SpaceCards spaces={mine} />
        </section>
      ) : null}

      <section aria-labelledby="new-space" className={`${card} max-w-[40rem]`}>
        <h2 className={sectionTitle} id="new-space">
          {mine.length ? 'Create another space' : 'Create a space'}
        </h2>
        <p className={`${body} mt-1`}>Only the people you invite can see it.</p>
        <div className="mt-5">
          <CreateSpaceForm first={mine.length === 0} />
        </div>
      </section>
    </div>
  );
}
