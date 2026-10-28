import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/auth';
import { getProfiles, getSpaces } from '@/data';
import { changeMember, removeChild, revokeInvitation } from '../../../../auth-actions/spaces';
import { HOME, spacePath } from '../../../../auth/routes';
import { formatWhen } from '../../../../profile/device';
import { ActionForm } from '../../../../ui/ActionForm';
import { body, button, card, heading, link } from '../../../../ui/styles';
import {
  AddChildForm,
  DeleteSpaceForm,
  EditChildForm,
  InviteForm,
  LeaveForm,
  RenameForm,
} from './SpaceForms';

export const metadata: Metadata = { title: 'Space · Nookbud' };

const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';
const badge = 'rounded-sm px-2 py-0.5 text-[0.8125rem] font-semibold';

function age(birthDate: string) {
  const born = new Date(`${birthDate}T00:00:00`);
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) years--;
  return years;
}

export default async function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(spacePath(id));
  const spaces = await getSpaces();
  const space = await spaces.get(id);
  if (!space) notFound();

  const owner = space.role === 'owner';
  const [people, children, invitations, profile] = await Promise.all([
    spaces.people(id),
    spaces.children(id),
    owner ? spaces.invitations(id) : Promise.resolve([]),
    (await getProfiles()).get(),
  ]);
  const open = invitations.filter(
    (i) => !i.acceptedAt && !i.revokedAt && new Date(i.expiresAt) > new Date(),
  );
  const tz = profile?.timeZone;

  return (
    <div className="grid max-w-[48rem] gap-6">
      <div>
        <Link className={`${link} text-sm`} href={HOME}>
          All spaces
        </Link>
        <h1 className={`${heading} mt-3`}>{space.name}</h1>
        <p className={`${body} mt-1`}>
          You are {owner ? 'an owner' : 'a member'} of this space. {people.length}{' '}
          {people.length === 1 ? 'person' : 'people'} can see it.
        </p>
      </div>

      <section aria-labelledby="children" className={card}>
        <h2 className={sectionTitle} id="children">
          Children
        </h2>
        {children.length ? (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {children.map((child) => (
              <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={child.id}>
                <span className="text-base text-foreground">
                  <span className="font-medium">{child.name}</span>
                  {child.birthDate ? (
                    <span className="text-subtitle"> · {age(child.birthDate)} years old</span>
                  ) : null}
                </span>
                {owner ? (
                  <div className="flex flex-wrap gap-1">
                    <EditChildForm child={child} space={id} />
                    <form action={removeChild}>
                      <input name="space" type="hidden" value={id} />
                      <input name="child" type="hidden" value={child.id} />
                      <button
                        aria-label={`Remove ${child.name}`}
                        className={`${button.ghost} text-sm`}
                        type="submit"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${body} mt-2`}>
            {owner ? 'Add the child or children this space is for.' : 'No children added yet.'}
          </p>
        )}
        {owner ? (
          <div className="mt-5">
            <p className="mb-3 text-sm text-subtitle">
              Nookbud asks only for a name or nickname and, if you like, a birth date.
            </p>
            <AddChildForm space={id} />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="people" className={card}>
        <h2 className={sectionTitle} id="people">
          People
        </h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {people.map((p) => (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={p.userId}>
              <span className="flex flex-wrap items-center gap-2 text-base text-foreground">
                <span className="font-medium">{p.displayName ?? 'Unnamed member'}</span>
                {p.isMe ? <span className={`${badge} bg-neutral-200`}>You</span> : null}
                <span
                  className={`${badge} ${p.role === 'owner' ? 'bg-tint-sage' : 'bg-neutral-200'}`}
                >
                  {p.role === 'owner' ? 'Owner' : 'Member'}
                </span>
              </span>
              {owner && !p.isMe ? (
                <ActionForm action={changeMember} className="flex flex-wrap gap-1">
                  <input name="space" type="hidden" value={id} />
                  <input name="member" type="hidden" value={p.userId} />
                  <button
                    className={`${button.ghost} text-sm`}
                    name="action"
                    type="submit"
                    value={p.role === 'owner' ? 'make-member' : 'make-owner'}
                  >
                    {p.role === 'owner' ? 'Make member' : 'Make owner'}
                  </button>
                  <button
                    className={`${button.ghost} text-sm`}
                    name="action"
                    type="submit"
                    value="remove"
                  >
                    Remove
                  </button>
                </ActionForm>
              ) : null}
            </li>
          ))}
        </ul>
        {owner ? (
          <div className="mt-6 grid gap-4">
            <h3 className="text-[1.125rem] font-semibold text-foreground">Invite someone</h3>
            <p className={`${body} -mt-2 text-sm`}>
              Nookbud makes a link that only that email can use. Send it however you like: a
              message, an email, in person.
            </p>
            <InviteForm space={id} />
            {open.length ? (
              <div>
                <h3 className="text-base font-semibold text-foreground">Waiting to join</h3>
                <ul className="mt-2 divide-y divide-border border-y border-border">
                  {open.map((inv) => (
                    <li
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                      key={inv.id}
                    >
                      <span className="text-sm text-foreground">
                        {inv.email} · {inv.role === 'owner' ? 'Owner' : 'Member'}
                        <span className="text-subtitle">
                          {' '}
                          · open until {formatWhen(inv.expiresAt, tz)}
                        </span>
                      </span>
                      <form action={revokeInvitation}>
                        <input name="space" type="hidden" value={id} />
                        <input name="invitation" type="hidden" value={inv.id} />
                        <button className={`${button.ghost} text-sm`} type="submit">
                          Withdraw
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {owner ? (
        <section aria-labelledby="space-settings" className={card}>
          <h2 className={sectionTitle} id="space-settings">
            Space settings
          </h2>
          <div className="mt-4 grid gap-6">
            <RenameForm name={space.name} space={id} />
            <DeleteSpaceForm name={space.name} space={id} />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="leave" className={card}>
        <h2 className={sectionTitle} id="leave">
          Leave this space
        </h2>
        <p className={`${body} mt-1`}>
          You stop seeing it at once. What you added stays for the others.
          {owner ? ' If you are the only owner, make someone else an owner first.' : ''}
        </p>
        <div className="mt-4">
          <LeaveForm space={id} />
        </div>
      </section>
    </div>
  );
}
