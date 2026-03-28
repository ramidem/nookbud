import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { Alert, EmojiText } from '@/components/atoms';
import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { PencilLineIcon } from '@/icons';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { EntryService, SpaceService } from '@/services';
import { colors } from '@/tailwind';

const agreementFormSchema = z.object({
  effectiveDate: z.date({ required_error: 'Effective date is required' }),
  expirationDate: z.date().optional(),
  termsText: z.string().min(1, 'Terms are required'),
  title: z.string().min(1, 'Title is required'),
});

type AgreementFormData = z.infer<typeof agreementFormSchema>;

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddAgreement'>;

export function AddAgreementScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const {
    control,
    formState: { isValid },
    handleSubmit,
    watch,
  } = useForm<AgreementFormData>({
    defaultValues: {
      effectiveDate: undefined,
      expirationDate: undefined,
      termsText: '',
      title: '',
    },
    mode: 'onChange',
    resolver: zodResolver(agreementFormSchema),
  });

  const effectiveDateValue = watch('effectiveDate');

  useEffect(() => {
    async function load() {
      if (isAllSpaces || !activeSpaceId) {
        Alert.error({
          message:
            'Please select a Space first. Tap the Space switcher at the top to choose which Space to log this entry to.',
          title: 'No Space Selected',
        });
        navigation.goBack();

        return;
      }

      // Role permission check
      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'viewer') {
        Alert.error({
          message: 'Your role in this Space does not allow creating entries.',
          title: 'Access Denied',
        });
        setHasPermission(false);
        navigation.goBack();
      }
    }
    load();
  }, [activeSpaceId, isAllSpaces, navigation]);

  const canSave = isValid && hasPermission && !isAllSpaces;

  const onSubmit = async (data: AgreementFormData) => {
    if (!activeSpaceId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        content: {
          effectiveDate: dayjs(data.effectiveDate).format('YYYY-MM-DD'),
          expirationDate: data.expirationDate
            ? dayjs(data.expirationDate).format('YYYY-MM-DD')
            : undefined,
          termsText: data.termsText.trim(),
          title: data.title.trim(),
        },
        spaceId: activeSpaceId,
        type: 'agreement',
      });

      navigation.goBack();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to save',
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View
        style={tw`border-background flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Add Agreement</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSubmit(onSubmit)}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-primary' : 'text-placeholder'} text-base font-semibold`}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Space context pill */}
        {activeSpace && (
          <View style={tw`mb-4 self-start rounded-lg bg-neutral-200 px-3 py-1.5`}>
            <Text style={tw`text-foreground text-sm`}>
              <EmojiText>{activeSpace.emoji}</EmojiText> {activeSpace.name}
            </Text>
          </View>
        )}

        {/* Info banner */}
        <View style={tw`bg-warning/15 mb-6 flex-row rounded-xl p-4`}>
          <PencilLineIcon height={16} style={tw`text-warning mr-2 mt-0.5`} width={16} />
          <Text style={tw`text-warning flex-1 text-sm`}>
            Agreements become part of your permanent record. Both parents can see and acknowledge
            them.
          </Text>
        </View>

        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Agreement Title *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="e.g., Holiday Schedule 2026"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Terms */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Terms *</Text>
          <Controller
            control={control}
            name="termsText"
            render={({ field: { onChange, value } }) => (
              <TextInput
                multiline
                placeholder="Write the full terms of this agreement..."
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground min-h-40 rounded-xl border px-4 py-3`}
                textAlignVertical="top"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Dates */}
        <View style={tw`mb-6 flex-row`}>
          <Controller
            control={control}
            name="effectiveDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                isRequired
                label="Effective Date"
                mode="date"
                placeholder="Select date"
                style={tw`mr-2 flex-1`}
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="expirationDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                label="Expires"
                minimumDate={effectiveDateValue}
                mode="date"
                placeholder="Optional"
                style={tw`ml-2 flex-1`}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
