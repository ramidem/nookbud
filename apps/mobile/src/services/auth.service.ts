import { Session, User } from '@supabase/supabase-js';

import { getSupabaseClient, hasSupabaseConfig } from '@/config/supabase';

type AuthResult = { error: string | null; user: User | null };

export const AuthService = {
  async getCurrentSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data } = await client.auth.getSession();

    return data.session;
  },

  async getCurrentSupabaseUser(): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data } = await client.auth.getUser();

    return data.user;
  },

  async isAuthenticated(): Promise<boolean> {
    const session = await AuthService.getCurrentSession();

    return session !== null;
  },

  isConfigured(): boolean {
    return hasSupabaseConfig();
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: 'Supabase is not configured', user: null };
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message, user: null };
    }

    return { error: null, user: data.user };
  },

  async signOut(): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: null };
    }

    const { error } = await client.auth.signOut();

    return { error: error?.message ?? null };
  },

  async signUp(email: string, password: string): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: 'Supabase is not configured', user: null };
    }

    const { data, error } = await client.auth.signUp({ email, password });

    if (error) {
      return { error: error.message, user: null };
    }

    return { error: null, user: data.user };
  },
};
