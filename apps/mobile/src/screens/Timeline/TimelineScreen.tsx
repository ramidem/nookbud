import { LegendList } from '@legendapp/list';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';

import { TimelineFilters, type FilterState } from './TimelineFilters';

import { Button } from '@/components';
import { EntryCard, type SpaceInfo } from '@/components/molecules/EntryCard';
import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import { PencilLineIcon } from '@/icons';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import type { ActivityTopTabParamList } from '@/navigation/ActivityTopTabs';
import {
  TimelineService,
  SpaceService,
  type SpaceWithRole,
  type TimelineEntry,
  type TimelineQueryParams,
} from '@/services';
import { colors } from '@/tailwind';

type Props = CompositeScreenProps<
  MaterialTopTabScreenProps<ActivityTopTabParamList, 'Timeline'>,
  NativeStackScreenProps<ActivityStackParamList>
>;

const PAGE_SIZE = 20;

export function TimelineScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpaceId, isAllSpaces, switchToSpace } = useActiveSpace();
  const [showFilters, setShowFilters] = useState(false);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [allSpaces, setAllSpaces] = useState<SpaceWithRole[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    childIds: [],
    dateFrom: null,
    dateTo: null,
    types: [],
  });

  // Load all user spaces when in All Spaces mode
  useEffect(() => {
    if (isAllSpaces) {
      SpaceService.listSpaces().then(setAllSpaces);
    }
  }, [isAllSpaces]);

  const allSpaceIds = useMemo(() => allSpaces.map((s) => s.id), [allSpaces]);

  // Build a lookup map: spaceId → SpaceInfo for entry card indicators
  const spaceInfoMap = useMemo(() => {
    const map = new Map<string, SpaceInfo>();
    for (const s of allSpaces) {
      map.set(s.id, { color: s.color, emoji: s.emoji, id: s.id, name: s.name });
    }

    return map;
  }, [allSpaces]);

  const canQuery = isAllSpaces ? allSpaceIds.length > 0 : !!activeSpaceId;

  const buildQueryParams = useCallback(
    (offset = 0): TimelineQueryParams => ({
      childId: filters.childIds.length === 1 ? filters.childIds[0] : undefined,
      dateFrom: filters.dateFrom ?? undefined,
      dateTo: filters.dateTo ?? undefined,
      limit: PAGE_SIZE,
      offset,
      ...(isAllSpaces ? { spaceIds: allSpaceIds } : { spaceId: activeSpaceId ?? '' }),
      types: filters.types.length > 0 ? filters.types : undefined,
    }),
    [filters, activeSpaceId, isAllSpaces, allSpaceIds],
  );

  const loadEntries = useCallback(async () => {
    if (!canQuery) return;

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
  }, [canQuery, buildQueryParams]);

  // Load entries when active space or filters change
  useEffect(() => {
    if (canQuery) {
      loadEntries();
    }
  }, [canQuery, filters, loadEntries]);

  const handleRefresh = async () => {
    if (!canQuery) return;

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
    if (!canQuery || !hasMore || isLoadingMore) return;

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

  const handleSpacePress = useCallback(
    (spaceInfo: SpaceInfo) => {
      switchToSpace(spaceInfo.id);
    },
    [switchToSpace],
  );

  const renderItem = useCallback(
    ({ item }: { item: TimelineEntry }) => (
      <EntryCard
        entry={item}
        spaceInfo={isAllSpaces ? (spaceInfoMap.get(item.spaceId) ?? null) : null}
        onPress={handleEntryPress}
        onSpacePress={isAllSpaces ? handleSpacePress : undefined}
      />
    ),
    [handleEntryPress, isAllSpaces, spaceInfoMap, handleSpacePress],
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
      {/* Entry List */}
      {entries.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <PencilLineIcon height={48} style={tw`text-placeholder mb-4`} width={48} />
          <Text style={tw`text-foreground mb-2 text-xl font-medium`}>No entries yet</Text>
          <Text style={tw`text-subtitle mb-6 text-center`}>
            Start documenting by adding your first entry.
          </Text>
          <Button title="Add Entry" onPress={handleAddEntry} />
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

      {/* Filters Modal */}
      <TimelineFilters
        filters={filters}
        spaceId={activeSpaceId}
        spaceIds={isAllSpaces ? allSpaceIds : undefined}
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
