import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Calendar, type DateData, type MarkedDates } from 'react-native-calendars';

import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import { CalendarIcon } from '@/icons';
import type { MainTabParamList } from '@/navigation/MainNavigator';
import {
  TimelineService,
  EntryService,
  AuditService,
  SpaceService,
  UserService,
  type TimelineEntry,
  type SpaceWithRole,
} from '@/services';
import { colors } from '@/tailwind';
import type { EventContent } from '@/types/entry-content.types';

type Props = BottomTabScreenProps<MainTabParamList, 'CalendarTab'>;

type EventStatus = 'completed' | 'missed' | 'pending';

const DATE_SUBSTRING_LENGTH = 10;
const END_OF_DAY_HOUR = 23;
const END_OF_DAY_MINUTE = 59;
const END_OF_DAY_SECOND = 59;

function getToday(): string {
  return new Date().toISOString().substring(0, DATE_SUBSTRING_LENGTH);
}

function getMonthRange(dateString: string): { dateFrom: Date; dateTo: Date } {
  const [year, month] = dateString.split('-').map(Number);
  const dateFrom = new Date(year, month - 1, 1);
  const dateTo = new Date(year, month, 0, END_OF_DAY_HOUR, END_OF_DAY_MINUTE, END_OF_DAY_SECOND);

  return { dateFrom, dateTo };
}

function getEventStatus(content: EventContent): EventStatus {
  return (content as EventContent & { status?: EventStatus }).status ?? 'pending';
}

function getStatusStyle(
  status: EventStatus,
  tw: ReturnType<typeof useTw>,
): { bg: object; text: object; label: string } {
  switch (status) {
    case 'completed':
      return { bg: tw`bg-success/15`, label: 'Completed', text: tw`text-success` };
    case 'missed':
      return { bg: tw`bg-error/15`, label: 'Missed', text: tw`text-error` };
    default:
      return { bg: tw`bg-neutral-200`, label: 'Pending', text: tw`text-foreground` };
  }
}

const MAX_EVENTS = 200;

export function CalendarScreen({ navigation }: Props) {
  const tw = useTw();
  const today = getToday();
  const { activeSpaceId, isAllSpaces } = useActiveSpace();

  const [selectedDate, setSelectedDate] = useState(today);
  const [monthEvents, setMonthEvents] = useState<TimelineEntry[]>([]);
  const [dayEvents, setDayEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allSpaces, setAllSpaces] = useState<SpaceWithRole[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [actionEntryId, setActionEntryId] = useState<string | null>(null);

  const allSpaceIds = allSpaces.map((s) => s.id);
  const canQuery = isAllSpaces ? allSpaceIds.length > 0 : !!activeSpaceId;

  useEffect(() => {
    const userId = UserService.getCurrentUserId();
    if (userId) setCurrentUserId(userId);
    if (isAllSpaces) {
      SpaceService.listSpaces().then(setAllSpaces);
    }
  }, [isAllSpaces]);

  useEffect(() => {
    if (canQuery) {
      loadMonthEvents(selectedDate);
    }
  }, [canQuery, loadMonthEvents, selectedDate]);

  const filterDayEvents = useCallback((events: TimelineEntry[], date: string) => {
    const filtered = events.filter((entry) => {
      const content = TimelineService.parseContent<EventContent>(entry);

      return content?.startTime?.startsWith(date);
    });
    setDayEvents(filtered);
  }, []);

  const loadMonthEvents = useCallback(
    async (refDate: string) => {
      if (!canQuery) return;

      setIsLoading(true);
      try {
        const { dateFrom, dateTo } = getMonthRange(refDate);
        const result = await TimelineService.query({
          dateFrom,
          dateTo,
          limit: MAX_EVENTS,
          ...(isAllSpaces ? { spaceIds: allSpaceIds } : { spaceId: activeSpaceId ?? '' }),
          types: ['event'],
        });

        setMonthEvents(result.entries);
        filterDayEvents(result.entries, refDate);
      } catch {
        // Silent fail — calendar load is non-critical
      } finally {
        setIsLoading(false);
      }
    },
    [canQuery, isAllSpaces, allSpaceIds, activeSpaceId, filterDayEvents],
  );

  const buildMarkedDates = useCallback((): MarkedDates => {
    const marks: MarkedDates = {};

    for (const entry of monthEvents) {
      const content = TimelineService.parseContent<EventContent>(entry);
      if (content?.startTime) {
        const day = content.startTime.substring(0, DATE_SUBSTRING_LENGTH);
        marks[day] = { dotColor: colors.primary, marked: true };
      }
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: colors.primary,
    };

    return marks;
  }, [monthEvents, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setActionEntryId(null);
    filterDayEvents(monthEvents, day.dateString);
  };

  const handleMonthChange = (month: DateData) => {
    const newDate = month.dateString;
    setSelectedDate(newDate);
    setActionEntryId(null);
    loadMonthEvents(newDate);
  };

  const handleEventPress = (entry: TimelineEntry) => {
    // Navigate to EntryDetail via TimelineTab
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('TimelineTab', {
        params: { entryId: entry.id },
        screen: 'EntryDetail',
      });
    }
  };

  const handleAddEvent = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('TimelineTab', {
        screen: 'AddEvent',
      });
    }
  };

  const handleMarkStatus = async (entry: TimelineEntry, newStatus: EventStatus) => {
    if (!currentUserId) return;

    try {
      const content = TimelineService.parseContent<EventContent>(entry);
      if (!content) return;

      await EntryService.update(entry.id, {
        content: { ...content, status: newStatus },
      });

      await AuditService.log({
        action: 'update',
        entityId: entry.id,
        entityType: 'entry',
        metadata: { newStatus, previousStatus: getEventStatus(content) },
        userId: currentUserId,
      });

      // Reload
      await loadMonthEvents(selectedDate);
    } catch {
      // Silent fail — status update is non-critical
    }
  };

  const handleLongPress = (entryId: string) => {
    setActionEntryId(actionEntryId === entryId ? null : entryId);
  };

  const renderEventItem = (entry: TimelineEntry) => {
    const content = TimelineService.parseContent<EventContent>(entry);
    if (!content) return null;

    const status = getEventStatus(content);
    const { bg, label, text: textStyle } = getStatusStyle(status, tw);
    const isYou = entry.createdBy === currentUserId;
    const showActions = actionEntryId === entry.id;

    return (
      <View key={entry.id}>
        <Pressable
          style={tw`bg-surface mb-2 rounded-xl p-4 shadow-sm`}
          onLongPress={() => handleLongPress(entry.id)}
          onPress={() => handleEventPress(entry)}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-1 pr-3`}>
              <Text style={tw`text-foreground text-base font-semibold`}>{content.title}</Text>
              <Text style={tw`text-subtitle mt-1 text-sm`}>
                {isYou ? 'You' : 'Partner'} {content.location ? `\u00B7 ${content.location}` : ''}
              </Text>
              {content.startTime && (
                <Text style={tw`text-placeholder mt-0.5 text-xs`}>
                  {new Date(content.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
            <View style={[tw`rounded-full px-3 py-1`, bg]}>
              <Text style={[tw`text-xs font-medium`, textStyle]}>{label}</Text>
            </View>
          </View>
        </Pressable>

        {showActions && (
          <View style={tw`mb-3 flex-row gap-2 px-2`}>
            <Pressable
              style={tw`bg-success flex-1 rounded-lg py-3`}
              onPress={() => handleMarkStatus(entry, 'completed')}
            >
              <Text style={tw`text-center text-sm font-semibold text-white`}>Mark Completed</Text>
            </Pressable>
            <Pressable
              style={tw`bg-error flex-1 rounded-lg py-3`}
              onPress={() => handleMarkStatus(entry, 'missed')}
            >
              <Text style={tw`text-center text-sm font-semibold text-white`}>Mark Missed</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={tw`bg-background flex-1`}>
      {/* Header */}
      <View style={tw`border-divider bg-surface border-b px-4 pb-4 pt-14`}>
        <Text style={tw`text-foreground font-serif-bold text-2xl`}>Calendar</Text>
      </View>

      {/* Calendar */}
      <Calendar
        markedDates={buildMarkedDates()}
        theme={{
          arrowColor: colors.primary,
          dotColor: colors.primary,
          monthTextColor: colors.foreground,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.white,
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textMonthFontWeight: '600',
          todayTextColor: colors.accent,
        }}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
      />

      {/* Day Events */}
      <View style={tw`flex-1 px-4 pt-4`}>
        <Text style={tw`text-subtitle mb-3 text-sm font-medium`}>
          {selectedDate === today ? 'Today' : selectedDate}
        </Text>

        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : dayEvents.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <CalendarIcon height={40} style={tw`text-placeholder mb-2`} width={40} />
            <Text style={tw`text-subtitle`}>No events for this day</Text>
          </View>
        ) : (
          <View>{dayEvents.map(renderEventItem)}</View>
        )}
      </View>

      {/* FAB */}
      <Pressable
        style={tw`bg-primary absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg`}
        onPress={handleAddEvent}
      >
        <Text style={tw`text-2xl font-light text-white`}>+</Text>
      </Pressable>
    </View>
  );
}
