import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfiles } from '@/data';
import { SETTINGS, WELCOME } from '../../../auth/routes';
import { body, card, heading, link } from '../../../ui/styles';

export const metadata: Metadata = { title: 'Home · Nookbud' };

export default async function HomePage() {
  const profile = await (await getProfiles()).get();
  if (profile && !profile.onboardedAt) redirect(WELCOME);

  return (
    <>
      <h1 className={heading}>
        {profile?.displayName ? `Hello, ${profile.displayName}` : 'Hello'}
      </h1>
      <p className={`${body} mt-2`}>Two homes. One childhood.</p>
      <section className={`${card} mt-8 max-w-[40rem]`}>
        <h2 className="text-[1.375rem] font-semibold leading-[1.3] text-foreground">
          Spaces are coming next
        </h2>
        <p className={`${body} mt-2`}>
          Your account is ready. Shared spaces, where you keep the schedule and records with the
          people you invite, are being built now.
        </p>
        <p className={`${body} mt-4`}>
          Meanwhile, check your{' '}
          <Link className={link} href={SETTINGS}>
            settings
          </Link>
          : your time zone, currency and two-step sign-in.
        </p>
      </section>
    </>
  );
}
