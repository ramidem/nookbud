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

/** A signed-in device (R20). */
export type Session = {
  id: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
};

export interface SessionStore {
  /** The signed-in person's own sessions, most recently used first. */
  list(): Promise<Session[]>;
}

export type Role = 'owner' | 'member';

export type Space = { id: string; name: string; role: Role; createdAt: string };

export type Person = {
  userId: string;
  displayName: string | null;
  role: Role;
  joinedAt: string;
  isMe: boolean;
};

export type Child = { id: string; name: string; birthDate: string | null };

export type Invitation = {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

/** An invitation waiting for the signed-in person. */
export type InvitationForMe = { id: string; spaceName: string; role: Role; expiresAt: string };

export type InvitationPreview = {
  spaceName: string;
  email: string;
  role: Role;
  status: 'open' | 'used' | 'expired' | 'revoked';
};

export interface SpaceStore {
  /** Every space the signed-in person belongs to (SPC-2). */
  list(): Promise<Space[]>;
  /** One space, or null when it does not exist or the person is not in it. */
  get(id: string): Promise<Space | null>;
  create(name: string): Promise<DataResult<string>>;
  rename(id: string, name: string): Promise<DataResult>;
  remove(id: string): Promise<DataResult>;
  people(id: string): Promise<Person[]>;
  children(id: string): Promise<Child[]>;
  addChild(id: string, child: { name: string; birthDate: string | null }): Promise<DataResult>;
  updateChild(
    childId: string,
    child: { name: string; birthDate: string | null },
  ): Promise<DataResult>;
  removeChild(childId: string): Promise<DataResult>;
  invitations(id: string): Promise<Invitation[]>;
  /** Returns the token for the invitation link. It is never stored, so it cannot be shown again. */
  invite(id: string, email: string, role: Role): Promise<DataResult<string>>;
  revokeInvitation(invitationId: string): Promise<DataResult>;
  preview(token: string): Promise<InvitationPreview | null>;
  accept(token: string): Promise<DataResult<string>>;
  invitationsForMe(): Promise<InvitationForMe[]>;
  acceptForMe(invitationId: string): Promise<DataResult<string>>;
  removeMember(id: string, userId: string): Promise<DataResult>;
  setRole(id: string, userId: string, role: Role): Promise<DataResult>;
  leave(id: string): Promise<DataResult>;
}
