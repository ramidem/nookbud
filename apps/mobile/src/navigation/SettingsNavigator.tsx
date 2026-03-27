import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ComponentsShowcaseScreen } from '@/screens/ComponentsShowcase';
import { ExportScreen } from '@/screens/Export';
import { AddResourceScreen, ResourceDetailScreen, ResourcesScreen } from '@/screens/Resources';
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
  Resources: undefined;
  AddResource: undefined;
  ResourceDetail: { resourceId: string };
  ComponentsShowcase: undefined;
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
      <Stack.Screen component={ResourcesScreen} name="Resources" />
      <Stack.Screen component={AddResourceScreen} name="AddResource" />
      <Stack.Screen component={ResourceDetailScreen} name="ResourceDetail" />
      {/* ChildSettings and AddChildSettings will be added later */}
      {__DEV__ && <Stack.Screen component={ComponentsShowcaseScreen} name="ComponentsShowcase" />}
    </Stack.Navigator>
  );
}
