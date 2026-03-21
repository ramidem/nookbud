import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';

import { ENTRY_TYPES, type Child, type EntryType } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import { ChildService } from '@/services';

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
  agreement: 'Agreement',
  communication: 'Communication',
  event: 'Event',
  expense: 'Expense',
  upload: 'Document',
};

export function TimelineFilters({ filters, onApply, onClose, relationshipId, visible }: Props) {
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
      dateFrom: null,
      dateTo: null,
      types: [],
    });
  };

  const hasFilters =
    localFilters.childIds.length > 0 ||
    localFilters.types.length > 0 ||
    localFilters.dateFrom !== null ||
    localFilters.dateTo !== null;

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible}>
      <View style={tw`bg-surface flex-1`}>
        {/* Header */}
        <View
          style={tw`border-divider flex-row items-center justify-between border-b px-4 pb-2 pt-4`}
        >
          <Pressable onPress={onClose}>
            <Text style={tw`text-primary text-base`}>Cancel</Text>
          </Pressable>
          <Text style={tw`text-foreground font-serif-semibold text-lg`}>Filters</Text>
          <Pressable onPress={() => onApply(localFilters)}>
            <Text style={tw`text-primary text-base font-semibold`}>Apply</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={tw`p-4`}>
          {/* Children filter */}
          {children.length > 0 && (
            <View style={tw`mb-6`}>
              <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
                Children
              </Text>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {children.map((child) => (
                  <Pressable
                    key={child.id}
                    style={tw`rounded-full px-4 py-2 ${
                      localFilters.childIds.includes(child.id) ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                    onPress={() => toggleChild(child.id)}
                  >
                    <Text
                      style={tw`font-medium ${
                        localFilters.childIds.includes(child.id) ? 'text-white' : 'text-foreground'
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
            <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
              Entry Types
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {ENTRY_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={tw`rounded-full px-4 py-2 ${
                    localFilters.types.includes(type) ? 'bg-primary' : 'bg-neutral-200'
                  }`}
                  onPress={() => toggleType(type)}
                >
                  <Text
                    style={tw`${
                      localFilters.types.includes(type) ? 'text-white' : 'text-foreground'
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
            <Text style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}>
              Date Range
            </Text>
            <Text style={tw`text-subtitle text-sm`}>
              Date picker coming soon. For now, all dates are included.
            </Text>
          </View>

          {/* Clear button */}
          {hasFilters && (
            <Pressable style={tw`border-error mt-4 rounded-xl border py-3`} onPress={clearFilters}>
              <Text style={tw`text-error text-center font-medium`}>Clear All Filters</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
