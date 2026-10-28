import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type {
  Child,
  DataResult,
  Invitation,
  InvitationForMe,
  InvitationPreview,
  Person,
  Role,
  Space,
  SpaceStore,
} from '../types';

/**
 * The database's own messages for refusals we expect (raised with a `hint`) are written for
 * people already. Anything else gets a neutral sentence, never the database's wording.
 */
const KNOWN_HINTS = new Set([
  'limit',
  'already_member',
  'invalid',
  'used',
  'expired',
  'wrong_email',
  'self',
  'last_owner',
  'not_author',
  'removed',
]);

export function failure(error: PostgrestError | null): DataResult<never> {
  if (error && error.code === 'P0001' && KNOWN_HINTS.has(error.hint ?? '')) {
    return { ok: false, message: error.message };
  }
  if (error?.code === '42501')
    return { ok: false, message: 'Only an owner of this space can do that.' };
  return { ok: false, message: 'That did not work. Try again.' };
}

const done = <T>(data: T): DataResult<T> => ({ ok: true, data });

type Db = Pick<SupabaseClient, 'from' | 'rpc' | 'auth'>;

export function createSupabaseSpaces(client: Db): SpaceStore {
  const call = async <T = void>(
    fn: string,
    args: Record<string, unknown>,
  ): Promise<DataResult<T>> => {
    const { data, error } = await client.rpc(fn, args);
    return error ? failure(error) : done(data as T);
  };

  return {
    async list() {
      // Members can see everyone's memberships in their spaces, so ask for this person's own.
      const { data: auth } = await client.auth.getUser();
      if (!auth.user) return [];
      const { data } = await client
        .from('space_members')
        .select('role, spaces!inner(id, name, created_at)')
        .eq('user_id', auth.user.id)
        .order('created_at', { referencedTable: 'spaces' });
      return (
        (data ?? []) as unknown as {
          role: Role;
          spaces: { id: string; name: string; created_at: string };
        }[]
      ).map((row): Space => ({
        id: row.spaces.id,
        name: row.spaces.name,
        role: row.role,
        createdAt: row.spaces.created_at,
      }));
    },

    async get(id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      return (await this.list()).find((s) => s.id === id) ?? null;
    },

    create: (name) => call<string>('create_space', { space_name: name }),
    rename: (id, name) => call('rename_space', { space: id, space_name: name }),
    remove: (id) => call('delete_space', { space: id }),

    async people(id) {
      const { data } = await client.rpc('space_people', { space: id });
      return (
        (data ?? []) as {
          user_id: string;
          display_name: string | null;
          role: Role;
          joined_at: string;
          is_me: boolean;
        }[]
      ).map((r): Person => ({
        userId: r.user_id,
        displayName: r.display_name,
        role: r.role,
        joinedAt: r.joined_at,
        isMe: r.is_me,
      }));
    },

    async children(id) {
      const { data } = await client
        .from('children')
        .select('id, name, birth_date')
        .eq('space_id', id)
        .order('created_at');
      return ((data ?? []) as { id: string; name: string; birth_date: string | null }[]).map(
        (r): Child => ({ id: r.id, name: r.name, birthDate: r.birth_date }),
      );
    },

    addChild: (id, child) =>
      call('add_child', { space: id, child_name: child.name, child_birth_date: child.birthDate }),
    updateChild: (childId, child) =>
      call('update_child', {
        child: childId,
        child_name: child.name,
        child_birth_date: child.birthDate,
      }),
    removeChild: (childId) => call('remove_child', { child: childId }),

    async invitations(id) {
      const { data } = await client
        .from('invitations')
        .select('id, email, role, expires_at, accepted_at, revoked_at, created_at')
        .eq('space_id', id)
        .order('created_at', { ascending: false });
      return ((data ?? []) as Record<string, string | null>[]).map((r): Invitation => ({
        id: r.id as string,
        email: r.email as string,
        role: r.role as Role,
        expiresAt: r.expires_at as string,
        acceptedAt: r.accepted_at,
        revokedAt: r.revoked_at,
        createdAt: r.created_at as string,
      }));
    },

    invite: (id, email, role) =>
      call<string>('create_invitation', { space: id, invitee_email: email, invitee_role: role }),
    revokeInvitation: (invitationId) => call('revoke_invitation', { invitation: invitationId }),

    async preview(token) {
      const { data } = await client.rpc('invitation_preview', { token });
      const row = (
        data as
          | { space_name: string; email: string; role: Role; status: InvitationPreview['status'] }[]
          | null
      )?.[0];
      return row
        ? { spaceName: row.space_name, email: row.email, role: row.role, status: row.status }
        : null;
    },

    accept: (token) => call<string>('accept_invitation', { token }),

    async invitationsForMe() {
      const { data } = await client.rpc('my_invitations');
      return (
        (data ?? []) as { id: string; space_name: string; role: Role; expires_at: string }[]
      ).map((r): InvitationForMe => ({
        id: r.id,
        spaceName: r.space_name,
        role: r.role,
        expiresAt: r.expires_at,
      }));
    },

    acceptForMe: (invitationId) =>
      call<string>('accept_my_invitation', { invitation: invitationId }),
    removeMember: (id, userId) => call('remove_member', { space: id, member: userId }),
    setRole: (id, userId, role) =>
      call('set_member_role', { space: id, member: userId, new_role: role }),
    leave: (id) => call('leave_space', { space: id }),
  };
}
