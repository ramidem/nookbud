import { LegendList } from '@legendapp/list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, RefreshControl, ActivityIndicator } from 'react-native';

import { TimelineFilters, type FilterState } from './TimelineFilters';

import { EntryCard } from '@/components/molecules/EntryCard';
import { useTw } from '@/hooks/useTw';
import { PencilLineIcon } from '@/icons';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import {
  TimelineService,
  RelationshipService,
  type TimelineEntry,
  type TimelineQueryParams,
} from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<TimelineStackParamList, 'Timeline'>;

const PAGE_SIZE = 20;

export function TimelineScreen({ navigation }: Props) {
  const tw = useTw();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    childIds: [],
    dateFrom: null,
    dateTo: null,
    types: [],
  });

  // Load relationship on mount
  useEffect(() => {
    async function loadRelationship() {
      const relationship = await RelationshipService.getCurrentRelationship();
      if (relationship) {
        setRelationshipId(relationship.id);
      }
    }
    loadRelationship();
  }, []);

  const buildQueryParams = useCallback(
    (offset = 0): TimelineQueryParams => ({
      childId: filters.childIds.length === 1 ? filters.childIds[0] : undefined,
      dateFrom: filters.dateFrom ?? undefined,
      dateTo: filters.dateTo ?? undefined,
      limit: PAGE_SIZE,
      offset,
      relationshipId: relationshipId ?? '',
      types: filters.types.length > 0 ? filters.types : undefined,
    }),
    [filters, relationshipId],
  );

  const loadEntries = useCallback(async () => {
    if (!relationshipId) return;

    setIsLoading(true);
    try {
      const result = await TimelineService.query(buildQueryParams(0));
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch {
      // Silent fail — entry load is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [relationshipId, buildQueryParams]);

  // Load entries when relationship or filters change
  useEffect(() => {
    if (relationshipId) {
      loadEntries();
    }
  }, [relationshipId, filters, loadEntries]);

  const handleRefresh = async () => {
    if (!relationshipId) return;

    setIsRefreshing(true);
    try {
      const result = await TimelineService.query(buildQueryParams(0));
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch {
      // Silent fail — refresh is non-critical
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!relationshipId || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const result = await TimelineService.query(buildQueryParams(entries.length));
      setEntries([...entries, ...result.entries]);
      setHasMore(result.hasMore);
    } catch {
      // Silent fail — load more is non-critical
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleEntryPress = useCallback(
    (entry: TimelineEntry) => {
      navigation.navigate('EntryDetail', { entryId: entry.id });
    },
    [navigation],
  );

  const handleAddEntry = () => {
    navigation.navigate('AddEntryPicker');
  };

  const hasActiveFilters =
    filters.childIds.length > 0 ||
    filters.types.length > 0 ||
    filters.dateFrom !== null ||
    filters.dateTo !== null;

  const renderItem = useCallback(
    ({ item }: { item: TimelineEntry }) => <EntryCard entry={item} onPress={handleEntryPress} />,
    [handleEntryPress],
  );

  if (isLoading) {
    return (
      <View style={tw`bg-background flex-1 items-center justify-center`}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={tw`bg-background flex-1`}>
      {/* Header */}
      <View style={tw`border-divider bg-surface border-b px-4 pb-4 pt-14`}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-foreground font-serif-bold text-2xl`}>Timeline</Text>
          <Pressable
            style={tw`${hasActiveFilters ? 'bg-primary/15' : 'bg-neutral-200'} rounded-lg px-3 py-2`}
            onPress={() => setShowFilters(true)}
          >
            <Text style={tw`${hasActiveFilters ? 'text-primary' : 'text-subtitle'} font-medium`}>
              {hasActiveFilters ? 'Filtered' : 'Filter'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Entry List */}
      {entries.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <PencilLineIcon height={48} style={tw`text-placeholder mb-4`} width={48} />
          <Text style={tw`text-foreground mb-2 text-xl font-medium`}>No entries yet</Text>
          <Text style={tw`text-subtitle mb-6 text-center`}>
            Start documenting by adding your first entry.
          </Text>
          <Pressable style={tw`bg-primary rounded-xl px-6 py-3`} onPress={handleAddEntry}>
            <Text style={tw`font-semibold text-white`}>Add Entry</Text>
          </Pressable>
        </View>
      ) : (
        <LegendList
          contentContainerStyle={tw`p-4`}
          data={entries}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={tw`py-4`}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* FAB */}
      {entries.length > 0 && (
        <Pressable
          style={tw`bg-primary absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg`}
          onPress={handleAddEntry}
        >
          <Text style={tw`text-2xl font-light text-white`}>+</Text>
        </Pressable>
      )}

      {/* Filters Modal */}
      <TimelineFilters
        filters={filters}
        relationshipId={relationshipId}
        visible={showFilters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setShowFilters(false);
        }}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}
