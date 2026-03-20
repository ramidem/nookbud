import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';

import type { EntryVersion, Attachment } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import {
  EntryService,
  AcknowledgmentService,
  DisputeService,
  type EntryWithVersion,
  type DisputeWithResponses,
} from '@/services';

type Props = NativeStackScreenProps<TimelineStackParamList, 'EntryDetail'>;

const HASH_PREVIEW_LENGTH = 16;

const TYPE_LABELS = {
  agreement: '🤝 Agreement',
  communication: '💬 Communication',
  event: '📅 Event',
  expense: '💰 Expense',
  upload: '📎 Document',
};

export function EntryDetailScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<EntryWithVersion | null>(null);
  const [versions, setVersions] = useState<EntryVersion[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dispute, setDispute] = useState<DisputeWithResponses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canAct, setCanAct] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      const e = await EntryService.getWithDetails(entryId);
      setEntry(e);

      if (e) {
        const v = await EntryService.getVersionHistory(entryId);
        setVersions(v);

        if (e.currentVersion) {
          const a = await EntryService.getAttachments(e.currentVersion.id);
          setAttachments(a);
        }

        const d = await DisputeService.getByEntry(entryId);
        setDispute(d);

        const can = await AcknowledgmentService.canAct(entryId);
        setCanAct(can);
      }
    } catch (err) {
      console.error('Failed to load entry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      await AcknowledgmentService.acknowledge(entryId);
      loadEntry();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to acknowledge');
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for disputing');

      return;
    }

    try {
      await AcknowledgmentService.dispute(entryId, disputeReason.trim());
      setShowDisputeModal(false);
      setDisputeReason('');
      loadEntry();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to dispute');
    }
  };

  const renderContent = () => {
    if (!entry?.currentVersion) return null;

    const content = JSON.parse(entry.currentVersion.contentJson);

    switch (entry.type) {
      case 'expense':
        return (
          <View style={tw`mb-4 rounded-xl bg-gray-50 p-4`}>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Amount</Text>
              <Text style={tw`text-xl font-bold`}>
                {content.currency} {(content.amount / 100).toFixed(2)}
              </Text>
            </View>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Category</Text>
              <Text style={tw`text-gray-900`}>{content.category}</Text>
            </View>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Split</Text>
              <Text style={tw`text-gray-900`}>{content.splitType}</Text>
            </View>
            <View style={tw`mt-2 border-t border-gray-200 pt-2`}>
              <Text style={tw`text-gray-900`}>{content.description}</Text>
            </View>
          </View>
        );

      case 'event':
        return (
          <View style={tw`mb-4 rounded-xl bg-gray-50 p-4`}>
            <Text style={tw`mb-2 text-xl font-semibold`}>{content.title}</Text>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>When</Text>
              <Text style={tw`text-gray-900`}>{new Date(content.startTime).toLocaleString()}</Text>
            </View>
            {content.location && (
              <View style={tw`mb-2 flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Where</Text>
                <Text style={tw`text-gray-900`}>{content.location}</Text>
              </View>
            )}
            {content.notes && (
              <View style={tw`mt-2 border-t border-gray-200 pt-2`}>
                <Text style={tw`text-gray-900`}>{content.notes}</Text>
              </View>
            )}
          </View>
        );

      case 'agreement':
        return (
          <View style={tw`mb-4 rounded-xl bg-gray-50 p-4`}>
            <Text style={tw`mb-2 text-xl font-semibold`}>{content.title}</Text>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Effective</Text>
              <Text style={tw`text-gray-900`}>{content.effectiveDate}</Text>
            </View>
            {content.expirationDate && (
              <View style={tw`mb-2 flex-row justify-between`}>
                <Text style={tw`text-gray-600`}>Expires</Text>
                <Text style={tw`text-gray-900`}>{content.expirationDate}</Text>
              </View>
            )}
            <View style={tw`mt-2 border-t border-gray-200 pt-2`}>
              <Text style={tw`text-gray-900`}>{content.termsText}</Text>
            </View>
          </View>
        );

      case 'communication':
        return (
          <View style={tw`mb-4 rounded-xl bg-gray-50 p-4`}>
            <View style={tw`mb-2 flex-row items-center`}>
              <Text style={tw`flex-1 text-xl font-semibold`}>{content.subject}</Text>
              {content.importance === 'high' && (
                <View style={tw`rounded bg-red-100 px-2 py-1`}>
                  <Text style={tw`text-xs text-red-800`}>⚠️ High</Text>
                </View>
              )}
            </View>
            <Text style={tw`text-gray-900`}>{content.body}</Text>
          </View>
        );

      case 'upload':
        return (
          <View style={tw`mb-4 rounded-xl bg-gray-50 p-4`}>
            <Text style={tw`mb-2 text-xl font-semibold`}>{content.title}</Text>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Type</Text>
              <Text style={tw`capitalize text-gray-900`}>{content.documentType}</Text>
            </View>
            {content.description && (
              <Text style={tw`mt-2 text-gray-900`}>{content.description}</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <Text style={tw`text-gray-600`}>Entry not found</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View
        style={tw`flex-row items-center justify-between border-b border-gray-100 px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-base text-blue-600`}>← Back</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>{TYPE_LABELS[entry.type]}</Text>
        <View style={tw`w-12`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Status */}
        <View style={tw`mb-4 flex-row items-center`}>
          <View
            style={tw`rounded-full px-3 py-1 ${
              entry.acknowledgmentStatus === 'acknowledged'
                ? 'bg-green-100'
                : entry.acknowledgmentStatus === 'disputed'
                  ? 'bg-red-100'
                  : 'bg-amber-100'
            }`}
          >
            <Text
              style={tw`text-sm font-medium ${
                entry.acknowledgmentStatus === 'acknowledged'
                  ? 'text-green-800'
                  : entry.acknowledgmentStatus === 'disputed'
                    ? 'text-red-800'
                    : 'text-amber-800'
              }`}
            >
              {entry.acknowledgmentStatus === 'acknowledged' && '✓ Acknowledged'}
              {entry.acknowledgmentStatus === 'disputed' && '⚠️ Disputed'}
              {entry.acknowledgmentStatus === 'pending' && '⏳ Pending'}
            </Text>
          </View>
          <Text style={tw`ml-3 text-sm text-gray-500`}>{entry.createdAt.toLocaleDateString()}</Text>
        </View>

        {/* Content */}
        {renderContent()}

        {/* Attachments */}
        {attachments.length > 0 && (
          <View style={tw`mb-4`}>
            <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>
              Attachments ({attachments.length})
            </Text>
            {attachments.map((att) => (
              <View key={att.id} style={tw`mb-2 rounded-lg bg-gray-50 p-3`}>
                <Text style={tw`text-gray-900`}>📎 {att.originalFilename}</Text>
                <Text style={tw`mt-1 text-xs text-gray-500`}>
                  Hash: {att.fileHash.substring(0, HASH_PREVIEW_LENGTH)}...
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Version History */}
        <Pressable
          style={tw`flex-row items-center justify-between border-t border-gray-100 py-3`}
          onPress={() => setShowVersions(!showVersions)}
        >
          <Text style={tw`text-gray-600`}>Version History</Text>
          <Text style={tw`text-gray-400`}>
            v{entry.currentVersion?.versionNumber ?? 1} {showVersions ? '▼' : '▶'}
          </Text>
        </Pressable>

        {showVersions && (
          <View style={tw`mb-4`}>
            {versions.map((v) => (
              <View key={v.id} style={tw`border-b border-gray-100 py-2`}>
                <Text style={tw`text-gray-900`}>Version {v.versionNumber}</Text>
                <Text style={tw`text-sm text-gray-500`}>{v.createdAt.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dispute thread */}
        {dispute && (
          <View style={tw`mb-4 rounded-xl bg-red-50 p-4`}>
            <Text style={tw`mb-2 font-semibold text-red-800`}>Dispute</Text>
            <Text style={tw`mb-2 text-red-700`}>{dispute.reasonText}</Text>
            {dispute.responses.map((r) => (
              <View key={r.id} style={tw`mt-2 border-t border-red-200 pt-2`}>
                <Text style={tw`text-red-800`}>{r.responseText}</Text>
                <Text style={tw`mt-1 text-xs text-red-500`}>{r.createdAt.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        {canAct && (
          <View style={tw`mt-4 flex-row gap-3`}>
            <Pressable style={tw`flex-1 rounded-xl bg-green-600 py-4`} onPress={handleAcknowledge}>
              <Text style={tw`text-center font-semibold text-white`}>✓ Acknowledge</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 rounded-xl bg-red-100 py-4`}
              onPress={() => setShowDisputeModal(true)}
            >
              <Text style={tw`text-center font-semibold text-red-600`}>Dispute</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Dispute Modal */}
      <Modal animationType="slide" presentationStyle="pageSheet" visible={showDisputeModal}>
        <View style={tw`flex-1 bg-white`}>
          <View style={tw`flex-row items-center justify-between px-4 pb-2 pt-4`}>
            <Pressable onPress={() => setShowDisputeModal(false)}>
              <Text style={tw`text-blue-600`}>Cancel</Text>
            </Pressable>
            <Text style={tw`text-lg font-semibold`}>Dispute Entry</Text>
            <Pressable onPress={handleDispute}>
              <Text style={tw`font-semibold text-red-600`}>Submit</Text>
            </Pressable>
          </View>
          <View style={tw`p-4`}>
            <Text style={tw`mb-4 text-gray-600`}>
              Explain why you{"'"}re disputing this entry. Your co-parent will see this.
            </Text>
            <TextInput
              autoFocus
              multiline
              placeholder="Reason for dispute..."
              placeholderTextColor="#9CA3AF"
              style={tw`h-40 rounded-xl border border-gray-300 px-4 py-3`}
              textAlignVertical="top"
              value={disputeReason}
              onChangeText={setDisputeReason}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
