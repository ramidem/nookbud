import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ProfileScreen } from '@/screens/Setup/ProfileScreen';

export type SetupStackParamList = {
  Profile: undefined;
};

const Stack = createNativeStackNavigator<SetupStackParamList>();

/**
 * Post-auth setup flow for first-time users.
 * Single screen: collect name + role, then auto-create space and go to Main.
 */
export function SetupNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen component={ProfileScreen} name="Profile" />
    </Stack.Navigator>
  );
}
