import { zodResolver } from '@hookform/resolvers/zod';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { useTw } from '@/hooks/useTw';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { SpaceMemberService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<RootStackParamList, 'AcceptInvite'>;

const MAX_TOKEN_LENGTH = 8;
const MIN_TOKEN_LENGTH = 6;

const acceptInviteSchema = z.object({
  code: z
    .string()
    .min(MIN_TOKEN_LENGTH, 'Code must be at least 6 characters')
    .max(MAX_TOKEN_LENGTH),
});

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

export function AcceptInviteScreen({ navigation, route }: Props) {
  const tw = useTw();
  const initialToken = route.params?.token ?? '';
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<AcceptInviteFormData>({
    defaultValues: { code: initialToken },
    mode: 'onChange',
    resolver: zodResolver(acceptInviteSchema),
  });

  const onSubmit = async (data: AcceptInviteFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await SpaceMemberService.acceptInvite(data.code);
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
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Join your co-parent</Text>
      <Text style={tw`text-subtitle mb-8 text-base`}>
        Enter the invite code shared by your co-parent to connect your accounts.
      </Text>

      <View style={tw`mb-4`}>
        <Text style={tw`text-foreground mb-2 text-sm font-medium`}>Invite Code</Text>
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
              maxLength={MAX_TOKEN_LENGTH}
              placeholder="ABCD1234"
              placeholderTextColor={colors.placeholder}
              style={tw`border-divider bg-surface text-foreground rounded-xl border px-4 py-4 text-center font-mono text-2xl font-bold tracking-widest`}
              value={value}
              onChangeText={(text) => {
                onChange(
                  text
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, MAX_TOKEN_LENGTH),
                );
                if (error) setError('');
              }}
            />
          )}
        />
      </View>

      {error ? (
        <View style={tw`bg-error/15 mb-4 rounded-xl p-4`}>
          <Text style={tw`text-error text-sm`}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={!isValid || isLoading}
        style={tw`mb-4 items-center rounded-xl py-4 ${
          !isValid || isLoading ? 'bg-disabled' : 'bg-primary'
        }`}
        onPress={handleSubmit(onSubmit)}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={tw`text-lg font-semibold text-white`}>Join</Text>
        )}
      </Pressable>

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-subtitle text-center text-base`}>Go back</Text>
        </Pressable>
      </View>
    </View>
  );
}
