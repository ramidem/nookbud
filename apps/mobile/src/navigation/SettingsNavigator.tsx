import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      {/* ChildSettings and AddChildSettings will be added later */}
    </Stack.Navigator>
  );
}
