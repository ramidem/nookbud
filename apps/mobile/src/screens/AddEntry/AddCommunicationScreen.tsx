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
} from 'react-native';

import { Alert } from '@/components/atoms';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { AlertTriangleIcon, MessageCircleIcon } from '@/icons';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, SpaceService } from '@/services';
import { colors } from '@/tailwind';
import type { CommunicationImportance } from '@/types/entry-content.types';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddCommunication'>;

const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';

export function AddCommunicationScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [importance, setImportance] = useState<CommunicationImportance>('normal');

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
      if (role === 'lawyer' || role === 'viewer') {
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
    subject.trim().length > 0 && body.trim().length > 0 && hasPermission && !isAllSpaces;

  const handleSave = async () => {
    if (!canSave || !activeSpaceId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        content: {
          body: body.trim(),
          importance,
          subject: subject.trim(),
        },
        spaceId: activeSpaceId,
        type: 'communication',
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
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Send Message</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSave}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-primary' : 'text-placeholder'} text-base font-semibold`}
            >
              Send
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
        <View style={tw`bg-primary/15 mb-6 flex-row rounded-xl p-4`}>
          <MessageCircleIcon height={16} style={tw`text-primary mr-2 mt-0.5`} width={16} />
          <Text style={tw`text-primary flex-1 text-sm`}>
            This creates a permanent, documented record of your message. It{"'"}s not a chat — use
            it for important communications.
          </Text>
        </View>

        {/* Subject */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Subject *</Text>
          <TextInput
            placeholder="What is this about?"
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Body */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Message *</Text>
          <TextInput
            multiline
            placeholder="Write your message..."
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground min-h-40 rounded-xl border px-4 py-3`}
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
          />
        </View>

        {/* Importance */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Priority</Text>
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 rounded-lg py-3 ${importance === 'normal' ? 'bg-primary' : 'bg-neutral-200'}`}
              onPress={() => setImportance('normal')}
            >
              <Text
                style={tw`text-center ${importance === 'normal' ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
              >
                Normal
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 flex-row items-center justify-center rounded-lg py-3 ${importance === 'high' ? 'bg-error' : 'bg-neutral-200'}`}
              onPress={() => setImportance('high')}
            >
              <AlertTriangleIcon
                height={16}
                style={tw`mr-1 ${importance === 'high' ? ACTIVE_TEXT : INACTIVE_TEXT}`}
                width={16}
              />
              <Text style={tw`${importance === 'high' ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}>
                High Priority
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
