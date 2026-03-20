import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';

import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

import { useDbMigrations } from '@/database';
import { useTw } from '@/hooks/useTw';
import { AcceptInviteScreen } from '@/screens/Onboarding/AcceptInviteScreen';
import { UserService } from '@/services';

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

export function RootNavigator() {
  const tw = useTw();
  const { error: migrationError, success: migrationSuccess } = useDbMigrations();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    if (migrationSuccess) {
      checkUser();
    }
  }, [migrationSuccess]);

  const checkUser = async () => {
    try {
      const exists = await UserService.hasUser();
      setHasUser(exists);
    } catch (err) {
      console.error('Failed to check user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while migrations run or checking user
  if (!migrationSuccess || isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#2563EB" size="large" />
        {migrationError && (
          <View style={tw`mt-4 px-6`}>
            <View style={tw`rounded-xl bg-red-50 p-4`}>
              <View style={tw`text-red-800`}>Migration error: {migrationError.message}</View>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <>
      <DeepLinkHandler />
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
    </>
  );
}
