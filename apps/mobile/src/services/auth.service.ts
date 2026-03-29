import { Linking } from 'react-native';

// TODO: Firebase Auth — import Firebase Auth when Phase 1 is complete

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthResult = { error: string | null; user: any | null };
type SignOutResult = { error: string | null };

const REDIRECT_URL = 'coparent://auth/callback';
const NOT_IMPLEMENTED = 'Firebase Auth not yet implemented';

export const AuthService = {
  /**
   * Get the current session.
   */
  async getCurrentSession(): Promise<null> {
    // TODO: Firebase Auth — implement with Firebase Auth
    return null;
  },

  /**
   * Get the current authenticated user.
   */
  async getCurrentSupabaseUser(): Promise<null> {
    // TODO: Firebase Auth — implement with Firebase Auth
    return null;
  },

  /**
   * Exchange the URL fragment from an OAuth callback for a session.
   * Called when the app receives coparent://auth/callback#access_token=...
   */
  async getSessionFromUrl(_url: string): Promise<AuthResult> {
    // TODO: Firebase Auth — implement Google Sign-In with Firebase
    return { error: NOT_IMPLEMENTED, user: null };
  },

  /**
   * Returns true if the user has an active auth session.
   */
  async isAuthenticated(): Promise<boolean> {
    // TODO: Firebase Auth — implement with Firebase Auth
    return false;
  },

  /**
   * Returns true if auth credentials are configured.
   */
  isConfigured(): boolean {
    // TODO: Firebase Auth — check Firebase app initialization
    return false;
  },

  /**
   * Listen to auth state changes (sign in, sign out, token refresh).
   * Returns an unsubscribe function.
   * TODO: Firebase Auth — replace session type with Firebase User
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthStateChange(_callback: (event: string, session: any) => void): () => void {
    // TODO: Firebase Auth — implement with Firebase Auth onAuthStateChanged
    return () => {};
  },

  /**
   * Resend OTP verification code to email.
   */
  async resendOtp(_email: string): Promise<{ error: string | null }> {
    // TODO: Firebase Auth — implement email OTP with Firebase
    return { error: NOT_IMPLEMENTED };
  },

  /**
   * Password-based sign in.
   */
  async signIn(_email: string, _password: string): Promise<AuthResult> {
    // TODO: Firebase Auth — implement with signInWithEmailAndPassword
    return { error: NOT_IMPLEMENTED, user: null };
  },

  /**
   * Sign in with Google via OAuth.
   * Opens the system browser → Google consent → coparent://auth/callback
   */
  async signInWithGoogle(): Promise<{ error: string | null }> {
    // TODO: Firebase Auth — implement with Google Sign-In provider
    void Linking;
    void REDIRECT_URL;

    return { error: NOT_IMPLEMENTED };
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<SignOutResult> {
    // TODO: Firebase Auth — implement with Firebase Auth signOut
    return { error: null };
  },

  /**
   * Password-based sign up.
   * With email confirmation enabled, sends a 6-digit OTP to the email.
   */
  async signUp(_email: string, _password: string): Promise<{ error: string | null }> {
    // TODO: Firebase Auth — implement with createUserWithEmailAndPassword
    return { error: NOT_IMPLEMENTED };
  },

  /**
   * Verify a 6-digit OTP sent to email after sign-up.
   */
  async verifyOtp(_email: string, _token: string): Promise<AuthResult> {
    // TODO: Firebase Auth — implement email OTP verification
    return { error: NOT_IMPLEMENTED, user: null };
  },
};
