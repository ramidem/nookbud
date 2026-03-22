import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { z } from 'zod';

import { Button, InputLayout, TextInput, Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { SetupStackParamList } from '@/navigation/SetupNavigator';
import { SpaceService, UserService } from '@/services';

type Props = NativeStackScreenProps<SetupStackParamList, 'Profile'>;

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfileScreen({ navigation: _navigation }: Props) {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProfileForm>({
    defaultValues: { firstName: '', lastName: '', middleName: '' },
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const existing = await UserService.hasUser();

      if (existing) {
        await UserService.updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || undefined,
        });
      } else {
        // First-time email/password sign up — no local user yet.
        // Get Supabase auth user so the local row id matches auth.uid().
        const authUser = await UserService.getCurrentAuthUser();
        await UserService.createUser({
          email: authUser?.email,
          firstName: data.firstName,
          id: authUser?.id,
          lastName: data.lastName,
          middleName: data.middleName || undefined,
        });

        // Sync to Supabase if we have an auth user
        if (authUser?.id) {
          await UserService.syncToSupabase(authUser.id);
        }
      }

      // Auto-create a default space so the user lands in Main immediately
      await SpaceService.createSpace('My Space');

      rootNavigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={tw`px-6 pb-12 pt-16`}
      keyboardShouldPersistTaps="handled"
      style={tw`bg-surface flex-1`}
    >
      <Typography style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>
        Your profile
      </Typography>
      <Typography style={tw`text-subtitle mb-8 text-base`}>
        How you{"'"}ll appear to your co-parent.
      </Typography>

      <View style={tw`gap-4`}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <InputLayout error={errors.firstName?.message} label="First name">
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="First name"
                value={value}
                onChangeText={onChange}
              />
            </InputLayout>
          )}
        />

        <Controller
          control={control}
          name="middleName"
          render={({ field: { onChange, value } }) => (
            <InputLayout label="Middle name (optional)">
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Middle name"
                value={value}
                onChangeText={onChange}
              />
            </InputLayout>
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <InputLayout error={errors.lastName?.message} label="Last name">
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Last name"
                value={value}
                onChangeText={onChange}
              />
            </InputLayout>
          )}
        />
      </View>

      {serverError ? (
        <View style={tw`bg-error/15 mt-4 rounded-xl p-4`}>
          <Typography style={tw`text-error text-sm`}>{serverError}</Typography>
        </View>
      ) : null}

      <View style={tw`mt-8`}>
        <Button isLoading={isLoading} size="lg" title="Continue" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScrollView>
  );
}
