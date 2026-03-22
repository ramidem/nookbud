import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text } from 'react-native';

import { Button } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { AuthService } from '@/services';

type Props = NativeStackScreenProps<AuthStackParamList, 'CheckEmail'>;

export function CheckEmailScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { email } = route.params;
  const [isResending, setIsResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setResent(false);

    try {
      const { error: authError } = await AuthService.sendMagicLink(email);

      if (authError) {
        setError(authError);
      } else {
        setResent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    navigation.goBack();
  };

  return (
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>Check your email</Text>
      <Text style={tw`text-subtitle mb-2 text-base`}>We sent a magic link to:</Text>
      <Text style={tw`text-foreground mb-8 text-base font-medium`}>{email}</Text>

      <Text style={tw`text-subtitle text-sm`}>
        Tap the link in the email to sign in. It expires in 1 hour.{'\n\n'}
        Make sure to check your spam folder if you don{"'"}t see it.
      </Text>

      {resent ? (
        <View style={tw`bg-success/15 mt-6 rounded-xl p-4`}>
          <Text style={tw`text-success text-sm`}>Magic link resent!</Text>
        </View>
      ) : null}

      {error ? (
        <View style={tw`bg-error/15 mt-6 rounded-xl p-4`}>
          <Text style={tw`text-error text-sm`}>{error}</Text>
        </View>
      ) : null}

      <View style={tw`flex-1`} />

      <View style={tw`gap-3 pb-8`}>
        <Button
          isLoading={isResending}
          size="lg"
          title="Resend link"
          variant="outlined"
          onPress={handleResend}
        />
        <Button
          size="lg"
          title="Use a different email"
          variant="ghost"
          onPress={handleChangeEmail}
        />
      </View>
    </View>
  );
}
