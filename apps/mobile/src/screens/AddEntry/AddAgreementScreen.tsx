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
  Alert,
} from 'react-native';

import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import { useTw } from '@/hooks/useTw';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, RelationshipService } from '@/services';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddAgreement'>;

export function AddAgreementScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [termsText, setTermsText] = useState('');
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) setRelationshipId(rel.id);
    }
    load();
  }, []);

  const canSave =
    title.trim().length > 0 && termsText.trim().length > 0 && effectiveDate !== undefined;

  const handleSave = async () => {
    if (!canSave || !relationshipId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        content: {
          effectiveDate: dayjs(effectiveDate).format('YYYY-MM-DD'),
          expirationDate: expirationDate ? dayjs(expirationDate).format('YYYY-MM-DD') : undefined,
          termsText: termsText.trim(),
          title: title.trim(),
        },
        relationshipId,
        type: 'agreement',
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-white`}
    >
      {/* Header */}
      <View
        style={tw`flex-row items-center justify-between border-b border-gray-100 px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-base text-blue-600`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Add Agreement</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSave}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Info banner */}
        <View style={tw`mb-6 rounded-xl bg-amber-50 p-4`}>
          <Text style={tw`text-sm text-amber-800`}>
            <Text aria-label="memo" role="img">
              📝
            </Text>{' '}
            Agreements become part of your permanent record. Both parents can see and acknowledge
            them.
          </Text>
        </View>

        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Agreement Title *</Text>
          <TextInput
            placeholder="e.g., Holiday Schedule 2026"
            placeholderTextColor="#9CA3AF"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Terms */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Terms *</Text>
          <TextInput
            multiline
            placeholder="Write the full terms of this agreement..."
            placeholderTextColor="#9CA3AF"
            style={tw`min-h-40 rounded-xl border border-gray-300 px-4 py-3`}
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
