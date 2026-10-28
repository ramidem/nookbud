import { describe, expect, it, vi } from 'vitest';
import { createSupabaseSpaces } from '../src/data/providers/spaces';

function clientWith(rpcResult: { data?: unknown; error?: unknown }) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  const client = {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null, ...rpcResult }),
    from: vi.fn().mockReturnValue(query),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'me' } }, error: null }) },
  };
  return { client: client as never, rpc: client.rpc, query };
}

describe('spaces data', () => {
  it('lists only the signed-in person’s own memberships, so their role is their own', async () => {
    const { client, query } = clientWith({});
    await createSupabaseSpaces(client).list();
    expect(query.eq).toHaveBeenCalledWith('user_id', 'me');
  });

  it('passes on the database’s own words for a refusal it expects', async () => {
    const { client } = clientWith({
      error: {
        code: 'P0001',
        hint: 'last_owner',
        message: 'Make someone else an owner before you leave.',
      },
    });
    expect(await createSupabaseSpaces(client).leave('space')).toEqual({
      ok: false,
      message: 'Make someone else an owner before you leave.',
    });
  });

  it('never repeats an unexpected database message', async () => {
    const { client } = clientWith({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    const result = await createSupabaseSpaces(client).create('Ava');
    expect(result).toEqual({ ok: false, message: 'That did not work. Try again.' });
  });

  it('says plainly when only an owner may do something', async () => {
    const { client } = clientWith({ error: { code: '42501', message: 'permission denied' } });
    expect(await createSupabaseSpaces(client).invite('space', 'a@example.test', 'member')).toEqual({
      ok: false,
      message: 'Only an owner of this space can do that.',
    });
  });

  it('refuses to look up a space id that is not a UUID', async () => {
    const { client, query } = clientWith({});
    expect(await createSupabaseSpaces(client).get('../etc')).toBeNull();
    expect(query.select).not.toHaveBeenCalled();
  });
});
