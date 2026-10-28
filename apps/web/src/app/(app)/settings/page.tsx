import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/auth';
import { getProfiles } from '@/data';
import { SETTINGS } from '../../../auth/routes';
import { PRIVACY_HREF, TERMS_HREF } from '../../../legal/policies';
import { formatWhen } from '../../../profile/device';
import { CURRENCIES, timeZones } from '../../../profile/options';
import { body, card, link } from '../../../ui/styles';
import { DeleteAccount } from './DeleteAccount';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = { title: 'Settings · Nookbud' };

const sectionTitle = 'text-[1.375rem] font-semibold leading-[1.3] text-foreground';

export default async function SettingsPage() {
  const user = await requireUser(SETTINGS);
  const profile = await (await getProfiles()).get();
  if (!profile) return null;

  return (
    <>
      <section className={card} aria-labelledby="profile">
        <h2 className={sectionTitle} id="profile">
          Profile
        </h2>
        <p className={`${body} mt-1`}>Signed in as {user.email}.</p>
        <div className="mt-6">
          <ProfileForm currencies={CURRENCIES} profile={profile} timeZones={timeZones()} />
        </div>
      </section>

      <section className={card} aria-labelledby="agreements">
        <h2 className={sectionTitle} id="agreements">
          Terms and privacy
        </h2>
        <p className={`${body} mt-2`}>
          You accepted version {profile.termsVersion} of the{' '}
          <Link className={link} href={TERMS_HREF}>
            terms of service
          </Link>{' '}
          and the{' '}
          <Link className={link} href={PRIVACY_HREF}>
            privacy policy
          </Link>{' '}
          on {formatWhen(profile.termsAcceptedAt, profile.timeZone)}.
        </p>
      </section>

      <section className={card} aria-labelledby="delete">
        <h2 className={sectionTitle} id="delete">
          Delete account
        </h2>
        <div className="mt-4">
          <DeleteAccount />
        </div>
      </section>
    </>
  );
}
