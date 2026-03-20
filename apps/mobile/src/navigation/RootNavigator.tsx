import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

import { useDbMigrations } from '@/database';
import { useTw } from '@/hooks/useTw';
import { UserService } from '@/services';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <Stack.Navigator
      initialRouteName={hasUser ? 'Main' : 'Onboarding'}
      screenOptions={{
        animation: 'fade',
        headerShown: false,
      }}
    >
      <Stack.Screen component={OnboardingNavigator} name="Onboarding" />
      <Stack.Screen component={MainNavigator} name="Main" />
    </Stack.Navigator>
  );
}
