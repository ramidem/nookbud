import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTw } from '@/hooks/useTw';
import type { TimelineEntry } from '@/services';
import type { EntryType } from '@/database/schema';

type Props = {
  entry: TimelineEntry;
  onPress: (entry: TimelineEntry) => void;
};

const TYPE_ICONS: Record<EntryType, string> = {
  expense: '💰',
  event: '📅',
  agreement: '🤝',
  communication: '💬',
  upload: '📎',
};

const TYPE_LABELS: Record<EntryType, string> = {
  expense: 'Expense',
  event: 'Event',
  agreement: 'Agreement',
  communication: 'Communication',
  upload: 'Document',
};

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  acknowledged: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
};

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
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
      case 'expense':
        const amount = content.amount / 100; // Convert from minor units
        const currency = content.currency || 'USD';
        return `${currency} ${amount.toFixed(2)}`;
      case 'event':
        if (content.startTime) {
          const date = new Date(content.startTime);
          return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        }
        return null;
      case 'communication':
        return content.importance === 'high' ? '⚠️ High priority' : null;
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
  const statusColor = entry.acknowledgmentStatus
    ? STATUS_COLORS[entry.acknowledgmentStatus]
    : null;

  return (
    <Pressable
      style={tw`bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100`}
      onPress={() => onPress(entry)}
    >
      <View style={tw`flex-row items-start`}>
        {/* Icon */}
        <View style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3`}>
          <Text style={tw`text-xl`}>{TYPE_ICONS[entry.type]}</Text>
        </View>

        {/* Content */}
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-xs text-gray-500 uppercase tracking-wide`}>
              {TYPE_LABELS[entry.type]}
            </Text>
            <Text style={tw`text-gray-300 mx-2`}>•</Text>
            <Text style={tw`text-xs text-gray-500`}>
              {formatDate(entry.createdAt)}
            </Text>
          </View>

          <Text style={tw`text-base font-medium text-gray-900 mb-1`} numberOfLines={2}>
            {title}
          </Text>

          {subtitle && (
            <Text style={tw`text-sm text-gray-600`}>{subtitle}</Text>
          )}
        </View>

        {/* Status badge */}
        {statusColor && (
          <View style={tw`${statusColor.split(' ')[0]} px-2 py-1 rounded-full ml-2`}>
            <Text style={tw`text-xs font-medium ${statusColor.split(' ')[1]}`}>
              {entry.acknowledgmentStatus === 'pending' && 'Pending'}
              {entry.acknowledgmentStatus === 'acknowledged' && '✓'}
              {entry.acknowledgmentStatus === 'disputed' && '!'}
            </Text>
          </View>
        )}
      </View>

      {/* Version indicator */}
      {entry.currentVersion && entry.currentVersion.versionNumber > 1 && (
        <View style={tw`mt-2 pt-2 border-t border-gray-100`}>
          <Text style={tw`text-xs text-gray-400`}>
            v{entry.currentVersion.versionNumber} • Edited
          </Text>
        </View>
      )}
    </Pressable>
  );
}
