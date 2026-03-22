import { Session, User } from '@supabase/supabase-js';
import { Linking } from 'react-native';

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
   * Exchange the URL fragment from an OAuth callback for a session.
   * Called when the app receives coparent://auth/callback#access_token=...
   */
  async getSessionFromUrl(url: string): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED, user: null };

    // Extract fragment params (OAuth uses hash, not query string)
    const fragment = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      return { error: 'Invalid callback URL', user: null };
    }

    const { data, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) return { error: error.message, user: null };

    return { error: null, user: data.user };
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
   * Sign in with Google via Supabase OAuth.
   * Opens the system browser → Google consent → Supabase → coparent://auth/callback
   * The deep link handler in RootNavigator picks up the session from the URL fragment.
   */
  async signInWithGoogle(): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED };

    const { data, error } = await client.auth.signInWithOAuth({
      options: { redirectTo: REDIRECT_URL, skipBrowserRedirect: true },
      provider: 'google',
    });

    if (error) return { error: error.message };
    if (!data.url) return { error: 'No OAuth URL returned' };

    await Linking.openURL(data.url);

    return { error: null };
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
   * Returns `needsEmailConfirmation: true` when Supabase requires the user
   * to click a verification link before a session is issued.
   */
  async signUp(
    email: string,
    password: string,
  ): Promise<AuthResult & { needsEmailConfirmation?: boolean }> {
    const client = getSupabaseClient();
    if (!client) return { error: SUPABASE_NOT_CONFIGURED, user: null };

    const { data, error } = await client.auth.signUp({ email, password });

    if (error) return { error: error.message, user: null };

    // When email confirmation is required, Supabase returns a user but no session.
    const needsEmailConfirmation = !!data.user && !data.session;

    return { error: null, needsEmailConfirmation, user: data.user };
  },
};
