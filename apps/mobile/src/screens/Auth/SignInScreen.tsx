import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { Button, Divider, InputLayout, TextInput, Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { AuthService } from '@/services';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const MIN_PASSWORD_LENGTH = 6;

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(MIN_PASSWORD_LENGTH, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

export function SignInScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInForm>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setServerError(null);

    const { error } = await AuthService.signIn(data.email, data.password);

    setIsLoading(false);

    if (error) {
      setServerError(error);
    }
    // On success, RootNavigator's onAuthStateChange handles navigation
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setServerError(null);

    const { error } = await AuthService.signInWithGoogle();

    setIsGoogleLoading(false);

    if (error) {
      setServerError(error);
    }
    // On success, deep link callback → RootNavigator handles navigation
  };

  return (
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Typography style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Sign in</Typography>
      <Typography style={tw`text-subtitle mb-8 text-base`}>Welcome back.</Typography>

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
                placeholder="Enter your password"
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
        title="Sign in"
        onPress={handleSubmit(onSubmit)}
      />

      <View style={tw`mt-6 flex-row items-center justify-center`}>
        <Typography style={tw`text-subtitle text-sm`}>{"Don't have an account? "}</Typography>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Typography style={tw`text-primary text-sm font-medium`}>Sign up</Typography>
        </Pressable>
      </View>
    </View>
  );
}
