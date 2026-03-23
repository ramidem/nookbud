import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { SignInScreen } from '@/screens/Auth/SignInScreen';
import { SignUpScreen } from '@/screens/Auth/SignUpScreen';
import { VerifyOtpScreen } from '@/screens/Auth/VerifyOtpScreen';
import { WelcomeScreen } from '@/screens/Welcome/WelcomeScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  VerifyOtp: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen component={WelcomeScreen} name="Welcome" />
      <Stack.Screen component={SignInScreen} name="SignIn" />
      <Stack.Screen component={SignUpScreen} name="SignUp" />
      <Stack.Screen component={VerifyOtpScreen} name="VerifyOtp" />
    </Stack.Navigator>
  );
}
