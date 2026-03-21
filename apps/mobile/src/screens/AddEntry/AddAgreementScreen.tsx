import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { Alert } from '@/components/atoms';
import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { PencilLineIcon } from '@/icons';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, SpaceService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddAgreement'>;

export function AddAgreementScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [termsText, setTermsText] = useState('');
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);

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

  const canSave =
    title.trim().length > 0 &&
    termsText.trim().length > 0 &&
    effectiveDate !== undefined &&
    hasPermission &&
    !isAllSpaces;

  const handleSave = async () => {
    if (!canSave || !activeSpaceId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        content: {
          effectiveDate: dayjs(effectiveDate).format('YYYY-MM-DD'),
          expirationDate: expirationDate ? dayjs(expirationDate).format('YYYY-MM-DD') : undefined,
          termsText: termsText.trim(),
          title: title.trim(),
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`bg-surface flex-1`}
    >
      {/* Header */}
      <View
        style={tw`border-divider flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Add Agreement</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSave}>
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
          <View style={tw`mb-4 self-start rounded-full bg-neutral-200 px-3 py-1.5`}>
            <Text style={tw`text-foreground text-sm`}>
              {activeSpace.emoji} {activeSpace.name}
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
          <TextInput
            placeholder="e.g., Holiday Schedule 2026"
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Terms */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Terms *</Text>
          <TextInput
            multiline
            placeholder="Write the full terms of this agreement..."
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground min-h-40 rounded-xl border px-4 py-3`}
            textAlignVertical="top"
            value={termsText}
            onChangeText={setTermsText}
          />
        </View>

        {/* Dates */}
        <View style={tw`mb-6 flex-row`}>
          <DatePickerInput
            isRequired
            label="Effective Date"
            mode="date"
            placeholder="Select date"
            style={tw`mr-2 flex-1`}
            value={effectiveDate}
            onChange={setEffectiveDate}
          />
          <DatePickerInput
            label="Expires"
            minimumDate={effectiveDate}
            mode="date"
            placeholder="Optional"
            style={tw`ml-2 flex-1`}
            value={expirationDate}
            onChange={setExpirationDate}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
