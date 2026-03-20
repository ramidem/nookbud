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
import { useTw } from '@/hooks/useTw';
import { EntryService, RelationshipService } from '@/services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddAgreement'>;

export function AddAgreementScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [termsText, setTermsText] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    async function load() {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) setRelationshipId(rel.id);
    }
    load();
  }, []);

  const canSave = title.trim().length > 0 && termsText.trim().length > 0 && effectiveDate.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !relationshipId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        relationshipId,
        type: 'agreement',
        content: {
          title: title.trim(),
          termsText: termsText.trim(),
          effectiveDate: effectiveDate.trim(),
          expirationDate: expirationDate.trim() || undefined,
        },
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
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-gray-100`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-blue-600 text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Add Agreement</Text>
        <Pressable onPress={handleSave} disabled={!canSave || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Info banner */}
        <View style={tw`bg-amber-50 rounded-xl p-4 mb-6`}>
          <Text style={tw`text-amber-800 text-sm`}>
            📝 Agreements become part of your permanent record. Both parents can see and acknowledge them.
          </Text>
        </View>

        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Agreement Title *</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            placeholder="e.g., Holiday Schedule 2026"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Terms */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Terms *</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 min-h-40`}
            placeholder="Write the full terms of this agreement..."
            placeholderTextColor="#9CA3AF"
            value={termsText}
            onChangeText={setTermsText}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Dates */}
        <View style={tw`flex-row mb-6`}>
          <View style={tw`flex-1 mr-2`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Effective Date *</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-3`}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={effectiveDate}
              onChangeText={setEffectiveDate}
            />
          </View>
          <View style={tw`flex-1 ml-2`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Expires</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-3`}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={expirationDate}
              onChangeText={setExpirationDate}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
