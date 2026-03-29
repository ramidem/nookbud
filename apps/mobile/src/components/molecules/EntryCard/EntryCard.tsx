import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import { EmojiText } from '@/components';
import { useTw } from '@/hooks/useTw';
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  HandshakeIcon,
  MessageCircleIcon,
  PaperclipIcon,
  WalletIcon,
} from '@/icons';
import type { TimelineEntry } from '@/services';
import type { EntryType } from '@/types';

export type SpaceInfo = {
  id: string;
  emoji: string;
  color: string;
  name: string;
};

type Props = {
  entry: TimelineEntry;
  onPress: (entry: TimelineEntry) => void;
  spaceInfo?: SpaceInfo | null;
  onSpacePress?: (spaceInfo: SpaceInfo) => void;
};

const TYPE_ICONS: Record<EntryType, React.FC<SvgProps>> = {
  agreement: HandshakeIcon,
  communication: MessageCircleIcon,
  event: CalendarDaysIcon,
  expense: WalletIcon,
  upload: PaperclipIcon,
};

const TYPE_LABELS: Record<EntryType, string> = {
  agreement: 'Agreement',
  communication: 'Communication',
  event: 'Event',
  expense: 'Expense',
  upload: 'Document',
};

const STATUS_COLORS = {
  acknowledged: 'bg-success/15 text-success',
  disputed: 'bg-error/15 text-error',
  pending: 'bg-warning/15 text-warning',
};

const MS_PER_DAY = 86400000;
const DAYS_IN_WEEK = 7;
const ENTRY_ICON_SIZE = 20;

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < DAYS_IN_WEEK) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function getEntryTitle(entry: TimelineEntry): string {
  if (!entry.currentVersion) return 'No content';

  try {
    const content = JSON.parse(entry.currentVersion.contentJson);

    switch (entry.type) {
      case 'expense':
        return content.description || 'Expense';
      case 'event':
        return content.title || 'Event';
      case 'agreement':
        return content.title || 'Agreement';
      case 'communication':
        return content.subject || 'Message';
      case 'upload':
        return content.title || 'Document';
      default:
        return 'Entry';
    }
  } catch {
    return 'Entry';
  }
}

function getEntrySubtitle(entry: TimelineEntry): string | null {
  if (!entry.currentVersion) return null;

  try {
    const content = JSON.parse(entry.currentVersion.contentJson);

    switch (entry.type) {
      case 'expense': {
        const amount = content.amount / 100; // Convert from minor units
        const currency = content.currency || 'USD';

        return `${currency} ${amount.toFixed(2)}`;
      }
      case 'event':
        if (content.startTime) {
          const date = new Date(content.startTime);

          return date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            weekday: 'short',
          });
        }

        return null;
      case 'communication':
        return content.importance === 'high' ? 'High priority' : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function EntryCard({ entry, onPress, onSpacePress, spaceInfo }: Props) {
  const tw = useTw();

  const title = getEntryTitle(entry);
  const subtitle = getEntrySubtitle(entry);
  const statusColor = entry.acknowledgmentStatus ? STATUS_COLORS[entry.acknowledgmentStatus] : null;
  const Icon = TYPE_ICONS[entry.type];

  const spacePill = spaceInfo ? (
    <Pressable
      style={[
        tw`flex-row items-center rounded-full px-2 py-0.5`,
        { backgroundColor: `${spaceInfo.color}20` },
      ]}
      onPress={() => onSpacePress?.(spaceInfo)}
    >
      <EmojiText style={tw`mr-1 text-xs`}>{spaceInfo.emoji}</EmojiText>
      <Text
        numberOfLines={1}
        style={[tw`text-xs font-medium`, { color: spaceInfo.color, maxWidth: 80 }]}
      >
        {spaceInfo.name}
      </Text>
    </Pressable>
  ) : null;

  return (
    <Pressable
      style={tw`border-divider bg-surface mb-3 rounded-xl border p-4 shadow-sm`}
      onPress={() => onPress(entry)}
    >
      {/* Space indicator pill — top right */}
      {spacePill && <View style={tw`mb-2 flex-row justify-end`}>{spacePill}</View>}

      <View style={tw`flex-row items-start`}>
        {/* Icon */}
        <View style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}>
          <Icon height={ENTRY_ICON_SIZE} style={tw`text-subtitle`} width={ENTRY_ICON_SIZE} />
        </View>

        {/* Content */}
        <View style={tw`flex-1`}>
          <View style={tw`mb-1 flex-row items-center`}>
            <Text style={tw`text-subtitle text-xs uppercase tracking-wide`}>
              {TYPE_LABELS[entry.type]}
            </Text>
            <Text style={tw`text-placeholder mx-2`}>•</Text>
            <Text style={tw`text-subtitle text-xs`}>{formatDate(entry.createdAt)}</Text>
          </View>

          <Text numberOfLines={2} style={tw`text-foreground mb-1 text-base font-medium`}>
            {title}
          </Text>

          {subtitle && (
            <View style={tw`flex-row items-center`}>
              {entry.type === 'communication' && subtitle === 'High priority' && (
                <AlertTriangleIcon height={12} style={tw`text-warning mr-1`} width={12} />
              )}
              <Text style={tw`text-subtitle text-sm`}>{subtitle}</Text>
            </View>
          )}
        </View>

        {/* Status badge */}
        {statusColor && (
          <View style={tw`${statusColor.split(' ')[0]} ml-2 rounded-full px-2 py-1`}>
            <Text style={tw`text-xs font-medium ${statusColor.split(' ')[1]}`}>
              {entry.acknowledgmentStatus === 'pending' && 'Pending'}
              {entry.acknowledgmentStatus === 'acknowledged' && 'Ack'}
              {entry.acknowledgmentStatus === 'disputed' && '!'}
            </Text>
          </View>
        )}
      </View>

      {/* Version indicator */}
      {entry.currentVersion && entry.currentVersion.versionNumber > 1 && (
        <View style={tw`border-background mt-2 border-t pt-2`}>
          <Text style={tw`text-placeholder text-xs`}>
            v{entry.currentVersion.versionNumber} • Edited
          </Text>
        </View>
      )}
    </Pressable>
  );
}
