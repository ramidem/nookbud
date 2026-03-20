import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTw } from '@/hooks/useTw';
import {
  ExportService,
  RelationshipService,
  ChildService,
  TimelineService,
  type ExportFilters,
} from '@/services';
import type { Child, EntryType } from '@/database/schema';
import { ENTRY_TYPES } from '@/database/schema';

const TYPE_LABELS: Record<EntryType, string> = {
  expense: '💰 Expense',
  event: '📅 Event',
  agreement: '🤝 Agreement',
  communication: '💬 Communication',
  upload: '📎 Document',
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
  }, [relationshipId, selectedChildIds, selectedTypes]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) {
        setRelationshipId(rel.id);
        const c = await ChildService.listByRelationship(rel.id);
        setChildren(c);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCount = async () => {
    if (!relationshipId) return;

    try {
      const result = await TimelineService.query({
        relationshipId,
        childId: selectedChildIds.length === 1 ? selectedChildIds[0] : undefined,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        limit: 1,
      });
      setEntryCount(result.total);
    } catch (err) {
      console.error('Failed to get count:', err);
    }
  };

  const toggleChild = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const toggleType = (type: EntryType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleExport = async () => {
    if (!relationshipId) return;

    setIsExporting(true);
    try {
      const filters: ExportFilters = {
        relationshipId,
        childIds: selectedChildIds.length > 0 ? selectedChildIds : undefined,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        includeDisputed: true,
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
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`bg-white px-4 pt-14 pb-4 border-b border-gray-100`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Export</Text>
        <Text style={tw`text-gray-600 mt-1`}>
          Generate court-ready reports and evidence bundles
        </Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Export Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide mb-3`}>
            Export Type
          </Text>
          <View style={tw`flex-row gap-3`}>
            <Pressable
              style={tw`flex-1 p-4 rounded-xl border-2 ${
                exportType === 'pdf' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
              onPress={() => setExportType('pdf')}
            >
              <Text style={tw`text-2xl mb-2`}>📄</Text>
              <Text style={tw`font-semibold text-gray-900`}>PDF Report</Text>
              <Text style={tw`text-sm text-gray-600 mt-1`}>
                Timeline summary for printing or sharing
              </Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 p-4 rounded-xl border-2 ${
                exportType === 'bundle' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
              onPress={() => setExportType('bundle')}
            >
              <Text style={tw`text-2xl mb-2`}>📦</Text>
              <Text style={tw`font-semibold text-gray-900`}>Evidence Bundle</Text>
              <Text style={tw`text-sm text-gray-600 mt-1`}>
                Full data + files with hash verification
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Children Filter */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide mb-3`}>
              Filter by Child
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`px-4 py-2 rounded-full ${
                  selectedChildIds.length === 0 ? 'bg-blue-600' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedChildIds([])}
              >
                <Text
                  style={tw`font-medium ${
                    selectedChildIds.length === 0 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  All Children
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`px-4 py-2 rounded-full ${
                    selectedChildIds.includes(child.id) ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                  onPress={() => toggleChild(child.id)}
                >
                  <Text
                    style={tw`font-medium ${
                      selectedChildIds.includes(child.id) ? 'text-white' : 'text-gray-700'
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
          <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide mb-3`}>
            Filter by Type
          </Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            <Pressable
              style={tw`px-4 py-2 rounded-full ${
                selectedTypes.length === 0 ? 'bg-blue-600' : 'bg-gray-100'
              }`}
              onPress={() => setSelectedTypes([])}
            >
              <Text
                style={tw`font-medium ${
                  selectedTypes.length === 0 ? 'text-white' : 'text-gray-700'
                }`}
              >
                All Types
              </Text>
            </Pressable>
            {ENTRY_TYPES.map((type) => (
              <Pressable
                key={type}
                style={tw`px-4 py-2 rounded-full ${
                  selectedTypes.includes(type) ? 'bg-blue-600' : 'bg-gray-100'
                }`}
                onPress={() => toggleType(type)}
              >
                <Text
                  style={tw`${
                    selectedTypes.includes(type) ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Preview Count */}
        <View style={tw`bg-gray-50 rounded-xl p-4 mb-6`}>
          <Text style={tw`text-center text-gray-600`}>
            <Text style={tw`text-2xl font-bold text-gray-900`}>{entryCount}</Text>
            {' '}entries will be exported
          </Text>
        </View>

        {/* Info */}
        {exportType === 'bundle' && (
          <View style={tw`bg-green-50 rounded-xl p-4 mb-6`}>
            <Text style={tw`text-green-800 text-sm`}>
              🔒 The evidence bundle includes SHA-256 hashes for all files.
              These can be used to prove files haven't been modified.
            </Text>
          </View>
        )}

        {/* Export Button */}
        <Pressable
          style={tw`bg-blue-600 rounded-xl py-4 flex-row justify-center items-center`}
          onPress={handleExport}
          disabled={isExporting || entryCount === 0}
        >
          {isExporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white text-lg font-semibold`}>
              {exportType === 'pdf' ? 'Generate Report' : 'Create Evidence Bundle'}
            </Text>
          )}
        </Pressable>

        {entryCount === 0 && (
          <Text style={tw`text-center text-gray-500 mt-4`}>
            No entries match your filters
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
