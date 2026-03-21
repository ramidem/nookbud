import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import type { EntryType } from '@/database/schema';
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

type Props = {
  entry: TimelineEntry;
  onPress: (entry: TimelineEntry) => void;
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
  acknowledged: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
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

export function EntryCard({ entry, onPress }: Props) {
  const tw = useTw();

  const title = getEntryTitle(entry);
  const subtitle = getEntrySubtitle(entry);
  const statusColor = entry.acknowledgmentStatus ? STATUS_COLORS[entry.acknowledgmentStatus] : null;
  const Icon = TYPE_ICONS[entry.type];

  return (
    <Pressable
      style={tw`mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm`}
      onPress={() => onPress(entry)}
    >
      <View style={tw`flex-row items-start`}>
        {/* Icon */}
        <View style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100`}>
          <Icon height={ENTRY_ICON_SIZE} style={tw`text-gray-600`} width={ENTRY_ICON_SIZE} />
        </View>

        {/* Content */}
        <View style={tw`flex-1`}>
          <View style={tw`mb-1 flex-row items-center`}>
            <Text style={tw`text-xs uppercase tracking-wide text-gray-500`}>
              {TYPE_LABELS[entry.type]}
            </Text>
            <Text style={tw`mx-2 text-gray-300`}>•</Text>
            <Text style={tw`text-xs text-gray-500`}>{formatDate(entry.createdAt)}</Text>
          </View>

          <Text numberOfLines={2} style={tw`mb-1 text-base font-medium text-gray-900`}>
            {title}
          </Text>

          {subtitle && (
            <View style={tw`flex-row items-center`}>
              {entry.type === 'communication' && subtitle === 'High priority' && (
                <AlertTriangleIcon height={12} style={tw`mr-1 text-amber-600`} width={12} />
              )}
              <Text style={tw`text-sm text-gray-600`}>{subtitle}</Text>
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
        <View style={tw`mt-2 border-t border-gray-100 pt-2`}>
          <Text style={tw`text-xs text-gray-400`}>
            v{entry.currentVersion.versionNumber} • Edited
          </Text>
        </View>
      )}
    </Pressable>
  );
}
