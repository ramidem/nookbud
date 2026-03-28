import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { Alert, EmojiText } from '@/components/atoms';
import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import type { Child } from '@/database/schema';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { ChildService, EntryService, SpaceService, UserService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddEvent'>;

const ACTIVE_BG = 'bg-primary';
const INACTIVE_BG = 'bg-neutral-200';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';

const eventFormSchema = z.object({
  eventDate: z.date({ required_error: 'Date is required' }),
  eventTime: z.date().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  responsibleParent: z.string(),
  selectedChildId: z.string().nullable(),
  title: z.string().min(1, 'Title is required'),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export function AddEventScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  const {
    control,
    formState: { isValid },
    handleSubmit,
    setValue,
    watch,
  } = useForm<EventFormData>({
    defaultValues: {
      eventDate: undefined,
      eventTime: undefined,
      location: '',
      notes: '',
      responsibleParent: '',
      selectedChildId: null,
      title: '',
    },
    mode: 'onChange',
    resolver: zodResolver(eventFormSchema),
  });

  const responsibleParent = watch('responsibleParent');
  const selectedChildId = watch('selectedChildId');

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

        return;
      }

      const c = await ChildService.listBySpace(activeSpaceId);
      setChildren(c);

      const uid = UserService.getCurrentUserId();
      setUserId(uid);
      if (uid) setValue('responsibleParent', uid);
    }
    load();
  }, [activeSpaceId, isAllSpaces, navigation, setValue]);

  const canSave = isValid && hasPermission && !isAllSpaces;

  const onSubmit = async (data: EventFormData) => {
    if (!activeSpaceId || !userId) return;

    setIsLoading(true);
    try {
      const combined = new Date(data.eventDate);
      if (data.eventTime) {
        combined.setHours(data.eventTime.getHours(), data.eventTime.getMinutes(), 0, 0);
      } else {
        combined.setHours(0, 0, 0, 0);
      }

      await EntryService.create({
        childId: data.selectedChildId ?? undefined,
        content: {
          location: data.location?.trim() || undefined,
          notes: data.notes?.trim() || undefined,
          responsibleParent: data.responsibleParent || userId,
          startTime: combined.toISOString(),
          title: data.title.trim(),
        },
        spaceId: activeSpaceId,
        type: 'event',
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
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Add Event</Text>
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

        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Title *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                placeholder="Event title"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text)}
              />
            )}
          />
        </View>

        {/* Date & Time */}
        <View style={tw`mb-6 flex-row`}>
          <Controller
            control={control}
            name="eventDate"
            render={({ field: { onChange } }) => {
              const handleChange = (date: Date) => onChange(date);

              return (
                <DatePickerInput
                  isRequired
                  label="Date"
                  mode="date"
                  placeholder="Select date"
                  style={tw`mr-2 flex-1`}
                  value={watch('eventDate')}
                  onChange={handleChange}
                />
              );
            }}
          />
          <Controller
            control={control}
            name="eventTime"
            render={({ field: { onChange } }) => {
              const handleChange = (date: Date) => onChange(date);

              return (
                <DatePickerInput
                  label="Time"
                  mode="time"
                  placeholder="Select time"
                  style={tw`ml-2 flex-1`}
                  value={watch('eventTime')}
                  onChange={handleChange}
                />
              );
            }}
          />
        </View>

        {/* Location */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Location</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                placeholder="Where will this happen?"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text)}
              />
            )}
          />
        </View>

        {/* Responsible Parent */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Responsible Parent</Text>
          <Controller
            control={control}
            name="responsibleParent"
            render={({ field: { onChange } }) => (
              <View style={tw`flex-row gap-2`}>
                <Pressable
                  style={tw`flex-1 rounded-lg py-3 ${responsibleParent === userId ? ACTIVE_BG : INACTIVE_BG}`}
                  onPress={() => onChange(userId ?? '')}
                >
                  <Text
                    style={tw`text-center ${responsibleParent === userId ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
                  >
                    Me
                  </Text>
                </Pressable>
                <Pressable
                  style={tw`flex-1 rounded-lg py-3 ${responsibleParent !== userId ? ACTIVE_BG : INACTIVE_BG}`}
                  onPress={() => onChange('other')}
                >
                  <Text
                    style={tw`text-center ${responsibleParent !== userId ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
                  >
                    Co-Parent
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>

        {/* Child */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>For Child</Text>
            <Controller
              control={control}
              name="selectedChildId"
              render={({ field: { onChange } }) => (
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {children.map((child) => (
                    <Pressable
                      key={child.id}
                      style={tw`rounded-lg px-4 py-2 ${selectedChildId === child.id ? ACTIVE_BG : INACTIVE_BG}`}
                      onPress={() => onChange(selectedChildId === child.id ? null : child.id)}
                    >
                      <Text
                        style={tw`${selectedChildId === child.id ? ACTIVE_TEXT : INACTIVE_TEXT}`}
                      >
                        {child.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        )}

        {/* Notes */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Notes</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                multiline
                placeholder="Additional notes..."
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground h-24 rounded-xl border px-4 py-3`}
                textAlignVertical="top"
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text)}
              />
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
