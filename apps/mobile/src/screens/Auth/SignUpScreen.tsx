import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { Button, Divider, InputLayout, TextInput, Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { navigationRef } from '@/navigation/RootNavigator';
import { AuthService, LogService, SpaceService } from '@/services';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

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

export function SignUpScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

    LogService.info('auth', 'Sign up attempt', { email: data.email });
    const { error } = await AuthService.signUp(data.email, data.password);

    if (error) {
      LogService.warn('auth', 'Sign up error', { error });
      // If already registered, try signing in with same credentials silently
      if (
        error.toLowerCase().includes('already registered') ||
        error.toLowerCase().includes('already exists')
      ) {
        const { error: signInError } = await AuthService.signIn(data.email, data.password);
        setIsLoading(false);
        if (signInError) {
          setServerError('An account with this email already exists. Please sign in instead.');

          return;
        }

        const spaces = await SpaceService.listSpaces();
        const target = spaces.length === 0 ? 'Setup' : 'Main';
        const navigateAfterSignIn = () => {
          if (navigationRef.isReady()) {
            navigationRef.reset({ index: 0, routes: [{ name: target }] });
          } else {
            setTimeout(navigateAfterSignIn, 100);
          }
        };

        navigateAfterSignIn();

        return;
      }
      setIsLoading(false);
      setServerError(error);

      return;
    }

    LogService.info('auth', 'Sign up success — navigating to Setup');
    setIsLoading(false);

    // Navigate to Setup — retry a few times in case navigationRef isn't ready yet
    const navigate = () => {
      const ready = navigationRef.isReady();
      LogService.debug('nav', 'navigationRef ready check (signup)', { ready });
      if (ready) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Setup' }] });
      } else {
        setTimeout(navigate, 100);
      }
    };

    navigate();
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setServerError(null);

    const { error } = await AuthService.signInWithGoogle();

    setIsGoogleLoading(false);

    if (error) {
      setServerError(error);
    }
  };

  return (
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Typography style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>
        Create account
      </Typography>
      <Typography style={tw`text-subtitle mb-8 text-base`}>
        Your data stays on your device. An account lets you sync and recover it.
      </Typography>

      <Button
        isLoading={isGoogleLoading}
        size="lg"
        title="Continue with Google"
        variant="outlined"
        onPress={handleGoogleSignIn}
      />

      <View style={tw`my-6 flex-row items-center gap-3`}>
        <Divider style={tw`flex-1`} />
        <Typography style={tw`text-subtitle text-sm`}>or</Typography>
        <Divider style={tw`flex-1`} />
      </View>

      {serverError ? (
        <View style={tw`bg-error/10 mb-4 rounded-xl p-3`}>
          <Typography style={tw`text-error text-sm`}>{serverError}</Typography>
        </View>
      ) : null}

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
            <InputLayout error={errors.confirmPassword?.message} label="Confirm password">
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
        size="lg"
        style={tw`mt-6`}
        title="Create account"
        onPress={handleSubmit(onSubmit)}
      />

      <View style={tw`mt-6 flex-row items-center justify-center`}>
        <Typography style={tw`text-subtitle text-sm`}>Already have an account? </Typography>
        <Pressable onPress={() => navigation.navigate('SignIn')}>
          <Typography style={tw`text-primary text-sm font-medium`}>Sign in</Typography>
        </Pressable>
      </View>
    </View>
  );
}
