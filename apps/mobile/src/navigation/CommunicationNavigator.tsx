import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CommunicationScreen } from '@/screens/Communication';

export type CommunicationStackParamList = {
  Communication: undefined;
};

const Stack = createNativeStackNavigator<CommunicationStackParamList>();

export function CommunicationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen component={CommunicationScreen} name="Communication" />
    </Stack.Navigator>
  );
}
