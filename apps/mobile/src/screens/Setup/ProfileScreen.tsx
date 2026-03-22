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
import { LogService, SpaceService, UserService } from '@/services';

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

    const trace = LogService.startTrace();
    LogService.info('setup', 'Profile submit started', { trace });

    try {
      // Must have a live auth session to proceed.
      const authUser = await UserService.getCurrentAuthUser();
      LogService.debug('setup', 'Auth user fetched', { hasAuthUser: !!authUser, trace });

      if (!authUser) {
        // Session expired or user was deleted mid-flow — send back to sign in.
        LogService.warn('setup', 'No auth session on Profile submit — redirecting to Auth', {
          trace,
        });
        LogService.clearTrace();
        rootNavigation.reset({ index: 0, routes: [{ name: 'Auth' }] });

        return;
      }

      // Pin auth UID in MMKV so hasUser() / getCurrentUser() can find any existing row.
      UserService.setCurrentUserId(authUser.id);

      const existing = await UserService.hasUser();
      LogService.debug('setup', 'User existence check', { existing, trace });

      // upsert handles both create and retry-after-crash in one call
      await UserService.upsertUser({
        email: authUser.email,
        firstName: data.firstName,
        id: authUser.id,
        lastName: data.lastName,
        middleName: data.middleName || undefined,
      });
      LogService.info('setup', existing ? 'User upserted (update)' : 'User upserted (create)', {
        trace,
      });

      await UserService.syncToSupabase(authUser.id);
      LogService.info('setup', 'User synced to Supabase', { trace });

      // Auto-create a default space so the user lands in Main immediately
      await SpaceService.createSpace('My Space');
      LogService.info('setup', 'Default space created — navigating to Main', { trace });

      LogService.clearTrace();
      rootNavigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      LogService.error('setup', 'Profile submit failed', { error: message, trace });
      LogService.clearTrace();
      setServerError(message);
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
