import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { SettingsScreen, ProfileSettingsScreen } from '@/screens/Settings';

export type SettingsStackParamList = {
  Settings: undefined;
  ProfileSettings: undefined;
  ChildSettings: { childId: string };
  AddChildSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen component={SettingsScreen} name="Settings" />
      <Stack.Screen component={ProfileSettingsScreen} name="ProfileSettings" />
      {/* ChildSettings and AddChildSettings will be added later */}
    </Stack.Navigator>
  );
}
