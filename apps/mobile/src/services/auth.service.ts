import { Session, User } from '@supabase/supabase-js';

import { getSupabaseClient, hasSupabaseConfig } from '@/config/supabase';

type AuthResult = { error: string | null; user: User | null };
type SignOutResult = { error: string | null };

const REDIRECT_URL = 'coparent://auth/callback';
const SUPABASE_NOT_CONFIGURED = SUPABASE_NOT_CONFIGURED;

export const AuthService = {
  /**
   * Get the current Supabase session.
   */
  async getCurrentSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data } = await client.auth.getSession();

    return data.session;
  },

  /**
   * Get the current Supabase user.
   */
  async getCurrentSupabaseUser(): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data } = await client.auth.getUser();

    return data.user;
  },

  /**
   * Returns true if the user has an active Supabase session.
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await AuthService.getCurrentSession();

    return session !== null;
  },

  /**
   * Returns true if Supabase credentials are configured.
   */
  isConfigured(): boolean {
    return hasSupabaseConfig();
  },

  /**
   * Listen to auth state changes (sign in, sign out, token refresh).
   * Returns an unsubscribe function.
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void): () => void {
    const client = getSupabaseClient();
    if (!client) return () => {};

    const { data } = client.auth.onAuthStateChange(callback);

    return () => data.subscription.unsubscribe();
  },

  /**
   * Send a magic link to the given email address.
   * User taps the link → deep link → session established.
   */
  async sendMagicLink(email: string): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED };

    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: REDIRECT_URL,
        shouldCreateUser: true,
      },
    });

    return { error: error?.message ?? null };
  },

  /**
   * Password-based sign in (kept for flexibility).
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED, user: null };

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message, user: null };

    return { error: null, user: data.user };
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<SignOutResult> {
    const client = getSupabaseClient();
    if (!client) return { error: null };

    const { error } = await client.auth.signOut();

    return { error: error?.message ?? null };
  },

  /**
   * Password-based sign up (kept for flexibility).
   */
  async signUp(email: string, password: string): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED, user: null };

    const { data, error } = await client.auth.signUp({ email, password });

    if (error) return { error: error.message, user: null };

    return { error: null, user: data.user };
  },

  /**
   * Verify a magic link token from a deep link URL.
   * Called when the app receives a coparent://auth/callback?token_hash=...&type=... URL.
   */
  async verifyOtp(
    tokenHash: string,
    type: 'magiclink' | 'email' = 'magiclink',
  ): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED, user: null };

    const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });

    if (error) return { error: error.message, user: null };

    return { error: null, user: data.user };
  },
};
