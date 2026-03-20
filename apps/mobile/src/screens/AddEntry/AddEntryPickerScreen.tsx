import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTw } from '@/hooks/useTw';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddEntryPicker'>;

const ENTRY_OPTIONS = [
  {
    type: 'expense' as const,
    icon: '💰',
    title: 'Expense',
    description: 'Track shared costs and reimbursements',
    screen: 'AddExpense' as const,
  },
  {
    type: 'event' as const,
    icon: '📅',
    title: 'Event',
    description: 'Schedule pickups, activities, appointments',
    screen: 'AddEvent' as const,
  },
  {
    type: 'agreement' as const,
    icon: '🤝',
    title: 'Agreement',
    description: 'Document decisions made together',
    screen: 'AddAgreement' as const,
  },
  {
    type: 'communication' as const,
    icon: '💬',
    title: 'Communication',
    description: 'Send a documented message',
    screen: 'AddCommunication' as const,
  },
  {
    type: 'upload' as const,
    icon: '📎',
    title: 'Document',
    description: 'Upload medical, school, or legal files',
    screen: 'AddUpload' as const,
  },
];

export function AddEntryPickerScreen({ navigation }: Props) {
  const tw = useTw();

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-14 pb-4`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-blue-600 text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>New Entry</Text>
        <View style={tw`w-12`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text style={tw`text-gray-600 mb-6`}>
          What would you like to record?
        </Text>

        {ENTRY_OPTIONS.map((option) => (
          <Pressable
            key={option.type}
            style={tw`flex-row items-center bg-gray-50 rounded-xl p-4 mb-3`}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View style={tw`w-12 h-12 rounded-full bg-white items-center justify-center mr-4`}>
              <Text style={tw`text-2xl`}>{option.icon}</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-medium text-gray-900`}>
                {option.title}
              </Text>
              <Text style={tw`text-sm text-gray-500`}>{option.description}</Text>
            </View>
            <Text style={tw`text-gray-400 text-xl`}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
