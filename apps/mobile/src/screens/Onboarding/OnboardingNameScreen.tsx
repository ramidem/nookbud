import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';

import { useTw } from '@/hooks/useTw';
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-white`}
    >
      <View style={tw`flex-1 px-6 pt-16`}>
        <Text style={tw`mb-2 text-3xl font-bold text-gray-900`}>What{"'"}s your name?</Text>
        <Text style={tw`mb-8 text-base text-gray-600`}>
          This is how you{"'"}ll appear to your co-parent.
        </Text>

        <TextInput
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          style={tw`rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-lg`}
          value={name}
          onChangeText={setName}
        />

        <View style={tw`flex-1`} />

        <View style={tw`pb-8`}>
          <Pressable
            disabled={!canContinue}
            style={tw`${canContinue ? 'bg-blue-600' : 'bg-gray-300'} rounded-xl py-4`}
            onPress={handleContinue}
          >
            <Text style={tw`text-center text-lg font-semibold text-white`}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
