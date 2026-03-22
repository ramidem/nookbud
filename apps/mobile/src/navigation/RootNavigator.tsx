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
import { SetupNavigator } from './SetupNavigator';

import { useDbMigrations } from '@/database';
import { useTw } from '@/hooks/useTw';
import { AcceptInviteScreen } from '@/screens/Onboarding/AcceptInviteScreen';
import { AuthService, NotificationService, SpaceService, UserService } from '@/services';
import { useLocalStorageStore } from '@/stores';
import { colors } from '@/tailwind';

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

          // Route to Setup if no spaces yet, otherwise Main
          SpaceService.listSpaces()
            .then((spaces) => {
              setInitialRoute(spaces.length === 0 ? 'Setup' : 'Main');
            })
            .catch(() => setInitialRoute('Setup'));
        }
      }),
    [],
  );

  const bootstrap = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();

      if (!isAuthenticated) {
        setInitialRoute('Auth');
      } else {
        // Authenticated — check if setup is complete
        const spaces = await SpaceService.listSpaces();
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
    } catch {
      // Fallback to auth screen on error
      setInitialRoute('Auth');
    } finally {
      setIsLoading(false);
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

      // Sync local profile to Supabase public.users
      await UserService.syncToSupabase(user.id).catch(() => {});

      // Check if they need to create their first Space
      const spaces = await SpaceService.listSpaces();
      if (spaces.length === 0) {
        setInitialRoute('Setup');
      } else {
        await initializeActiveSpace();
        setInitialRoute('Main');
      }
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
