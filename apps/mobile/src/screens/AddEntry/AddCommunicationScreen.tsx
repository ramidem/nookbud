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
import type { CommunicationImportance } from '@/types/entry-content.types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

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
        relationshipId,
        type: 'communication',
        content: {
          subject: subject.trim(),
          body: body.trim(),
          importance,
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
        <Text style={tw`text-lg font-semibold text-gray-900`}>Send Message</Text>
        <Pressable onPress={handleSave} disabled={!canSave || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}>
              Send
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Info banner */}
        <View style={tw`bg-blue-50 rounded-xl p-4 mb-6`}>
          <Text style={tw`text-blue-800 text-sm`}>
            💬 This creates a permanent, documented record of your message. It's not a chat — use it for important communications.
          </Text>
        </View>

        {/* Subject */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Subject *</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            placeholder="What is this about?"
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Body */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Message *</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 min-h-40`}
            placeholder="Write your message..."
            placeholderTextColor="#9CA3AF"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Importance */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Priority</Text>
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 py-3 rounded-lg ${importance === 'normal' ? 'bg-blue-600' : 'bg-gray-100'}`}
              onPress={() => setImportance('normal')}
            >
              <Text style={tw`text-center ${importance === 'normal' ? 'text-white' : 'text-gray-700'} font-medium`}>
                Normal
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 py-3 rounded-lg ${importance === 'high' ? 'bg-red-600' : 'bg-gray-100'}`}
              onPress={() => setImportance('high')}
            >
              <Text style={tw`text-center ${importance === 'high' ? 'text-white' : 'text-gray-700'} font-medium`}>
                ⚠️ High Priority
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
