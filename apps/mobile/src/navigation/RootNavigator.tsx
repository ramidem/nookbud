import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import notifee, { EventType } from '@notifee/react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Linking } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SetupNavigator } from './SetupNavigator';

import { useDbMigrations } from '@/database';
import { useTw } from '@/hooks/useTw';
import { AcceptInviteScreen } from '@/screens/Onboarding/AcceptInviteScreen';
import {
  AuthService,
  LogService,
  NotificationService,
  SpaceService,
  UserService,
} from '@/services';
import { useLocalStorageStore } from '@/stores';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export type RootStackParamList = {
  Auth: undefined;
  Setup: undefined;
  Main: undefined;
  AcceptInvite: { token?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const INVITE_PREFIX = 'coparent://invite/';
const AUTH_CALLBACK_PREFIX = 'coparent://auth/callback';
const MIN_TOKEN_LENGTH = 6;

function extractInviteToken(url: string): string | null {
  if (url.startsWith(INVITE_PREFIX)) {
    const token = url.slice(INVITE_PREFIX.length).replace(/[^A-Z0-9]/gi, '');

    return token.length >= MIN_TOKEN_LENGTH ? token.toUpperCase() : null;
  }

  return null;
}

function isAuthCallback(url: string): boolean {
  return url.startsWith(AUTH_CALLBACK_PREFIX);
}

/**
 * Handles notification tap navigation.
 */
function NotificationHandler() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(
    () =>
      notifee.onForegroundEvent(({ detail, type }) => {
        if (type === EventType.PRESS) {
          const entryId = detail.notification?.data?.entryId as string | undefined;
          if (entryId) {
            navigation.navigate('Main');
          }
        }
      }),
    [navigation],
  );

  return null;
}

/**
 * Handles deep links for invite URLs and auth callbacks.
 */
function DeepLinkHandler({ onAuthCallback }: { onAuthCallback: (url: string) => Promise<void> }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDeepLink = useCallback(
    async (event: { url: string }) => {
      // Auth callback (OAuth — contains access_token in fragment)
      if (isAuthCallback(event.url)) {
        await onAuthCallback(event.url);

        return;
      }

      // Invite deep link
      const token = extractInviteToken(event.url);
      if (token) {
        navigation.navigate('AcceptInvite', { token });
      }
    },
    [navigation, onAuthCallback],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  return null;
}

async function initializeActiveSpace() {
  const userSpaces = await SpaceService.listSpaces();
  const storedId = useLocalStorageStore.getState().activeSpaceId;

  if (storedId) {
    const stillValid = userSpaces.some((s) => s.id === storedId);
    if (!stillValid) {
      SpaceService.setCurrentSpace(userSpaces.length > 0 ? userSpaces[0].id : null);
    }
  } else if (userSpaces.length > 0) {
    SpaceService.setCurrentSpace(userSpaces[0].id);
  }
}

type AppRoute = 'Auth' | 'Setup' | 'Main';

export function RootNavigator() {
  const tw = useTw();
  const { error: migrationError, success: migrationSuccess } = useDbMigrations();
  const [isLoading, setIsLoading] = useState(true);
  const SPLASH_MIN_MS = 1500;
  const splashShownAt = useRef(Date.now());
  const [initialRoute, setInitialRoute] = useState<AppRoute>('Auth');
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (migrationSuccess) {
      LogService.startAutoFlush();
      bootstrap();
    }
  }, [migrationSuccess]);

  // Listen for Supabase auth state changes (e.g. token refresh, sign out)
  useEffect(
    () =>
      AuthService.onAuthStateChange((event, session) => {
        LogService.info('auth', 'Auth state change', { event });
        if (event === 'SIGNED_IN' && session) {
          LogService.setUserId(session.user.id);
        }
        if (event === 'SIGNED_OUT') {
          LogService.setUserId(null);
          setInitialRoute('Auth');
        } else if (event === 'SIGNED_IN' && session) {
          // Pin auth UID so all downstream calls work regardless of MMKV state.
          UserService.setCurrentUserId(session.user.id);

          // Only sync if a local user already exists (i.e. returning user, not fresh sign-up).
          // Fresh sign-up goes to Setup first where upsertUser + syncToSupabase runs.
          UserService.hasUser()
            .then((hasUser) => {
              if (hasUser) {
                UserService.syncToSupabase(session.user.id).catch(() => {});
              }
            })
            .catch(() => {});

          // Route to Setup if no spaces yet, otherwise Main.
          // Fresh sign-up: SignUpScreen navigates directly to Setup (doesn't wait for this).
          SpaceService.listSpaces()
            .then((spaces) => {
              const target = spaces.length === 0 ? 'Setup' : 'Main';
              if (navigationRef.isReady()) {
                navigationRef.reset({ index: 0, routes: [{ name: target }] });
              } else {
                setInitialRoute(target);
              }
            })
            .catch(() => {
              if (navigationRef.isReady()) {
                navigationRef.reset({ index: 0, routes: [{ name: 'Setup' }] });
              } else {
                setInitialRoute('Setup');
              }
            });
        }
      }),
    [],
  );

  const bootstrap = async () => {
    LogService.info('boot', 'App bootstrap started');
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      LogService.debug('boot', 'Auth check', { isAuthenticated });

      if (!isAuthenticated) {
        LogService.info('boot', 'Not authenticated → Auth');
        setInitialRoute('Auth');
      } else {
        // Pin auth UID in MMKV so all downstream service calls can find the user.
        const authUser = await UserService.getCurrentAuthUser();
        if (authUser?.id) {
          UserService.setCurrentUserId(authUser.id);
        }

        // Authenticated — check if setup is complete
        const spaces = await SpaceService.listSpaces();
        LogService.info('boot', 'Spaces check', { count: spaces.length });
        if (spaces.length === 0) {
          setInitialRoute('Setup');
        } else {
          setInitialRoute('Main');
          await initializeActiveSpace();
        }

        if (!permissionRequested.current && !NotificationService.hasRequestedPermission()) {
          permissionRequested.current = true;
          NotificationService.requestPermissions().catch(() => {});
        }
      }
    } catch (e) {
      LogService.error('boot', 'Bootstrap failed', { error: String(e) });
      setInitialRoute('Auth');
    } finally {
      const elapsed = Date.now() - splashShownAt.current;
      const remaining = Math.max(0, SPLASH_MIN_MS - elapsed);
      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    }
  };

  /**
   * Called when the OAuth deep link fires (coparent://auth/callback#access_token=...).
   * Exchanges the URL fragment for a session, syncs user, navigates to Setup/Main.
   */
  const handleAuthCallback = useCallback(async (url: string) => {
    try {
      const { error, user } = await AuthService.getSessionFromUrl(url);

      if (error || !user) return;

      // For Google OAuth — auto-create local profile from Google metadata
      // so we can skip the Profile setup screen entirely
      const hasLocal = await UserService.hasUser();
      if (!hasLocal) {
        const meta = user.user_metadata ?? {};
        await UserService.createFromGoogle({
          email: user.email ?? '',
          fullName: meta.full_name ?? meta.name ?? '',
          supabaseId: user.id,
        });
      } else {
        await UserService.syncToSupabase(user.id).catch(() => {});
      }

      // Auto-create space if none exists, then go straight to Main
      const spaces = await SpaceService.listSpaces();
      if (spaces.length === 0) {
        await SpaceService.createSpace('My Space');
      } else {
        await initializeActiveSpace();
      }

      const navReady = navigationRef.isReady();
      LogService.info('nav', 'Auth callback nav', { navReady, target: 'Main' });
      if (navReady) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        setInitialRoute('Main');
      }
    } catch (e) {
      LogService.error('nav', 'Auth callback failed', { error: String(e) });
    }
  }, []);

  if (!migrationSuccess || isLoading) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <Text style={tw`text-foreground font-serif-bold text-5xl italic tracking-tight`}>
          CoParent
        </Text>
        <Text style={tw`text-subtitle mt-2 text-sm`}>For everyone raising a child together.</Text>
        {migrationError && (
          <View style={tw`mt-8 px-6`}>
            <View style={tw`bg-error/15 rounded-xl p-4`}>
              <Text style={tw`text-error text-sm`}>Migration error: {migrationError.message}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <BottomSheetModalProvider>
        <DeepLinkHandler onAuthCallback={handleAuthCallback} />
        <NotificationHandler />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            animation: 'fade',
            headerShown: false,
          }}
        >
          <Stack.Screen component={AuthNavigator} name="Auth" />
          <Stack.Screen component={SetupNavigator} name="Setup" />
          <Stack.Screen component={MainNavigator} name="Main" />
          <Stack.Screen
            component={AcceptInviteScreen}
            name="AcceptInvite"
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}
