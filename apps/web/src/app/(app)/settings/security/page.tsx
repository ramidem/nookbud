import type { Metadata } from 'next';
import { getAuth, requireUser } from '@/auth';
import { getProfiles, getSessions } from '@/data';
import { signOutEverywhere } from '../../../../auth-actions/sign-out';
import { SECURITY } from '../../../../auth/routes';
import { describeDevice, formatWhen } from '../../../../profile/device';
import { Notice } from '../../../../ui/Notice';
import { type SearchParams, param } from '../../../../ui/page-props';
import { body, button, card } from '../../../../ui/styles';
import { PasswordForm } from './PasswordForm';
import { TwoStep } from './TwoStep';

export const metadata: Metadata = { title: 'Security · Settings · Nookbud' };

const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';

export default async function SecurityPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser(SECURITY);
  const note = param((await searchParams).note);
  const [status, sessions, profile] = await Promise.all([
    (await getAuth()).twoStepStatus(),
    (await getSessions()).list(),
    (await getProfiles()).get(),
  ]);

  return (
    <>
      {note === 'recovery-used' ? (
        <Notice title="You used a recovery code">
          Two-step sign-in is now off. Set it up again below with your new phone.
        </Notice>
      ) : null}

      <section aria-labelledby="password" className={card}>
        <h2 className={sectionTitle} id="password">
          Password
        </h2>
        <p className={`${body} mt-1`}>Changing it signs you out on every other device.</p>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </section>

      <section aria-labelledby="two-step" className={card}>
        <h2 className={sectionTitle} id="two-step">
          Two-step sign-in
        </h2>
        <div className="mt-3">
          <TwoStep enabled={status.enabled} />
        </div>
      </section>

      <section aria-labelledby="devices" className={card}>
        <h2 className={sectionTitle} id="devices">
          Where you’re signed in
        </h2>
        <p className={`${body} mt-1`}>
          If you see a device you don’t recognise, sign out everywhere and change your password.
        </p>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {sessions.map((s) => (
            <li
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
              key={s.id}
            >
              <span className="font-medium text-foreground">
                {describeDevice(s.userAgent)}
                {s.current ? (
                  <span className="ml-2 rounded-sm bg-tint-sage px-2 py-0.5 text-[0.8125rem] font-semibold">
                    This device
                  </span>
                ) : null}
              </span>
              <span className="text-sm text-subtitle">
                Last used {formatWhen(s.lastUsedAt, profile?.timeZone)} · signed in{' '}
                {formatWhen(s.createdAt, profile?.timeZone)}
              </span>
            </li>
          ))}
        </ul>
        <form action={signOutEverywhere} className="mt-5">
          <button className={button.secondary} type="submit">
            Sign out everywhere
          </button>
        </form>
      </section>
    </>
  );
}
