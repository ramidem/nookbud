import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { LegendList } from '@legendapp/list';
import { useTw } from '@/hooks/useTw';
import { TimelineService, RelationshipService, type TimelineEntry, type TimelineQueryParams } from '@/services';
import { EntryCard } from '@/components/molecules/EntryCard';
import { TimelineFilters, type FilterState } from './TimelineFilters';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

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
    types: [],
    dateFrom: null,
    dateTo: null,
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

  // Load entries when relationship or filters change
  useEffect(() => {
    if (relationshipId) {
      loadEntries();
    }
  }, [relationshipId, filters]);

  const buildQueryParams = (offset = 0): TimelineQueryParams => ({
    relationshipId: relationshipId!,
    childId: filters.childIds.length === 1 ? filters.childIds[0] : undefined,
    types: filters.types.length > 0 ? filters.types : undefined,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const loadEntries = async () => {
    if (!relationshipId) return;

    setIsLoading(true);
    try {
      const result = await TimelineService.query(buildQueryParams(0));
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!relationshipId) return;

    setIsRefreshing(true);
    try {
      const result = await TimelineService.query(buildQueryParams(0));
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to refresh:', err);
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
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleEntryPress = (entry: TimelineEntry) => {
    navigation.navigate('EntryDetail', { entryId: entry.id });
  };

  const handleAddEntry = () => {
    navigation.navigate('AddEntryPicker');
  };

  const hasActiveFilters =
    filters.childIds.length > 0 ||
    filters.types.length > 0 ||
    filters.dateFrom !== null ||
    filters.dateTo !== null;

  const renderItem = useCallback(
    ({ item }: { item: TimelineEntry }) => (
      <EntryCard entry={item} onPress={handleEntryPress} />
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-white px-4 pt-14 pb-4 border-b border-gray-100`}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-2xl font-bold text-gray-900`}>Timeline</Text>
          <Pressable
            style={tw`${hasActiveFilters ? 'bg-blue-100' : 'bg-gray-100'} px-3 py-2 rounded-lg`}
            onPress={() => setShowFilters(true)}
          >
            <Text style={tw`${hasActiveFilters ? 'text-blue-600' : 'text-gray-600'} font-medium`}>
              {hasActiveFilters ? 'Filtered' : 'Filter'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Entry List */}
      {entries.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Text style={tw`text-6xl mb-4`}>📝</Text>
          <Text style={tw`text-xl font-medium text-gray-900 mb-2`}>No entries yet</Text>
          <Text style={tw`text-gray-600 text-center mb-6`}>
            Start documenting by adding your first entry.
          </Text>
          <Pressable
            style={tw`bg-blue-600 px-6 py-3 rounded-xl`}
            onPress={handleAddEntry}
          >
            <Text style={tw`text-white font-semibold`}>Add Entry</Text>
          </Pressable>
        </View>
      ) : (
        <LegendList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`p-4`}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={tw`py-4`}>
                <ActivityIndicator color="#2563EB" />
              </View>
            ) : null
          }
        />
      )}

      {/* FAB */}
      {entries.length > 0 && (
        <Pressable
          style={tw`absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg`}
          onPress={handleAddEntry}
        >
          <Text style={tw`text-white text-2xl font-light`}>+</Text>
        </Pressable>
      )}

      {/* Filters Modal */}
      <TimelineFilters
        visible={showFilters}
        filters={filters}
        relationshipId={relationshipId}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setShowFilters(false);
        }}
      />
    </View>
  );
}
