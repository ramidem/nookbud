import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import { useTw } from '@/hooks/useTw';
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  HandshakeIcon,
  MessageCircleIcon,
  PaperclipIcon,
  WalletIcon,
} from '@/icons';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddEntryPicker'>;

const PICKER_ICON_SIZE = 24;

const ENTRY_OPTIONS: Array<{
  description: string;
  Icon: React.FC<SvgProps>;
  screen: keyof TimelineStackParamList;
  title: string;
  type: string;
}> = [
  {
    Icon: WalletIcon,
    description: 'Track shared costs and reimbursements',
    screen: 'AddExpense',
    title: 'Expense',
    type: 'expense',
  },
  {
    Icon: CalendarDaysIcon,
    description: 'Schedule pickups, activities, appointments',
    screen: 'AddEvent',
    title: 'Event',
    type: 'event',
  },
  {
    Icon: HandshakeIcon,
    description: 'Document decisions made together',
    screen: 'AddAgreement',
    title: 'Agreement',
    type: 'agreement',
  },
  {
    Icon: MessageCircleIcon,
    description: 'Send a documented message',
    screen: 'AddCommunication',
    title: 'Communication',
    type: 'communication',
  },
  {
    Icon: PaperclipIcon,
    description: 'Upload medical, school, or legal files',
    screen: 'AddUpload',
    title: 'Document',
    type: 'upload',
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
            onPress={() => navigation.navigate(option.screen as never)}
          >
            <View style={tw`mr-4 h-12 w-12 items-center justify-center rounded-full bg-white`}>
              <option.Icon
                height={PICKER_ICON_SIZE}
                style={tw`text-gray-700`}
                width={PICKER_ICON_SIZE}
              />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-medium text-gray-900`}>{option.title}</Text>
              <Text style={tw`text-sm text-gray-500`}>{option.description}</Text>
            </View>
            <ChevronRightIcon height={20} style={tw`text-gray-400`} width={20} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
