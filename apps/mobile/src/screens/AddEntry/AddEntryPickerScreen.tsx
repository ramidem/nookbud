import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import { Alert, EmojiText } from '@/components/atoms';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import {
  ArchiveIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  HandshakeIcon,
  MessageCircleIcon,
  PaperclipIcon,
  WalletIcon,
} from '@/icons';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { SpaceService } from '@/services';

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddEntryPicker'>;

const PICKER_ICON_SIZE = 24;

const ENTRY_OPTIONS: Array<{
  description: string;
  Icon: React.FC<SvgProps>;
  screen: keyof ActivityStackParamList;
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
  {
    Icon: CheckCircleIcon,
    description: 'Assign a task to a co-parent or yourself',
    screen: 'AddTask',
    title: 'Task',
    type: 'task',
  },
];

export function AddEntryPickerScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [canCreate, setCanCreate] = useState(true);

  const isArchived = !!activeSpace?.archivedAt;

  useEffect(() => {
    async function checkPermission() {
      if (isAllSpaces || !activeSpaceId) {
        setCanCreate(false);

        return;
      }

      if (activeSpace?.archivedAt) {
        setCanCreate(false);

        return;
      }

      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'viewer') {
        setCanCreate(false);
      }
    }
    checkPermission();
  }, [activeSpaceId, isAllSpaces, activeSpace]);

  const handleNavigate = (screen: keyof ActivityStackParamList) => {
    if (isAllSpaces || !activeSpaceId) {
      Alert.error({
        message:
          'Please select a Space first. Tap the Space switcher at the top to choose which Space to log this entry to.',
        title: 'No Space Selected',
      });

      return;
    }

    if (isArchived) {
      Alert.error({
        message: 'This Space is archived. You cannot add new entries to an archived Space.',
        title: 'Space Archived',
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
          <View style={tw`mb-4 self-start rounded-lg bg-neutral-200 px-3 py-1.5`}>
            <Text style={tw`text-foreground text-sm`}>
              <EmojiText>{activeSpace.emoji}</EmojiText> {activeSpace.name}
            </Text>
          </View>
        )}

        {isArchived && (
          <View style={tw`bg-warning/15 mb-4 flex-row items-center rounded-xl px-4 py-3`}>
            <ArchiveIcon height={16} style={tw`text-warning mr-2`} width={16} />
            <Text style={tw`text-foreground flex-1 text-sm`}>
              This Space is archived. You cannot add new entries.
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
