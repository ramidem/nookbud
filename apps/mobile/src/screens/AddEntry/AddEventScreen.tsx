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

import { DatePickerInput } from '@/components/molecules/DatePickerInput';
import type { Child } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, RelationshipService, ChildService, UserService } from '@/services';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddEvent'>;

const ACTIVE_BG = 'bg-blue-600';
const INACTIVE_BG = 'bg-gray-100';
const ACTIVE_TEXT = ACTIVE_TEXT;
const INACTIVE_TEXT = INACTIVE_TEXT;

export function AddEventScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) {
        setRelationshipId(rel.id);
        const c = await ChildService.listByRelationship(rel.id);
        setChildren(c);
      }
      const uid = UserService.getCurrentUserId();
      setUserId(uid);
      if (uid) setResponsibleParent(uid);
    }
    load();
  }, []);

  const canSave = title.trim().length > 0 && eventDate !== undefined;

  const handleSave = async () => {
    if (!canSave || !relationshipId || !userId || !eventDate) return;

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
        relationshipId,
        type: 'event',
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
        <Text style={tw`text-lg font-semibold text-gray-900`}>Add Event</Text>
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
        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Title *</Text>
          <TextInput
            placeholder="Event title"
            placeholderTextColor="#9CA3AF"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
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
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Location</Text>
          <TextInput
            placeholder="Where will this happen?"
            placeholderTextColor="#9CA3AF"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Responsible Parent */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Responsible Parent</Text>
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
            <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>For Child</Text>
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
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Notes</Text>
          <TextInput
            multiline
            placeholder="Additional notes..."
            placeholderTextColor="#9CA3AF"
            style={tw`h-24 rounded-xl border border-gray-300 px-4 py-3`}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
