import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';

import { useTw } from '@/hooks/useTw';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { RelationshipService } from '@/services';

type Props = NativeStackScreenProps<RootStackParamList, 'AcceptInvite'>;

const MAX_TOKEN_LENGTH = 8;
const MIN_TOKEN_LENGTH = 6;

export function AcceptInviteScreen({ navigation, route }: Props) {
  const tw = useTw();
  const initialToken = route.params?.token ?? '';
  const [code, setCode] = useState(initialToken);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isCodeValid = code.length >= MIN_TOKEN_LENGTH;

  const handleCodeChange = (text: string) => {
    setCode(
      text
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, MAX_TOKEN_LENGTH),
    );
    if (error) setError('');
  };

  const handleJoin = async () => {
    if (!isCodeValid) {
      setError('Code must be at least 6 characters');

      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await RelationshipService.acceptInvite(code);
      // Navigate to main app after successful join
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message.includes('expired')) {
        setError('This invite code has expired. Ask your co-parent for a new one.');
      } else if (message.includes('already has a partner')) {
        setError('This invite has already been used.');
      } else if (message.includes('own relationship')) {
        setError('You cannot join your own relationship.');
      } else {
        setError('Invalid or expired code. Please check and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-white px-6 pt-16`}>
      <Text style={tw`mb-2 text-3xl font-bold text-gray-900`}>Join your co-parent</Text>
      <Text style={tw`mb-8 text-base text-gray-600`}>
        Enter the invite code shared by your co-parent to connect your accounts.
      </Text>

      <View style={tw`mb-4`}>
        <Text style={tw`mb-2 text-sm font-medium text-gray-700`}>Invite Code</Text>
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isLoading}
          maxLength={MAX_TOKEN_LENGTH}
          placeholder="ABCD1234"
          placeholderTextColor="#9CA3AF"
          style={tw`rounded-xl border border-gray-300 bg-white px-4 py-4 text-center font-mono text-2xl font-bold tracking-widest text-gray-900`}
          value={code}
          onChangeText={handleCodeChange}
        />
      </View>

      {error ? (
        <View style={tw`mb-4 rounded-xl bg-red-50 p-4`}>
          <Text style={tw`text-sm text-red-700`}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={!isCodeValid || isLoading}
        style={tw`mb-4 items-center rounded-xl py-4 ${
          !isCodeValid || isLoading ? 'bg-blue-300' : 'bg-blue-600'
        }`}
        onPress={handleJoin}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-lg font-semibold text-white`}>Join</Text>
        )}
      </Pressable>

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-center text-base text-gray-500`}>Go back</Text>
        </Pressable>
      </View>
    </View>
  );
}
