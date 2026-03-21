import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ExportScreen } from '@/screens/Export';
import {
  CreateSpaceSettingsScreen,
  ProfileSettingsScreen,
  SettingsScreen,
  SpaceDetailScreen,
  SpacesSettingsScreen,
} from '@/screens/Settings';

export type SettingsStackParamList = {
  Settings: undefined;
  ProfileSettings: undefined;
  ChildSettings: { childId: string };
  AddChildSettings: undefined;
  SpacesSettings: undefined;
  SpaceDetail: { spaceId: string };
  CreateSpaceSettings: undefined;
  Export: undefined;
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
      <Stack.Screen component={SpacesSettingsScreen} name="SpacesSettings" />
      <Stack.Screen component={SpaceDetailScreen} name="SpaceDetail" />
      <Stack.Screen component={CreateSpaceSettingsScreen} name="CreateSpaceSettings" />
      <Stack.Screen component={ExportScreen} name="Export" />
      {/* ChildSettings and AddChildSettings will be added later */}
    </Stack.Navigator>
  );
}
