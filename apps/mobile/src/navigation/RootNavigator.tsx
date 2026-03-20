import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTw } from '@/hooks/useTw';
import { UserService } from '@/services';
import { useDbMigrations } from '@/database';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const tw = useTw();
  const { success: migrationSuccess, error: migrationError } = useDbMigrations();
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
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
        {migrationError && (
          <View style={tw`mt-4 px-6`}>
            <View style={tw`bg-red-50 rounded-xl p-4`}>
              <View style={tw`text-red-800`}>
                Migration error: {migrationError.message}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName={hasUser ? 'Main' : 'Onboarding'}
    >
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}
