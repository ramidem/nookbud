import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';

import { useTw } from '@/hooks/useTw';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { UserService } from '@/services';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingComplete'>;

export function OnboardingCompleteScreen({ navigation, route }: Props) {
  const tw = useTw();
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

      // Navigate to add children screen
      navigation.navigate('AddChild');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white px-6 pt-16`}>
      <Text style={tw`mb-2 text-3xl font-bold text-gray-900`}>Ready to go!</Text>
      <Text style={tw`mb-8 text-base text-gray-600`}>Here{"'"}s a summary of your profile.</Text>

      <View style={tw`mb-8 rounded-xl bg-gray-50 p-4`}>
        <View style={tw`flex-row justify-between border-b border-gray-200 py-3`}>
          <Text style={tw`text-gray-600`}>Name</Text>
          <Text style={tw`font-medium text-gray-900`}>{displayName}</Text>
        </View>
        <View style={tw`flex-row justify-between border-b border-gray-200 py-3`}>
          <Text style={tw`text-gray-600`}>Timezone</Text>
          <Text style={tw`font-medium text-gray-900`}>{timezone}</Text>
        </View>
        <View style={tw`flex-row justify-between py-3`}>
          <Text style={tw`text-gray-600`}>Currency</Text>
          <Text style={tw`font-medium text-gray-900`}>{defaultCurrency}</Text>
        </View>
      </View>

      {error && (
        <View style={tw`mb-4 rounded-xl bg-red-50 p-4`}>
          <Text style={tw`text-red-600`}>{error}</Text>
        </View>
      )}

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Pressable
          disabled={isLoading}
          style={tw`flex-row items-center justify-center rounded-xl bg-blue-600 py-4`}
          onPress={handleComplete}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-center text-lg font-semibold text-white`}>Create Profile</Text>
          )}
        </Pressable>

        <Text style={tw`mt-4 text-center text-sm text-gray-500`}>Next: Add your children</Text>
      </View>
    </View>
  );
}
