import { LegendList } from '@legendapp/list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import { Button, PageHeader, ScreenContainer, Typography } from '@/components';
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_DISPLAY,
  type Child,
  type Resource,
  type ResourceCategory,
} from '@/database/schema';
import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import {
  BookOpenIcon,
  ChevronRightIcon,
  HeartPulseIcon,
  LockIcon,
  PackageIcon,
  ScaleIcon,
  UserIcon,
  WalletIcon,
} from '@/icons';
import type { ResourcesStackParamList } from '@/navigation/ResourcesNavigator';
import {
  ChildService,
  ResourceService,
  SpaceService,
  type ResourceFilters,
  type SpaceWithRole,
} from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<ResourcesStackParamList, 'Resources'>;

const CATEGORY_ICONS: Record<ResourceCategory, React.FC<SvgProps>> = {
  financial: WalletIcon,
  identity: UserIcon,
  insurance: LockIcon,
  legal: ScaleIcon,
  medical: HeartPulseIcon,
  other: PackageIcon,
  school: BookOpenIcon,
};

const ICON_SIZE = 24;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ResourcesScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpaceId, isAllSpaces } = useActiveSpace();
  const [resourceList, setResourceList] = useState<Resource[]>([]);
  const [childMap, setChildMap] = useState<Map<string, Child>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(null);
  const [allSpaces, setAllSpaces] = useState<SpaceWithRole[]>([]);

  const allSpaceIds = useMemo(() => allSpaces.map((s) => s.id), [allSpaces]);

  useEffect(() => {
    if (isAllSpaces) {
      SpaceService.listSpaces().then(setAllSpaces);
    }
  }, [isAllSpaces]);

  const headerTitle = 'Resources';

  const canQuery = isAllSpaces ? allSpaceIds.length > 0 : !!activeSpaceId;

  const loadResources = useCallback(async () => {
    if (!canQuery) return;

    const filters: ResourceFilters = {};
    if (selectedCategory) filters.category = selectedCategory;

    try {
      const results = isAllSpaces
        ? await ResourceService.listBySpaces(allSpaceIds, filters)
        : await ResourceService.listBySpace(activeSpaceId ?? '', filters);
      setResourceList(results);

      // Load child names for resources that reference a child
      const childIds = [...new Set(results.filter((r) => r.childId).map((r) => r.childId))];
      if (childIds.length > 0) {
        const spaceId = isAllSpaces ? allSpaceIds[0] : (activeSpaceId ?? '');
        const spaceChildren = await ChildService.listBySpace(spaceId);
        const map = new Map<string, Child>();
        for (const child of spaceChildren) {
          map.set(child.id, child);
        }
        setChildMap(map);
      }
    } catch {
      // Silent fail — resource load is non-critical
    }
  }, [canQuery, selectedCategory, isAllSpaces, allSpaceIds, activeSpaceId]);

  useEffect(() => {
    if (!canQuery) return;

    setIsLoading(true);
    loadResources().finally(() => setIsLoading(false));
  }, [canQuery, loadResources]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadResources();
    setIsRefreshing(false);
  };

  const handleAddResource = () => {
    navigation.navigate('AddResource');
  };

  const handleResourcePress = useCallback(
    (resource: Resource) => {
      navigation.navigate('ResourceDetail', { resourceId: resource.id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Resource }) => {
      const CategoryIcon = CATEGORY_ICONS[item.category];
      const childName = item.childId ? childMap.get(item.childId)?.name : null;

      return (
        <Pressable
          style={tw`bg-surface mb-2 flex-row items-center rounded-xl px-4 py-3`}
          onPress={() => handleResourcePress(item)}
        >
          <View style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}>
            <CategoryIcon height={ICON_SIZE} style={tw`text-subtitle`} width={ICON_SIZE} />
          </View>
          <View style={tw`flex-1`}>
            <Typography style={tw`text-foreground text-base`}>{item.title}</Typography>
            {childName ? (
              <Typography style={tw`text-subtitle text-sm`}>{childName}</Typography>
            ) : null}
            <Typography style={tw`text-subtitle text-xs`}>{formatDate(item.createdAt)}</Typography>
          </View>
          <ChevronRightIcon height={20} style={tw`text-placeholder`} width={20} />
        </Pressable>
      );
    },
    [tw, childMap, handleResourcePress],
  );

  if (isLoading) {
    return (
      <ScreenContainer excludedEdges={['top']} hasScroll={false}>
        <PageHeader title={headerTitle} />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer excludedEdges={['top']} hasScroll={false}>
      <PageHeader title={headerTitle} />

      {/* Category filter chips */}
      <View style={tw`pb-2`}>
        <ScrollView
          horizontal
          contentContainerStyle={tw`px-4`}
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            style={tw`mr-2 rounded-full px-4 py-1.5 ${
              selectedCategory === null ? 'bg-primary' : 'bg-neutral-200'
            }`}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={tw`text-sm font-medium ${
                selectedCategory === null ? 'text-white' : 'text-foreground'
              }`}
            >
              All
            </Text>
          </Pressable>
          {RESOURCE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={tw`mr-2 rounded-full px-4 py-1.5 ${
                selectedCategory === cat ? 'bg-primary' : 'bg-neutral-200'
              }`}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={tw`text-sm font-medium ${
                  selectedCategory === cat ? 'text-white' : 'text-foreground'
                }`}
              >
                {RESOURCE_CATEGORY_DISPLAY[cat]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Resource list */}
      {resourceList.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <BookOpenIcon height={48} style={tw`text-placeholder mb-4`} width={48} />
          <Text style={tw`text-foreground mb-2 text-xl font-medium`}>No resources yet</Text>
          <Text style={tw`text-subtitle mb-6 text-center`}>
            {'Add important documents here —\nmedical records, school forms, legal agreements.'}
          </Text>
          <Button title="Add Resource" onPress={handleAddResource} />
        </View>
      ) : (
        <LegendList
          contentContainerStyle={tw`px-4 pb-20 pt-2`}
          data={resourceList}
          estimatedItemSize={80}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          renderItem={renderItem}
        />
      )}

      {/* FAB */}
      {resourceList.length > 0 && (
        <Pressable
          style={tw`bg-primary absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg`}
          onPress={handleAddResource}
        >
          <Text style={tw`text-2xl font-light text-white`}>+</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}
