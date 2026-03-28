import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { Alert, EmojiText } from '@/components/atoms';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { AlertTriangleIcon, MessageCircleIcon } from '@/icons';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { EntryService, SpaceService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddCommunication'>;

const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';

const communicationFormSchema = z.object({
  body: z.string().min(1, 'Message is required'),
  importance: z.enum(['normal', 'high']),
  subject: z.string().min(1, 'Subject is required'),
});

type CommunicationFormData = z.infer<typeof communicationFormSchema>;

export function AddCommunicationScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const { control, formState, handleSubmit } = useForm<CommunicationFormData>({
    defaultValues: { body: '', importance: 'normal' as const, subject: '' },
    mode: 'onChange',
    resolver: zodResolver(communicationFormSchema),
  });

  const { isValid } = formState;

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

  const onSubmit = async (data: CommunicationFormData) => {
    if (!activeSpaceId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        content: {
          body: data.body.trim(),
          importance: data.importance,
          subject: data.subject.trim(),
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
    <KeyboardAvoidingView behavior="padding" style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View
        style={tw`border-background flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Send Message</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSubmit(onSubmit)}>
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
          <View style={tw`mb-4 self-start rounded-lg bg-neutral-200 px-3 py-1.5`}>
            <Text style={tw`text-foreground text-sm`}>
              <EmojiText>{activeSpace.emoji}</EmojiText> {activeSpace.name}
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
          <Controller
            control={control}
            name="subject"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                placeholder="What is this about?"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Body */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Message *</Text>
          <Controller
            control={control}
            name="body"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                multiline
                placeholder="Write your message..."
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground min-h-40 rounded-xl border px-4 py-3`}
                textAlignVertical="top"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Importance */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Priority</Text>
          <Controller
            control={control}
            name="importance"
            render={({ field: { onChange, value } }) => (
              <View style={tw`flex-row gap-2`}>
                <Pressable
                  style={tw`flex-1 rounded-lg py-3 ${value === 'normal' ? 'bg-primary' : 'bg-neutral-200'}`}
                  onPress={() => onChange('normal')}
                >
                  <Text
                    style={tw`text-center ${value === 'normal' ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
                  >
                    Normal
                  </Text>
                </Pressable>
                <Pressable
                  style={tw`flex-1 flex-row items-center justify-center rounded-lg py-3 ${value === 'high' ? 'bg-error' : 'bg-neutral-200'}`}
                  onPress={() => onChange('high')}
                >
                  <AlertTriangleIcon
                    height={16}
                    style={tw`mr-1 ${value === 'high' ? ACTIVE_TEXT : INACTIVE_TEXT}`}
                    width={16}
                  />
                  <Text style={tw`${value === 'high' ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}>
                    High Priority
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
