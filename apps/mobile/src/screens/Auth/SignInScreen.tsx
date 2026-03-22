import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';

import { Button, TextInput } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { AuthService } from '@/services';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInScreen({ navigation }: Props) {
  const tw = useTw();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = EMAIL_REGEX.test(email.trim());

  const handleSendLink = async () => {
    if (!isValidEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await AuthService.sendMagicLink(email.trim().toLowerCase());

      if (authError) {
        setError(authError);

        return;
      }

      navigation.navigate('CheckEmail', { email: email.trim().toLowerCase() });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`bg-surface flex-1`}
    >
      <View style={tw`flex-1 px-6 pt-16`}>
        <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Sign in</Text>
        <Text style={tw`text-subtitle mb-8 text-base`}>
          We{"'"}ll send a magic link to your email. No password needed.
        </Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          returnKeyType="send"
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={handleSendLink}
        />

        {error ? (
          <View style={tw`bg-error/15 mt-4 rounded-xl p-4`}>
            <Text style={tw`text-error text-sm`}>{error}</Text>
          </View>
        ) : null}

        <View style={tw`flex-1`} />

        <View style={tw`pb-8`}>
          <Button
            disabled={!isValidEmail}
            isLoading={isLoading}
            size="lg"
            title="Send magic link"
            onPress={handleSendLink}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
