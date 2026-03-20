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
import {
  EntryService,
  RelationshipService,
  ChildService,
  UserService,
} from '@/services';
import type { Child, User } from '@/database/schema';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddEvent'>;

export function AddEventScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [time, setTime] = useState(''); // HH:MM
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

  const canSave = title.trim().length > 0 && date.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || !relationshipId || !userId) return;

    setIsLoading(true);
    try {
      // Build ISO datetime
      const startTime = time
        ? new Date(`${date}T${time}:00`).toISOString()
        : new Date(`${date}T00:00:00`).toISOString();

      await EntryService.create({
        relationshipId,
        type: 'event',
        childId: selectedChildId ?? undefined,
        content: {
          title: title.trim(),
          startTime,
          location: location.trim() || undefined,
          responsibleParent: responsibleParent || userId,
          notes: notes.trim() || undefined,
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
        <Text style={tw`text-lg font-semibold text-gray-900`}>Add Event</Text>
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
        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Title *</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            placeholder="Event title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date & Time */}
        <View style={tw`flex-row mb-6`}>
          <View style={tw`flex-1 mr-2`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Date *</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-3`}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View style={tw`flex-1 ml-2`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Time</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-3`}
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Location */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Location</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            placeholder="Where will this happen?"
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Responsible Parent */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Responsible Parent</Text>
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 py-3 rounded-lg ${responsibleParent === userId ? 'bg-blue-600' : 'bg-gray-100'}`}
              onPress={() => setResponsibleParent(userId ?? '')}
            >
              <Text style={tw`text-center ${responsibleParent === userId ? 'text-white' : 'text-gray-700'} font-medium`}>
                Me
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 py-3 rounded-lg ${responsibleParent !== userId ? 'bg-blue-600' : 'bg-gray-100'}`}
              onPress={() => setResponsibleParent('other')}
            >
              <Text style={tw`text-center ${responsibleParent !== userId ? 'text-white' : 'text-gray-700'} font-medium`}>
                Co-Parent
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Child */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>For Child</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`px-4 py-2 rounded-lg ${selectedChildId === child.id ? 'bg-blue-600' : 'bg-gray-100'}`}
                  onPress={() => setSelectedChildId(selectedChildId === child.id ? null : child.id)}
                >
                  <Text style={tw`${selectedChildId === child.id ? 'text-white' : 'text-gray-700'}`}>
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Notes</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 h-24`}
            placeholder="Additional notes..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
