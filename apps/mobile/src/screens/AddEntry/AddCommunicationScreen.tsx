import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, RelationshipService } from '@/services';
import type { CommunicationImportance } from '@/types/entry-content.types';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddCommunication'>;

export function AddCommunicationScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [importance, setImportance] = useState<CommunicationImportance>('normal');

  useEffect(() => {
    async function load() {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) setRelationshipId(rel.id);
    }
    load();
  }, []);

  const canSave = subject.trim().length > 0 && body.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !relationshipId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        content: {
          body: body.trim(),
          importance,
          subject: subject.trim(),
        },
        relationshipId,
        type: 'communication',
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
        <Text style={tw`text-lg font-semibold text-gray-900`}>Send Message</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSave}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}
            >
              Send
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Info banner */}
        <View style={tw`mb-6 rounded-xl bg-blue-50 p-4`}>
          <Text style={tw`text-sm text-blue-800`}>
            💬 This creates a permanent, documented record of your message. It{"'"}s not a chat —
            use it for important communications.
          </Text>
        </View>

        {/* Subject */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Subject *</Text>
          <TextInput
            placeholder="What is this about?"
            placeholderTextColor="#9CA3AF"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Body */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Message *</Text>
          <TextInput
            multiline
            placeholder="Write your message..."
            placeholderTextColor="#9CA3AF"
            style={tw`min-h-40 rounded-xl border border-gray-300 px-4 py-3`}
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
          />
        </View>

        {/* Importance */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Priority</Text>
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 rounded-lg py-3 ${importance === 'normal' ? 'bg-blue-600' : 'bg-gray-100'}`}
              onPress={() => setImportance('normal')}
            >
              <Text
                style={tw`text-center ${importance === 'normal' ? 'text-white' : 'text-gray-700'} font-medium`}
              >
                Normal
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-lg py-3 ${importance === 'high' ? 'bg-red-600' : 'bg-gray-100'}`}
              onPress={() => setImportance('high')}
            >
              <Text
                style={tw`text-center ${importance === 'high' ? 'text-white' : 'text-gray-700'} font-medium`}
              >
                ⚠️ High Priority
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
