import 'server-only';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { getServerEnv } from '../../env/server';
import type { AuditEvent, SupabaseAuthDeps } from './supabase';

type RpcClient = Pick<SupabaseClient, 'rpc'>;

/**
 * The privileged half of auth. The service role key never leaves the server, and these calls
 * always name the user they act on: it comes from the person's own verified session.
 */
export function createSupabaseAuthDeps(userClient: RpcClient): SupabaseAuthDeps {
  const env = getServerEnv();
  const options = { auth: { autoRefreshToken: false, persistSession: false } };
  const admin = () =>
    createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options);

  return {
    // A throwaway client, so checking the password never replaces the session in the cookies.
    async checkPassword(email, password) {
      const probe = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        options,
      );
      const { error } = await probe.auth.signInWithPassword({ email, password });
      if (error) return false;
      await probe.auth.signOut({ scope: 'local' });
      return true;
    },

    recoveryCodes: {
      async replace(userId, hashes) {
        const db = admin();
        const removed = await db.from('mfa_recovery_codes').delete().eq('user_id', userId);
        if (removed.error) return false;
        if (hashes.length === 0) return true;
        const added = await db
          .from('mfa_recovery_codes')
          .insert(hashes.map((code_hash) => ({ user_id: userId, code_hash })));
        return !added.error;
      },

      async consume(userId, hash) {
        const { data, error } = await admin()
          .from('mfa_recovery_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('code_hash', hash)
          .is('used_at', null)
          .select('id');
        return !error && (data?.length ?? 0) > 0;
      },

      async removeFactors(userId) {
        const db = admin();
        const { data, error } = await db.auth.admin.mfa.listFactors({ userId });
        if (error) return false;
        for (const factor of data.factors) {
          await db.auth.admin.mfa.deleteFactor({ userId, id: factor.id });
        }
        await db.from('mfa_recovery_codes').delete().eq('user_id', userId);
        return true;
      },
    },

    async record(event: AuditEvent) {
      await userClient.rpc('record_audit_event', { event });
    },

    async prepareDeletion() {
      const { data, error } = await userClient.rpc('prepare_account_deletion');
      return error || typeof data !== 'string' ? null : data;
    },

    async deleteUser(userId) {
      const { error } = await admin().auth.admin.deleteUser(userId);
      return !error;
    },
  };
}
