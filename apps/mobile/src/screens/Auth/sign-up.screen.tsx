import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import {
  Button,
  InputLayout,
  ScreenContainer,
  ScreenHeader,
  TextInput,
  Typography,
} from '@/components';
import { PublicScreenProps, Screens } from '@/routes';
import { AuthService } from '@/services/auth.service';
import { tw } from '@/tailwind';

const MIN_PASSWORD_LENGTH = 6;

const signUpSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Confirm your password'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export function SignUpScreen(props: PublicScreenProps<Screens.SIGN_UP>) {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SignUpForm>({
    defaultValues: { confirmPassword: '', email: '', password: '' },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    setServerError(null);

    const { error } = await AuthService.signUp(data.email, data.password);

    setIsLoading(false);

    if (error) {
      setServerError(error);

      return;
    }

    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Sign Up" />
      <View style={tw`flex-1 px-6 pt-4`}>
        <Typography style={tw`text-subtitle mb-6 text-sm`}>
          Create an account to sync your data across devices. You can always use the app offline.
        </Typography>

        {serverError && (
          <View style={tw`bg-error/10 mb-4 rounded-xl p-3`}>
            <Typography style={tw`text-error text-sm`}>{serverError}</Typography>
          </View>
        )}

        <View style={tw`gap-4`}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <InputLayout error={errors.email?.message} label="Email">
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                />
              </InputLayout>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <InputLayout error={errors.password?.message} label="Password">
                <TextInput
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="At least 6 characters"
                  value={value}
                  onChangeText={onChange}
                />
              </InputLayout>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <InputLayout error={errors.confirmPassword?.message} label="Confirm Password">
                <TextInput
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                />
              </InputLayout>
            )}
          />
        </View>

        <Button
          isLoading={isLoading}
          style={tw`mt-8`}
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
        />

        <View style={tw`mt-6 flex-row items-center justify-center`}>
          <Typography style={tw`text-subtitle text-sm`}>Already have an account? </Typography>
          <Pressable onPress={() => navigation.replace(Screens.SIGN_IN)}>
            <Typography style={tw`text-primary text-sm font-medium`}>Sign In</Typography>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
