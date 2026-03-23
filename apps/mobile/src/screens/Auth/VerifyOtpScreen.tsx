import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Pressable, TextInput as RNTextInput, View } from 'react-native';

import { Button, Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { navigationRef } from '@/navigation/RootNavigator';
import { AuthService, LogService, UserService } from '@/services';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOtp'>;

const OTP_LENGTH = 6;
const INPUT_WIDTH = 48;
const INPUT_HEIGHT = 56;

export function VerifyOtpScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const tw = useTw();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const otp = digits.join('');

  const handleDigitChange = (value: string, index: number) => {
    // Allow pasting full OTP into first box
    if (value.length === OTP_LENGTH && index === 0) {
      const pasted = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = [...Array(OTP_LENGTH).fill('')];
      pasted.forEach((d, i) => {
        next[i] = d;
      });
      setDigits(next);
      inputRefs.current[OTP_LENGTH - 1]?.focus();

      return;
    }

    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) return;

    setIsLoading(true);
    setServerError(null);

    const trace = LogService.startTrace();
    LogService.info('auth', 'OTP verify attempt', { trace });

    const { error, user } = await AuthService.verifyOtp(email, otp);

    if (error || !user) {
      LogService.warn('auth', 'OTP verify failed', { error, trace });
      setIsLoading(false);
      setServerError(error ?? 'Verification failed. Please try again.');
      LogService.clearTrace();

      return;
    }

    LogService.info('auth', 'OTP verified — creating user and space', { trace });

    // Pin auth UID immediately
    UserService.setCurrentUserId(user.id);

    try {
      // Auto-create local user from email prefix (name can be changed in settings later)
      const emailPrefix = email.split('@')[0] ?? 'User';
      const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      await UserService.upsertUser({
        email,
        firstName,
        id: user.id,
        lastName: '',
      });

      await UserService.syncToSupabase(user.id);

      // Auto-create default space so they land in Main
      const { SpaceService } = await import('@/services');
      await SpaceService.createSpace('My Space');

      LogService.info('auth', 'Onboarding complete — navigating to Main', { trace });
      LogService.clearTrace();

      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Setup failed. Please try again.';
      LogService.error('auth', 'Post-OTP setup failed', { error: message, trace });
      LogService.clearTrace();
      setIsLoading(false);
      setServerError(message);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setServerError(null);
    setResendSuccess(false);

    const { error } = await AuthService.resendOtp(email);

    setIsResending(false);

    if (error) {
      setServerError(error);
    } else {
      setResendSuccess(true);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Typography style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>
        Check your email
      </Typography>
      <Typography style={tw`text-subtitle mb-8 text-base`}>
        {'We sent a 6-digit code to '}
        <Typography style={tw`text-foreground font-medium`}>{email}</Typography>
        {'. It expires in 10 minutes.'}
      </Typography>

      {/* OTP digit boxes */}
      <View style={tw`mb-6 flex-row justify-between`}>
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <RNTextInput
            key={i}
            ref={(ref) => {
              inputRefs.current[i] = ref;
            }}
            caretHidden
            selectTextOnFocus
            keyboardType="number-pad"
            maxLength={i === 0 ? OTP_LENGTH : 1}
            style={[
              tw`text-foreground rounded-xl border-2 text-center text-2xl font-bold`,
              { height: INPUT_HEIGHT, width: INPUT_WIDTH },
              digits[i] ? tw`border-primary bg-primary/5` : tw`border-border bg-surface-raised`,
            ]}
            value={digits[i]}
            onChangeText={(val) => handleDigitChange(val, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          />
        ))}
      </View>

      {serverError ? (
        <View style={tw`bg-error/10 mb-4 rounded-xl p-3`}>
          <Typography style={tw`text-error text-sm`}>{serverError}</Typography>
        </View>
      ) : null}

      {resendSuccess ? (
        <View style={tw`bg-success/10 mb-4 rounded-xl p-3`}>
          <Typography style={tw`text-success text-sm`}>New code sent.</Typography>
        </View>
      ) : null}

      <Button isLoading={isLoading} size="lg" title="Verify" onPress={handleVerify} />

      <View style={tw`mt-6 flex-row items-center justify-center`}>
        <Typography style={tw`text-subtitle text-sm`}>{"Didn't get it? "}</Typography>
        <Pressable disabled={isResending} onPress={handleResend}>
          <Typography style={tw`text-primary text-sm font-medium`}>
            {isResending ? 'Sending...' : 'Resend code'}
          </Typography>
        </Pressable>
      </View>

      <View style={tw`mt-3 flex-row items-center justify-center`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Typography style={tw`text-subtitle text-sm`}>Wrong email? Go back</Typography>
        </Pressable>
      </View>
    </View>
  );
}
