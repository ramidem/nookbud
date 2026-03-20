import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useTw } from '@/hooks/useTw';
import { ChildService } from '@/services';
import type { Child } from '@/database/schema';
import { ENTRY_TYPES, type EntryType } from '@/database/schema';

export type FilterState = {
  childIds: string[];
  types: EntryType[];
  dateFrom: Date | null;
  dateTo: Date | null;
};

type Props = {
  visible: boolean;
  filters: FilterState;
  relationshipId: string | null;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
};

const TYPE_LABELS: Record<EntryType, string> = {
  expense: '💰 Expense',
  event: '📅 Event',
  agreement: '🤝 Agreement',
  communication: '💬 Communication',
  upload: '📎 Document',
};

export function TimelineFilters({
  visible,
  filters,
  relationshipId,
  onClose,
  onApply,
}: Props) {
  const tw = useTw();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [children, setChildren] = useState<Child[]>([]);

  // Load children
  useEffect(() => {
    if (relationshipId) {
      ChildService.listByRelationship(relationshipId).then(setChildren);
    }
  }, [relationshipId]);

  // Reset local filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const toggleChild = (childId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      childIds: prev.childIds.includes(childId)
        ? prev.childIds.filter((id) => id !== childId)
        : [...prev.childIds, childId],
    }));
  };

  const toggleType = (type: EntryType) => {
    setLocalFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const clearFilters = () => {
    setLocalFilters({
      childIds: [],
      types: [],
      dateFrom: null,
      dateTo: null,
    });
  };

  const hasFilters =
    localFilters.childIds.length > 0 ||
    localFilters.types.length > 0 ||
    localFilters.dateFrom !== null ||
    localFilters.dateTo !== null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={tw`flex-1 bg-white`}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100`}>
          <Pressable onPress={onClose}>
            <Text style={tw`text-blue-600 text-base`}>Cancel</Text>
          </Pressable>
          <Text style={tw`text-lg font-semibold text-gray-900`}>Filters</Text>
          <Pressable onPress={() => onApply(localFilters)}>
            <Text style={tw`text-blue-600 text-base font-semibold`}>Apply</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={tw`p-4`}>
          {/* Children filter */}
          {children.length > 0 && (
            <View style={tw`mb-6`}>
              <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide mb-3`}>
                Children
              </Text>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {children.map((child) => (
                  <Pressable
                    key={child.id}
                    style={tw`px-4 py-2 rounded-full ${
                      localFilters.childIds.includes(child.id)
                        ? 'bg-blue-600'
                        : 'bg-gray-100'
                    }`}
                    onPress={() => toggleChild(child.id)}
                  >
                    <Text
                      style={tw`font-medium ${
                        localFilters.childIds.includes(child.id)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {child.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Entry types filter */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide mb-3`}>
              Entry Types
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {ENTRY_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={tw`px-4 py-2 rounded-full ${
                    localFilters.types.includes(type)
                      ? 'bg-blue-600'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => toggleType(type)}
                >
                  <Text
                    style={tw`${
                      localFilters.types.includes(type)
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Date range - simplified for MVP */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide mb-3`}>
              Date Range
            </Text>
            <Text style={tw`text-gray-500 text-sm`}>
              Date picker coming soon. For now, all dates are included.
            </Text>
          </View>

          {/* Clear button */}
          {hasFilters && (
            <Pressable
              style={tw`border border-red-200 rounded-xl py-3 mt-4`}
              onPress={clearFilters}
            >
              <Text style={tw`text-red-600 text-center font-medium`}>
                Clear All Filters
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
