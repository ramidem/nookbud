import notifee, { EventType } from '@notifee/react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, Linking } from 'react-native';

import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

import { useDbMigrations } from '@/database';
import { useTw } from '@/hooks/useTw';
import { AcceptInviteScreen } from '@/screens/Onboarding/AcceptInviteScreen';
import { UserService, NotificationService, SpaceService } from '@/services';
import { useLocalStorageStore } from '@/stores';
import { colors } from '@/tailwind';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AcceptInvite: { token?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const INVITE_PREFIX = 'coparent://invite/';
const MIN_TOKEN_LENGTH = 6;

function extractInviteToken(url: string): string | null {
  if (url.startsWith(INVITE_PREFIX)) {
    const token = url.slice(INVITE_PREFIX.length).replace(/[^A-Z0-9]/gi, '');

    return token.length >= MIN_TOKEN_LENGTH ? token.toUpperCase() : null;
  }

  return null;
}

/**
 * Handles notification tap navigation.
 * Navigates to the Timeline tab > EntryDetail when a notification is tapped.
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
 * Handles deep link navigation for invite URLs.
 * Separated into a child component so it has access to the navigation context.
 */
function DeepLinkHandler() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDeepLink = useCallback(
    (event: { url: string }) => {
      const token = extractInviteToken(event.url);
      if (token) {
        navigation.navigate('AcceptInvite', { token });
      }
    },
    [navigation],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        const token = extractInviteToken(url);
        if (token) {
          navigation.navigate('AcceptInvite', { token });
        }
      }
    });

    return () => subscription.remove();
  }, [handleDeepLink, navigation]);

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

export function RootNavigator() {
  const tw = useTw();
  const { error: migrationError, success: migrationSuccess } = useDbMigrations();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (migrationSuccess) {
      checkUser();
    }
  }, [migrationSuccess]);

  const checkUser = async () => {
    try {
      const exists = await UserService.hasUser();
      setHasUser(exists);

      // Request notification permissions once after onboarding completes
      if (exists && !permissionRequested.current && !NotificationService.hasRequestedPermission()) {
        permissionRequested.current = true;
        NotificationService.requestPermissions().catch(() => {});
      }

      // Initialize active Space context
      if (exists) {
        await initializeActiveSpace();
      }
    } catch {
      // Silent fail — user check is non-critical
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while migrations run or checking user
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
      <DeepLinkHandler />
      <NotificationHandler />
      <Stack.Navigator
        initialRouteName={hasUser ? 'Main' : 'Onboarding'}
        screenOptions={{
          animation: 'fade',
          headerShown: false,
        }}
      >
        <Stack.Screen component={OnboardingNavigator} name="Onboarding" />
        <Stack.Screen component={MainNavigator} name="Main" />
        <Stack.Screen
          component={AcceptInviteScreen}
          name="AcceptInvite"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
