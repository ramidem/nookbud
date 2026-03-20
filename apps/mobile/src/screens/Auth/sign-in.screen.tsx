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

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(MIN_PASSWORD_LENGTH, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

export function SignInScreen(props: PublicScreenProps<Screens.SIGN_IN>) {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(false);
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

      return;
    }

    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Sign In" />
      <View style={tw`flex-1 px-6 pt-4`}>
        <Typography style={tw`text-subtitle mb-6 text-sm`}>
          Sign in to sync your data across devices. Your local data is safe — syncing is optional.
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
          style={tw`mt-8`}
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
        />

        <View style={tw`mt-6 flex-row items-center justify-center`}>
          <Typography style={tw`text-subtitle text-sm`}>{"Don't have an account? "}</Typography>
          <Pressable onPress={() => navigation.replace(Screens.SIGN_UP)}>
            <Typography style={tw`text-primary text-sm font-medium`}>Sign Up</Typography>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
