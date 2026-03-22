import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { z } from 'zod';

import { Button, InputLayout, SelectDropdown, TextInput, Typography } from '@/components';
import { USER_ROLES, USER_ROLE_DISPLAY } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { SetupStackParamList } from '@/navigation/SetupNavigator';
import { UserService } from '@/services';

type Props = NativeStackScreenProps<SetupStackParamList, 'Profile'>;

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  role: z.enum(['mother', 'father', 'guardian', 'other'], {
    required_error: 'Please select your role',
  }),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ROLE_OPTIONS = USER_ROLES.map((r) => ({ label: USER_ROLE_DISPLAY[r], value: r }));

export function ProfileScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProfileForm>({
    defaultValues: { firstName: '', lastName: '', middleName: '', role: undefined },
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setServerError(null);

    try {
      await UserService.updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || undefined,
        role: data.role,
      });

      navigation.navigate('AddChild');
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

        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <InputLayout error={errors.role?.message} label="Your role">
              <SelectDropdown
                data={ROLE_OPTIONS}
                placeholder="Select your role"
                value={value}
                onSelect={(item) => onChange(item.value)}
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
