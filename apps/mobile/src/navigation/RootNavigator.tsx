import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import notifee, { EventType } from '@notifee/react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, Linking } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

import { useDbMigrations } from '@/database';
import { useTw } from '@/hooks/useTw';
import { AcceptInviteScreen } from '@/screens/Onboarding/AcceptInviteScreen';
import { AuthService, UserService, NotificationService, SpaceService } from '@/services';
import { useLocalStorageStore } from '@/stores';
import { colors } from '@/tailwind';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
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

function extractAuthParams(url: string): { tokenHash: string; type: string } | null {
  if (!url.startsWith(AUTH_CALLBACK_PREFIX)) return null;

  try {
    // Supabase magic link sends params as hash fragment or query string
    const raw = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
    if (!raw) return null;

    const params = new URLSearchParams(raw);
    const tokenHash = params.get('token_hash');
    const type = params.get('type') ?? 'magiclink';

    if (!tokenHash) return null;

    return { tokenHash, type };
  } catch {
    return null;
  }
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
function DeepLinkHandler({
  onAuthCallback,
}: {
  onAuthCallback: (tokenHash: string, type: string) => Promise<void>;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDeepLink = useCallback(
    async (event: { url: string }) => {
      // Auth callback (magic link)
      const authParams = extractAuthParams(event.url);
      if (authParams) {
        await onAuthCallback(authParams.tokenHash, authParams.type);

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

type AppRoute = 'Auth' | 'Onboarding' | 'Main';

export function RootNavigator() {
  const tw = useTw();
  const { error: migrationError, success: migrationSuccess } = useDbMigrations();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<AppRoute>('Auth');
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (migrationSuccess) {
      bootstrap();
    }
  }, [migrationSuccess]);

  // Listen for Supabase auth state changes (e.g. token refresh, sign out)
  useEffect(
    () =>
      AuthService.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setInitialRoute('Auth');
        } else if (event === 'SIGNED_IN' && session) {
          // Sync user to Supabase public.users if needed
          UserService.syncToSupabase(session.user.id).catch(() => {});
        }
      }),
    [],
  );

  const bootstrap = async () => {
    try {
      const [hasLocalUser, isAuthenticated] = await Promise.all([
        UserService.hasUser(),
        AuthService.isAuthenticated(),
      ]);

      if (!hasLocalUser) {
        // New user — go through onboarding first, then auth
        setInitialRoute('Onboarding');
      } else if (!isAuthenticated) {
        // Has local profile but not signed into Supabase
        setInitialRoute('Auth');
      } else {
        // Fully set up
        setInitialRoute('Main');
      }

      if (hasLocalUser) {
        if (!permissionRequested.current && !NotificationService.hasRequestedPermission()) {
          permissionRequested.current = true;
          NotificationService.requestPermissions().catch(() => {});
        }

        await initializeActiveSpace();
      }
    } catch {
      // Fallback to auth screen on error
      setInitialRoute('Auth');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Called when the magic link deep link fires.
   * Verifies the OTP token, syncs user to Supabase, navigates to Main.
   */
  const handleAuthCallback = useCallback(async (tokenHash: string, type: string) => {
    try {
      const { error, user } = await AuthService.verifyOtp(tokenHash, type as 'magiclink' | 'email');

      if (error || !user) return;

      // Sync local profile to Supabase public.users
      await UserService.syncToSupabase(user.id).catch(() => {});

      await initializeActiveSpace();
      setInitialRoute('Main');
    } catch {
      // Silent — user stays on current screen
    }
  }, []);

  if (!migrationSuccess || isLoading) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <ActivityIndicator color={colors.primary} size="large" />
        {migrationError && (
          <View style={tw`mt-4 px-6`}>
            <View style={tw`bg-error/15 rounded-xl p-4`}>
              <Text style={tw`text-error`}>Migration error: {migrationError.message}</Text>
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
          <Stack.Screen component={OnboardingNavigator} name="Onboarding" />
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
