import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AddChildScreen } from '@/screens/Onboarding/AddChildScreen';
import { CreateSpaceScreen } from '@/screens/Onboarding/CreateSpaceScreen';
import { InvitePartnerScreen } from '@/screens/Onboarding/InvitePartnerScreen';
import { OnboardingCompleteScreen } from '@/screens/Onboarding/OnboardingCompleteScreen';
import { OnboardingCurrencyScreen } from '@/screens/Onboarding/OnboardingCurrencyScreen';
import { OnboardingNameScreen } from '@/screens/Onboarding/OnboardingNameScreen';
import { OnboardingTimezoneScreen } from '@/screens/Onboarding/OnboardingTimezoneScreen';

export type OnboardingStackParamList = {
  OnboardingName: undefined;
  OnboardingTimezone: {
    displayName: string;
  };
  OnboardingCurrency: {
    displayName: string;
    timezone: string;
  };
  OnboardingComplete: {
    displayName: string;
    timezone: string;
    defaultCurrency: string;
  };
  CreateSpace: undefined;
  AddChild: {
    spaceId: string;
  };
  InviteMembers: {
    spaceId: string;
  };
  OnboardingDone: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen component={OnboardingNameScreen} name="OnboardingName" />
      <Stack.Screen component={OnboardingTimezoneScreen} name="OnboardingTimezone" />
      <Stack.Screen component={OnboardingCurrencyScreen} name="OnboardingCurrency" />
      <Stack.Screen component={OnboardingCompleteScreen} name="OnboardingComplete" />
      <Stack.Screen component={CreateSpaceScreen} name="CreateSpace" />
      <Stack.Screen component={AddChildScreen} name="AddChild" />
      <Stack.Screen component={InvitePartnerScreen} name="InviteMembers" />
    </Stack.Navigator>
  );
}
