import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { ENTRY_TYPES, type Child, type EntryType } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import { FileTextIcon, LockIcon, PackageIcon } from '@/icons';
import {
  ExportService,
  RelationshipService,
  ChildService,
  TimelineService,
  type ExportFilters,
} from '@/services';

const ACTIVE_BG = 'bg-blue-600';
const INACTIVE_BG = 'bg-gray-100';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-gray-700';

const EXPORT_ICON_SIZE = 28;

const TYPE_LABELS: Record<EntryType, string> = {
  agreement: 'Agreement',
  communication: 'Communication',
  event: 'Event',
  expense: 'Expense',
  upload: 'Document',
};

export function ExportScreen() {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [entryCount, setEntryCount] = useState(0);

  // Filter state
  const [exportType, setExportType] = useState<'pdf' | 'bundle'>('pdf');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<EntryType[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (relationshipId) {
      updateCount();
    }
  }, [relationshipId, selectedChildIds, selectedTypes, updateCount]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) {
        setRelationshipId(rel.id);
        const c = await ChildService.listByRelationship(rel.id);
        setChildren(c);
      }
    } catch {
      // Silent fail — data load is non-critical
    } finally {
      setIsLoading(false);
    }
  };

  const updateCount = useCallback(async () => {
    if (!relationshipId) return;

    try {
      const result = await TimelineService.query({
        childId: selectedChildIds.length === 1 ? selectedChildIds[0] : undefined,
        limit: 1,
        relationshipId,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
      });
      setEntryCount(result.total);
    } catch {
      // Silent fail — count update is non-critical
    }
  }, [relationshipId, selectedChildIds, selectedTypes]);

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
    if (!relationshipId) return;

    setIsExporting(true);
    try {
      const filters: ExportFilters = {
        childIds: selectedChildIds.length > 0 ? selectedChildIds : undefined,
        includeDisputed: true,
        relationshipId,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
      };

      let result;
      if (exportType === 'pdf') {
        result = await ExportService.generatePDF(filters);
      } else {
        result = await ExportService.generateBundle(filters);
      }

      await ExportService.shareExport(result);

      Alert.alert('Success', `Export created: ${result.fileName}`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`border-b border-gray-100 bg-white px-4 pb-4 pt-14`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Export</Text>
        <Text style={tw`mt-1 text-gray-600`}>
          Generate court-ready reports and evidence bundles
        </Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Export Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-3 text-sm font-medium uppercase tracking-wide text-gray-600`}>
            Export Type
          </Text>
          <View style={tw`flex-row gap-3`}>
            <Pressable
              style={tw`flex-1 rounded-xl border-2 p-4 ${
                exportType === 'pdf' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
              onPress={() => setExportType('pdf')}
            >
              <FileTextIcon
                height={EXPORT_ICON_SIZE}
                style={tw`mb-2 text-gray-700`}
                width={EXPORT_ICON_SIZE}
              />
              <Text style={tw`font-semibold text-gray-900`}>PDF Report</Text>
              <Text style={tw`mt-1 text-sm text-gray-600`}>
                Timeline summary for printing or sharing
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-xl border-2 p-4 ${
                exportType === 'bundle' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
              onPress={() => setExportType('bundle')}
            >
              <PackageIcon
                height={EXPORT_ICON_SIZE}
                style={tw`mb-2 text-gray-700`}
                width={EXPORT_ICON_SIZE}
              />
              <Text style={tw`font-semibold text-gray-900`}>Evidence Bundle</Text>
              <Text style={tw`mt-1 text-sm text-gray-600`}>
                Full data + files with hash verification
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Children Filter */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`mb-3 text-sm font-medium uppercase tracking-wide text-gray-600`}>
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
          <Text style={tw`mb-3 text-sm font-medium uppercase tracking-wide text-gray-600`}>
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

        {/* Preview Count */}
        <View style={tw`mb-6 rounded-xl bg-gray-50 p-4`}>
          <Text style={tw`text-center text-gray-600`}>
            <Text style={tw`text-2xl font-bold text-gray-900`}>{entryCount}</Text> entries will be
            exported
          </Text>
        </View>

        {/* Info */}
        {exportType === 'bundle' && (
          <View style={tw`mb-6 flex-row rounded-xl bg-green-50 p-4`}>
            <LockIcon height={16} style={tw`mr-2 mt-0.5 text-green-800`} width={16} />
            <Text style={tw`flex-1 text-sm text-green-800`}>
              The evidence bundle includes SHA-256 hashes for all files. These can be used to prove
              files haven{"'"}t been modified.
            </Text>
          </View>
        )}

        {/* Export Button */}
        <Pressable
          disabled={isExporting || entryCount === 0}
          style={tw`flex-row items-center justify-center rounded-xl bg-blue-600 py-4`}
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
          <Text style={tw`mt-4 text-center text-gray-500`}>No entries match your filters</Text>
        )}
      </ScrollView>
    </View>
  );
}
