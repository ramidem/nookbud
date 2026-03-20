import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNameScreen } from '@/screens/Onboarding/OnboardingNameScreen';
import { OnboardingTimezoneScreen } from '@/screens/Onboarding/OnboardingTimezoneScreen';
import { OnboardingCurrencyScreen } from '@/screens/Onboarding/OnboardingCurrencyScreen';
import { OnboardingCompleteScreen } from '@/screens/Onboarding/OnboardingCompleteScreen';
import { AddChildScreen } from '@/screens/Onboarding/AddChildScreen';
import { InvitePartnerScreen } from '@/screens/Onboarding/InvitePartnerScreen';

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
  AddChild: undefined;
  InvitePartner: {
    relationshipId: string;
    inviteToken: string;
  };
  OnboardingDone: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
      <Stack.Screen name="OnboardingTimezone" component={OnboardingTimezoneScreen} />
      <Stack.Screen name="OnboardingCurrency" component={OnboardingCurrencyScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="InvitePartner" component={InvitePartnerScreen} />
    </Stack.Navigator>
  );
}
