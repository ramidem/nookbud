import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Calendar, type DateData, type MarkedDates } from 'react-native-calendars';

import { useTw } from '@/hooks/useTw';
import type { MainTabParamList } from '@/navigation/MainNavigator';
import {
  TimelineService,
  EntryService,
  AuditService,
  RelationshipService,
  UserService,
  type TimelineEntry,
} from '@/services';
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
      return { bg: tw`bg-green-100`, label: 'Completed', text: tw`text-green-800` };
    case 'missed':
      return { bg: tw`bg-red-100`, label: 'Missed', text: tw`text-red-800` };
    default:
      return { bg: tw`bg-gray-100`, label: 'Pending', text: tw`text-gray-800` };
  }
}

const MAX_EVENTS = 200;

export function CalendarScreen({ navigation }: Props) {
  const tw = useTw();
  const today = getToday();

  const [selectedDate, setSelectedDate] = useState(today);
  const [monthEvents, setMonthEvents] = useState<TimelineEntry[]>([]);
  const [dayEvents, setDayEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [actionEntryId, setActionEntryId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const rel = await RelationshipService.getCurrentRelationship();
      const userId = UserService.getCurrentUserId();
      if (rel) setRelationshipId(rel.id);
      if (userId) setCurrentUserId(userId);
    }
    init();
  }, []);

  useEffect(() => {
    if (relationshipId) {
      loadMonthEvents(selectedDate);
    }
  }, [relationshipId, loadMonthEvents, selectedDate]);

  const filterDayEvents = useCallback((events: TimelineEntry[], date: string) => {
    const filtered = events.filter((entry) => {
      const content = TimelineService.parseContent<EventContent>(entry);

      return content?.startTime?.startsWith(date);
    });
    setDayEvents(filtered);
  }, []);

  const loadMonthEvents = useCallback(
    async (refDate: string) => {
      if (!relationshipId) return;

      setIsLoading(true);
      try {
        const { dateFrom, dateTo } = getMonthRange(refDate);
        const result = await TimelineService.query({
          dateFrom,
          dateTo,
          limit: MAX_EVENTS,
          relationshipId,
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
    [relationshipId, filterDayEvents],
  );

  const buildMarkedDates = useCallback((): MarkedDates => {
    const marks: MarkedDates = {};

    for (const entry of monthEvents) {
      const content = TimelineService.parseContent<EventContent>(entry);
      if (content?.startTime) {
        const day = content.startTime.substring(0, DATE_SUBSTRING_LENGTH);
        marks[day] = { dotColor: '#6F8F7B', marked: true };
      }
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: '#6F8F7B',
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
          style={tw`mb-2 rounded-xl bg-white p-4 shadow-sm`}
          onLongPress={() => handleLongPress(entry.id)}
          onPress={() => handleEventPress(entry)}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-1 pr-3`}>
              <Text style={tw`text-base font-semibold text-gray-900`}>{content.title}</Text>
              <Text style={tw`mt-1 text-sm text-gray-500`}>
                {isYou ? 'You' : 'Partner'} {content.location ? `\u00B7 ${content.location}` : ''}
              </Text>
              {content.startTime && (
                <Text style={tw`mt-0.5 text-xs text-gray-400`}>
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
              style={tw`flex-1 rounded-lg bg-green-600 py-3`}
              onPress={() => handleMarkStatus(entry, 'completed')}
            >
              <Text style={tw`text-center text-sm font-semibold text-white`}>Mark Completed</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-lg bg-red-500 py-3`}
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
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`border-b border-gray-100 bg-white px-4 pb-4 pt-14`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Calendar</Text>
      </View>

      {/* Calendar */}
      <Calendar
        markedDates={buildMarkedDates()}
        theme={{
          arrowColor: '#6F8F7B',
          dotColor: '#6F8F7B',
          monthTextColor: '#2F2F2F',
          selectedDayBackgroundColor: '#6F8F7B',
          selectedDayTextColor: '#ffffff',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textMonthFontWeight: '600',
          todayTextColor: '#C97C5D',
        }}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
      />

      {/* Day Events */}
      <View style={tw`flex-1 px-4 pt-4`}>
        <Text style={tw`mb-3 text-sm font-medium text-gray-500`}>
          {selectedDate === today ? 'Today' : selectedDate}
        </Text>

        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color="#6F8F7B" size="small" />
          </View>
        ) : dayEvents.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Text aria-label="calendar" role="img" style={tw`mb-1 text-4xl`}>
              📅
            </Text>
            <Text style={tw`text-gray-500`}>No events for this day</Text>
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
