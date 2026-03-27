import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CreateSpaceSettingsScreen, SpaceDetailScreen } from '@/screens/Settings';
import { SpacesScreen } from '@/screens/Spaces';

export type SpacesStackParamList = {
  Spaces: undefined;
  SpaceDetail: { spaceId: string };
  CreateSpace: undefined;
};

const Stack = createNativeStackNavigator<SpacesStackParamList>();

export function SpacesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen component={SpacesScreen} name="Spaces" />
      <Stack.Screen component={SpaceDetailScreen} name="SpaceDetail" />
      <Stack.Screen component={CreateSpaceSettingsScreen} name="CreateSpace" />
    </Stack.Navigator>
  );
}
