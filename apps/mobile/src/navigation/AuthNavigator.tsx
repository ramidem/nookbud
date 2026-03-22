import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { SignInScreen } from '@/screens/Auth/SignInScreen';
import { SignUpScreen } from '@/screens/Auth/SignUpScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
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
      <Stack.Screen component={SignUpScreen} name="SignUp" />
    </Stack.Navigator>
  );
}
