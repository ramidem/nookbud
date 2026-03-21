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
import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import type { Child } from '@/database/schema';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { EntryService, ChildService, UserService, SpaceService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddEvent'>;

const ACTIVE_BG = 'bg-primary';
const INACTIVE_BG = 'bg-neutral-200';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';

export function AddEventScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [responsibleParent, setResponsibleParent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

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
      if (uid) setResponsibleParent(uid);
    }
    load();
  }, [activeSpaceId, isAllSpaces, navigation]);

  const canSave =
    title.trim().length > 0 && eventDate !== undefined && hasPermission && !isAllSpaces;

  const handleSave = async () => {
    if (!canSave || !activeSpaceId || !userId || !eventDate) return;

    setIsLoading(true);
    try {
      // Build ISO datetime from Date objects
      const combined = new Date(eventDate);
      if (eventTime) {
        combined.setHours(eventTime.getHours(), eventTime.getMinutes(), 0, 0);
      } else {
        combined.setHours(0, 0, 0, 0);
      }
      const startTime = combined.toISOString();

      await EntryService.create({
        childId: selectedChildId ?? undefined,
        content: {
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
          responsibleParent: responsibleParent || userId,
          startTime,
          title: title.trim(),
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
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Add Event</Text>
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

        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Title *</Text>
          <TextInput
            placeholder="Event title"
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date & Time */}
        <View style={tw`mb-6 flex-row`}>
          <DatePickerInput
            isRequired
            label="Date"
            mode="date"
            placeholder="Select date"
            style={tw`mr-2 flex-1`}
            value={eventDate}
            onChange={setEventDate}
          />
          <DatePickerInput
            label="Time"
            mode="time"
            placeholder="Select time"
            style={tw`ml-2 flex-1`}
            value={eventTime}
            onChange={setEventTime}
          />
        </View>

        {/* Location */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Location</Text>
          <TextInput
            placeholder="Where will this happen?"
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Responsible Parent */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Responsible Parent</Text>
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 rounded-lg py-3 ${responsibleParent === userId ? ACTIVE_BG : INACTIVE_BG}`}
              onPress={() => setResponsibleParent(userId ?? '')}
            >
              <Text
                style={tw`text-center ${responsibleParent === userId ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
              >
                Me
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-lg py-3 ${responsibleParent !== userId ? ACTIVE_BG : INACTIVE_BG}`}
              onPress={() => setResponsibleParent('other')}
            >
              <Text
                style={tw`text-center ${responsibleParent !== userId ? ACTIVE_TEXT : INACTIVE_TEXT} font-medium`}
              >
                Co-Parent
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Child */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>For Child</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`rounded-lg px-4 py-2 ${selectedChildId === child.id ? ACTIVE_BG : INACTIVE_BG}`}
                  onPress={() => setSelectedChildId(selectedChildId === child.id ? null : child.id)}
                >
                  <Text style={tw`${selectedChildId === child.id ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Notes</Text>
          <TextInput
            multiline
            placeholder="Additional notes..."
            placeholderTextColor={colors.placeholder}
            style={tw`border-divider text-foreground h-24 rounded-xl border px-4 py-3`}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
