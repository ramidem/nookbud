import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AddChildScreen } from '@/screens/Onboarding/AddChildScreen';
import { CreateSpaceScreen } from '@/screens/Onboarding/CreateSpaceScreen';
import { InvitePartnerScreen } from '@/screens/Onboarding/InvitePartnerScreen';

export type SetupStackParamList = {
  CreateSpace: undefined;
  AddChild: { spaceId: string };
  InviteMembers: { spaceId: string };
};

const Stack = createNativeStackNavigator<SetupStackParamList>();

/**
 * Post-auth setup flow for first-time users.
 * Runs after sign-in when the user has no Spaces yet.
 */
export function SetupNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen component={CreateSpaceScreen} name="CreateSpace" />
      <Stack.Screen component={AddChildScreen} name="AddChild" />
      <Stack.Screen component={InvitePartnerScreen} name="InviteMembers" />
    </Stack.Navigator>
  );
}
