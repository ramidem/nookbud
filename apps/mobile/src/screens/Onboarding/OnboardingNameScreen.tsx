import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTw } from '@/hooks/useTw';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingName'>;

export function OnboardingNameScreen({ navigation }: Props) {
  const tw = useTw();
  const [name, setName] = useState('');

  const canContinue = name.trim().length >= 2;

  const handleContinue = () => {
    if (canContinue) {
      navigation.navigate('OnboardingTimezone', { displayName: name.trim() });
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={tw`flex-1 px-6 pt-16`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
          What's your name?
        </Text>
        <Text style={tw`text-base text-gray-600 mb-8`}>
          This is how you'll appear to your co-parent.
        </Text>

        <TextInput
          style={tw`border border-gray-300 rounded-xl px-4 py-4 text-lg bg-gray-50`}
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
        />

        <View style={tw`flex-1`} />

        <View style={tw`pb-8`}>
          <Pressable
            style={tw`${canContinue ? 'bg-blue-600' : 'bg-gray-300'} rounded-xl py-4`}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={tw`text-white text-center text-lg font-semibold`}>
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
