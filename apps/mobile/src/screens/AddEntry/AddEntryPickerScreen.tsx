import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { useTw } from '@/hooks/useTw';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddEntryPicker'>;

const ENTRY_OPTIONS = [
  {
    description: 'Track shared costs and reimbursements',
    icon: '💰',
    screen: 'AddExpense' as const,
    title: 'Expense',
    type: 'expense' as const,
  },
  {
    description: 'Schedule pickups, activities, appointments',
    icon: '📅',
    screen: 'AddEvent' as const,
    title: 'Event',
    type: 'event' as const,
  },
  {
    description: 'Document decisions made together',
    icon: '🤝',
    screen: 'AddAgreement' as const,
    title: 'Agreement',
    type: 'agreement' as const,
  },
  {
    description: 'Send a documented message',
    icon: '💬',
    screen: 'AddCommunication' as const,
    title: 'Communication',
    type: 'communication' as const,
  },
  {
    description: 'Upload medical, school, or legal files',
    icon: '📎',
    screen: 'AddUpload' as const,
    title: 'Document',
    type: 'upload' as const,
  },
];

export function AddEntryPickerScreen({ navigation }: Props) {
  const tw = useTw();

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pb-4 pt-14`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-base text-blue-600`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>New Entry</Text>
        <View style={tw`w-12`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text style={tw`mb-6 text-gray-600`}>What would you like to record?</Text>

        {ENTRY_OPTIONS.map((option) => (
          <Pressable
            key={option.type}
            style={tw`mb-3 flex-row items-center rounded-xl bg-gray-50 p-4`}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View style={tw`mr-4 h-12 w-12 items-center justify-center rounded-full bg-white`}>
              <Text style={tw`text-2xl`}>{option.icon}</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-medium text-gray-900`}>{option.title}</Text>
              <Text style={tw`text-sm text-gray-500`}>{option.description}</Text>
            </View>
            <Text style={tw`text-xl text-gray-400`}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
