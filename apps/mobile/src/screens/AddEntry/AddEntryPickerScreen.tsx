import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import { Alert } from '@/components/atoms';
import { useActiveSpace } from '@/hooks';
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
import { SpaceService } from '@/services';

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
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [canCreate, setCanCreate] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (isAllSpaces || !activeSpaceId) {
        setCanCreate(false);

        return;
      }

      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'lawyer' || role === 'viewer') {
        setCanCreate(false);
      }
    }
    checkPermission();
  }, [activeSpaceId, isAllSpaces]);

  const handleNavigate = (screen: keyof TimelineStackParamList) => {
    if (isAllSpaces || !activeSpaceId) {
      Alert.error({
        message:
          'Please select a Space first. Tap the Space switcher at the top to choose which Space to log this entry to.',
        title: 'No Space Selected',
      });

      return;
    }

    if (!canCreate) {
      Alert.error({
        message: 'Your role in this Space does not allow creating entries.',
        title: 'Access Denied',
      });

      return;
    }

    navigation.navigate(screen as never);
  };

  return (
    <View style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pb-4 pt-14`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>New Entry</Text>
        <View style={tw`w-12`} />
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

        <Text style={tw`text-subtitle mb-6`}>What would you like to record?</Text>

        {ENTRY_OPTIONS.map((option) => (
          <Pressable
            key={option.type}
            style={tw`bg-background mb-3 flex-row items-center rounded-xl p-4`}
            onPress={() => handleNavigate(option.screen)}
          >
            <View style={tw`bg-surface mr-4 h-12 w-12 items-center justify-center rounded-full`}>
              <option.Icon
                height={PICKER_ICON_SIZE}
                style={tw`text-foreground`}
                width={PICKER_ICON_SIZE}
              />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-foreground text-base font-medium`}>{option.title}</Text>
              <Text style={tw`text-subtitle text-sm`}>{option.description}</Text>
            </View>
            <ChevronRightIcon height={20} style={tw`text-placeholder`} width={20} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
