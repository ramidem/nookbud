import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { Button } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { UserService } from '@/services';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingComplete'>;

export function OnboardingCompleteScreen({ route }: Props) {
  const tw = useTw();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { defaultCurrency, displayName, timezone } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await UserService.createUser({
        defaultCurrency,
        displayName,
        timezone,
      });

      // Profile created — navigate to auth so user signs in with magic link.
      // After sign-in, RootNavigator boots them into Setup (CreateSpace flow).
      rootNavigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Ready to go!</Text>
      <Text style={tw`text-subtitle mb-8 text-base`}>Here{"'"}s a summary of your profile.</Text>

      <View style={tw`bg-background mb-8 rounded-xl p-4`}>
        <View style={tw`border-background flex-row justify-between border-b py-3`}>
          <Text style={tw`text-subtitle`}>Name</Text>
          <Text style={tw`text-foreground font-medium`}>{displayName}</Text>
        </View>
        <View style={tw`border-background flex-row justify-between border-b py-3`}>
          <Text style={tw`text-subtitle`}>Timezone</Text>
          <Text style={tw`text-foreground font-medium`}>{timezone}</Text>
        </View>
        <View style={tw`flex-row justify-between py-3`}>
          <Text style={tw`text-subtitle`}>Currency</Text>
          <Text style={tw`text-foreground font-medium`}>{defaultCurrency}</Text>
        </View>
      </View>

      {error && (
        <View style={tw`bg-error/15 mb-4 rounded-xl p-4`}>
          <Text style={tw`text-error`}>{error}</Text>
        </View>
      )}

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Button isLoading={isLoading} size="lg" title="Create Profile" onPress={handleComplete} />

        <Text style={tw`text-subtitle mt-4 text-center text-sm`}>
          Next: Sign in to your account
        </Text>
      </View>
    </View>
  );
}
