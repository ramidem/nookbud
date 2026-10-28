/** The signed-in person's profile (the `users` table). See docs/database.md. */
export type Profile = {
  id: string;
  displayName: string | null;
  timeZone: string | null;
  currency: string | null;
  termsVersion: string;
  termsAcceptedAt: string;
  onboardedAt: string | null;
  sharesWith: SharesWith | null;
};

/** Who shares responsibility for a child with this person (R27). */
export const SHARES_WITH = [
  'partner',
  'ex_partner',
  'grandparent',
  'guardian',
  'other_family',
  'sole_caregiver',
] as const;
export type SharesWith = (typeof SHARES_WITH)[number];

/** The parts of a profile a person may change. */
export type ProfileChanges = Partial<
  Pick<Profile, 'displayName' | 'timeZone' | 'currency' | 'sharesWith'>
> & {
  onboarded?: boolean;
};

export type DataResult<T = void> = { ok: true; data: T } | { ok: false; message: string };

export interface ProfileStore {
  /** The signed-in person's own profile, or null when signed out. Row-Level Security limits it. */
  get(): Promise<Profile | null>;
  update(changes: ProfileChanges): Promise<DataResult>;
}
