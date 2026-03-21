import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ResourcesScreen } from '@/screens/Resources';

export type ResourcesStackParamList = {
  Resources: undefined;
  AddResource: undefined;
  ResourceDetail: { resourceId: string };
};

const Stack = createNativeStackNavigator<ResourcesStackParamList>();

export function ResourcesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen component={ResourcesScreen} name="Resources" />
    </Stack.Navigator>
  );
}
