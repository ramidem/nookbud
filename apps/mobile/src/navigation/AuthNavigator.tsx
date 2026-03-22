import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CheckEmailScreen } from '@/screens/Auth/CheckEmailScreen';
import { SignInScreen } from '@/screens/Auth/SignInScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  CheckEmail: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen component={SignInScreen} name="SignIn" />
      <Stack.Screen component={CheckEmailScreen} name="CheckEmail" />
    </Stack.Navigator>
  );
}
