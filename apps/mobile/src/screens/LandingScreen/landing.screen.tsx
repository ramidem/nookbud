/**
 * LandingScreen — legacy entry point used by publicRoutes.tsx (@/routes system).
 *
 * TODO: When Supabase auth is wired up in Phase 5+, replace this with a proper
 * welcome/auth screen and migrate from the legacy @/routes system to RootNavigator.
 *
 * Currently: redirects to the onboarding flow via RootNavigator.
 * The active navigation stack is RootNavigator (apps/mobile/src/navigation/RootNavigator.tsx).
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ScreenContainer } from '@/components';
import { tw } from '@/tailwind';

export function LandingScreen() {
  return (
    <ScreenContainer hasScroll={false}>
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator color={tw.color('primary')} />
      </View>
    </ScreenContainer>
  );
}
