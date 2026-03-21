import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Switch } from 'react-native';

import { PageHeader } from '@/components';
import { Alert } from '@/components/atoms';
import { ENTRY_TYPES, type Child, type EntryType } from '@/database/schema';
import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import { ArrowLeftIcon, FileTextIcon, LockIcon, PackageIcon } from '@/icons';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import {
  ExportService,
  ChildService,
  SpaceService,
  TimelineService,
  type ExportFilters,
  type SpaceWithRole,
} from '@/services';
import { colors } from '@/tailwind';

const ACTIVE_BG = 'bg-primary';
const INACTIVE_BG = 'bg-neutral-200';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';
const ACTIVE_CARD = 'border-primary bg-primary/15';
const INACTIVE_CARD = 'border-divider';

const EXPORT_ICON_SIZE = 28;
const TYPE_LABELS: Record<EntryType, string> = {
  agreement: 'Agreement',
  communication: 'Communication',
  event: 'Event',
  expense: 'Expense',
  upload: 'Document',
};

type SpaceScope = 'this' | 'all';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Export'>;

export function ExportScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [allSpaces, setAllSpaces] = useState<SpaceWithRole[]>([]);
  const [allSpaceIds, setAllSpaceIds] = useState<string[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [entryCount, setEntryCount] = useState(0);

  // Filter state
  const [spaceScope, setSpaceScope] = useState<SpaceScope>(isAllSpaces ? 'all' : 'this');
  const [exportType, setExportType] = useState<'pdf' | 'bundle'>('pdf');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<EntryType[]>([]);
  const [includeResources, setIncludeResources] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const spaceList = await SpaceService.listSpaces();
      setAllSpaces(spaceList);
      setAllSpaceIds(spaceList.map((s) => s.id));

      // Load children for active space
      if (activeSpaceId) {
        const c = await ChildService.listBySpace(activeSpaceId);
        setChildren(c);
      }
    } catch {
      // Silent fail — data load is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [activeSpaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    updateCount();
  }, [spaceScope, activeSpaceId, selectedChildIds, selectedTypes, allSpaceIds, updateCount]);

  const updateCount = useCallback(async () => {
    try {
      if (spaceScope === 'all' && allSpaceIds.length > 0) {
        const result = await TimelineService.query({
          childId: selectedChildIds.length === 1 ? selectedChildIds[0] : undefined,
          limit: 1,
          spaceIds: allSpaceIds,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
        });
        setEntryCount(result.total);
      } else if (activeSpaceId) {
        const result = await TimelineService.query({
          childId: selectedChildIds.length === 1 ? selectedChildIds[0] : undefined,
          limit: 1,
          spaceId: activeSpaceId,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
        });
        setEntryCount(result.total);
      } else {
        setEntryCount(0);
      }
    } catch {
      // Silent fail — count update is non-critical
    }
  }, [spaceScope, activeSpaceId, allSpaceIds, selectedChildIds, selectedTypes]);

  const toggleChild = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId],
    );
  };

  const toggleType = (type: EntryType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters: ExportFilters = {
        childIds: selectedChildIds.length > 0 ? selectedChildIds : undefined,
        includeDisputed: true,
        includeResources,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
      };

      if (spaceScope === 'all') {
        filters.spaceIds = allSpaceIds;
      } else {
        filters.spaceId = activeSpaceId ?? undefined;
      }

      let result;
      if (exportType === 'pdf') {
        result = await ExportService.generatePDF(filters);
      } else {
        result = await ExportService.generateBundle(filters);
      }

      await ExportService.shareExport(result);

      Alert.success({ title: `Export created: ${result.fileName}` });
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Export failed',
        title: 'Export Failed',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const spaceName = activeSpace?.name ?? 'Space';
  const spaceEmoji = activeSpace?.emoji ?? '';

  if (isLoading) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={tw`bg-surface flex-1`}>
      <PageHeader
        leftAction={
          <Pressable style={tw`mr-3`} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon height={24} style={tw`text-foreground`} width={24} />
          </Pressable>
        }
        subtitle="Generate court-ready reports and evidence bundles"
        title="Export"
      />

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Space Scope Selector */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
            Space Scope
          </Text>
          <View style={tw`flex-row gap-3`}>
            <Pressable
              style={tw`flex-1 rounded-xl border-2 p-4 ${
                spaceScope === 'this' ? ACTIVE_CARD : INACTIVE_CARD
              }`}
              onPress={() => setSpaceScope('this')}
            >
              <Text style={tw`text-foreground font-semibold`}>
                {spaceEmoji} {spaceName}
              </Text>
              <Text style={tw`text-subtitle mt-1 text-sm`}>Export from this Space only</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-xl border-2 p-4 ${
                spaceScope === 'all' ? ACTIVE_CARD : INACTIVE_CARD
              }`}
              onPress={() => setSpaceScope('all')}
            >
              <Text style={tw`text-foreground font-semibold`}>All Spaces</Text>
              <Text style={tw`text-subtitle mt-1 text-sm`}>
                Export across {allSpaces.length} Spaces
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Export Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
            Export Type
          </Text>
          <View style={tw`flex-row gap-3`}>
            <Pressable
              style={tw`flex-1 rounded-xl border-2 p-4 ${
                exportType === 'pdf' ? ACTIVE_CARD : INACTIVE_CARD
              }`}
              onPress={() => setExportType('pdf')}
            >
              <FileTextIcon
                height={EXPORT_ICON_SIZE}
                style={tw`text-foreground mb-2`}
                width={EXPORT_ICON_SIZE}
              />
              <Text style={tw`text-foreground font-semibold`}>PDF Report</Text>
              <Text style={tw`text-subtitle mt-1 text-sm`}>
                Timeline summary for printing or sharing
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-xl border-2 p-4 ${
                exportType === 'bundle' ? ACTIVE_CARD : INACTIVE_CARD
              }`}
              onPress={() => setExportType('bundle')}
            >
              <PackageIcon
                height={EXPORT_ICON_SIZE}
                style={tw`text-foreground mb-2`}
                width={EXPORT_ICON_SIZE}
              />
              <Text style={tw`text-foreground font-semibold`}>Evidence Bundle</Text>
              <Text style={tw`text-subtitle mt-1 text-sm`}>
                Full data + files with hash verification
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Children Filter */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
              Filter by Child
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`rounded-full px-4 py-2 ${
                  selectedChildIds.length === 0 ? ACTIVE_BG : INACTIVE_BG
                }`}
                onPress={() => setSelectedChildIds([])}
              >
                <Text
                  style={tw`font-medium ${
                    selectedChildIds.length === 0 ? ACTIVE_TEXT : INACTIVE_TEXT
                  }`}
                >
                  All Children
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`rounded-full px-4 py-2 ${
                    selectedChildIds.includes(child.id) ? ACTIVE_BG : INACTIVE_BG
                  }`}
                  onPress={() => toggleChild(child.id)}
                >
                  <Text
                    style={tw`font-medium ${
                      selectedChildIds.includes(child.id) ? ACTIVE_TEXT : INACTIVE_TEXT
                    }`}
                  >
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Entry Type Filter */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
            Filter by Type
          </Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            <Pressable
              style={tw`rounded-full px-4 py-2 ${
                selectedTypes.length === 0 ? ACTIVE_BG : INACTIVE_BG
              }`}
              onPress={() => setSelectedTypes([])}
            >
              <Text
                style={tw`font-medium ${selectedTypes.length === 0 ? ACTIVE_TEXT : INACTIVE_TEXT}`}
              >
                All Types
              </Text>
            </Pressable>
            {ENTRY_TYPES.map((type) => (
              <Pressable
                key={type}
                style={tw`rounded-full px-4 py-2 ${
                  selectedTypes.includes(type) ? ACTIVE_BG : INACTIVE_BG
                }`}
                onPress={() => toggleType(type)}
              >
                <Text style={tw`${selectedTypes.includes(type) ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                  {TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Include Resources Toggle */}
        <View style={tw`mb-6 flex-row items-center justify-between rounded-xl bg-neutral-200 p-4`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-foreground font-medium`}>Include Resources</Text>
            <Text style={tw`text-subtitle mt-0.5 text-sm`}>
              Attach uploaded files to the export
            </Text>
          </View>
          <Switch
            thumbColor="white"
            trackColor={{ false: colors.placeholder, true: colors.primary }}
            value={includeResources}
            onValueChange={setIncludeResources}
          />
        </View>

        {/* Preview Count */}
        <View style={tw`bg-background mb-6 rounded-xl p-4`}>
          <Text style={tw`text-subtitle text-center`}>
            <Text style={tw`text-foreground text-2xl font-bold`}>{entryCount}</Text>{' '}
            {spaceScope === 'all'
              ? `entries across ${allSpaces.length} Spaces`
              : `entries from ${spaceEmoji} ${spaceName}`}
          </Text>
        </View>

        {/* Info */}
        {exportType === 'bundle' && (
          <View style={tw`bg-success/15 mb-6 flex-row rounded-xl p-4`}>
            <LockIcon height={16} style={tw`text-success mr-2 mt-0.5`} width={16} />
            <Text style={tw`text-success flex-1 text-sm`}>
              The evidence bundle includes SHA-256 hashes for all files. These can be used to prove
              files haven{"'"}t been modified.
            </Text>
          </View>
        )}

        {/* Export Button */}
        <Pressable
          disabled={isExporting || entryCount === 0}
          style={tw`bg-primary flex-row items-center justify-center rounded-xl py-4`}
          onPress={handleExport}
        >
          {isExporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-lg font-semibold text-white`}>
              {exportType === 'pdf' ? 'Generate Report' : 'Create Evidence Bundle'}
            </Text>
          )}
        </Pressable>

        {entryCount === 0 && (
          <Text style={tw`text-subtitle mt-4 text-center`}>No entries match your filters</Text>
        )}
      </ScrollView>
    </View>
  );
}
