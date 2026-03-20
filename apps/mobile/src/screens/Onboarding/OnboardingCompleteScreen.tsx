import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTw } from '@/hooks/useTw';
import { UserService } from '@/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingComplete'>;

export function OnboardingCompleteScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { displayName, timezone, defaultCurrency } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await UserService.createUser({
        displayName,
        timezone,
        defaultCurrency,
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
      <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
        Ready to go!
      </Text>
      <Text style={tw`text-base text-gray-600 mb-8`}>
        Here's a summary of your profile.
      </Text>

      <View style={tw`bg-gray-50 rounded-xl p-4 mb-8`}>
        <View style={tw`flex-row justify-between py-3 border-b border-gray-200`}>
          <Text style={tw`text-gray-600`}>Name</Text>
          <Text style={tw`text-gray-900 font-medium`}>{displayName}</Text>
        </View>
        <View style={tw`flex-row justify-between py-3 border-b border-gray-200`}>
          <Text style={tw`text-gray-600`}>Timezone</Text>
          <Text style={tw`text-gray-900 font-medium`}>{timezone}</Text>
        </View>
        <View style={tw`flex-row justify-between py-3`}>
          <Text style={tw`text-gray-600`}>Currency</Text>
          <Text style={tw`text-gray-900 font-medium`}>{defaultCurrency}</Text>
        </View>
      </View>

      {error && (
        <View style={tw`bg-red-50 rounded-xl p-4 mb-4`}>
          <Text style={tw`text-red-600`}>{error}</Text>
        </View>
      )}

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Pressable
          style={tw`bg-blue-600 rounded-xl py-4 flex-row justify-center items-center`}
          onPress={handleComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-semibold`}>
              Create Profile
            </Text>
          )}
        </Pressable>

        <Text style={tw`text-center text-gray-500 text-sm mt-4`}>
          Next: Add your children
        </Text>
      </View>
    </View>
  );
}
