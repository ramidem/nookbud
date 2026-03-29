import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';

import { Alert, Modal, useModal } from '@/components';
import { useTw } from '@/hooks/useTw';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, PaperclipIcon } from '@/icons';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import {
  EntryService,
  AcknowledgmentService,
  DisputeService,
  type EntryWithVersion,
  type DisputeWithResponses,
} from '@/services';
import { colors } from '@/tailwind';
import type { EntryVersion, Attachment } from '@/types';

type Props = NativeStackScreenProps<ActivityStackParamList, 'EntryDetail'>;

const HASH_PREVIEW_LENGTH = 16;
const INLINE_ICON_SIZE = 14;

const TYPE_LABELS = {
  agreement: 'Agreement',
  communication: 'Communication',
  event: 'Event',
  expense: 'Expense',
  upload: 'Document',
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
  const {
    hideModal: hideDisputeModal,
    isVisible: isDisputeVisible,
    showModal: showDisputeModal,
  } = useModal();
  const [disputeReason, setDisputeReason] = useState('');

  const loadEntry = useCallback(async () => {
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
    } catch {
      // Silent fail — entry load is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handleAcknowledge = async () => {
    try {
      await AcknowledgmentService.acknowledge(entryId);
      loadEntry();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to acknowledge',
        title: 'Acknowledgment Failed',
      });
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      Alert.error({
        message: 'Please provide a reason for disputing',
        title: 'Missing Reason',
      });

      return;
    }

    try {
      await AcknowledgmentService.dispute(entryId, disputeReason.trim());
      hideDisputeModal();
      setDisputeReason('');
      loadEntry();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to dispute',
        title: 'Dispute Failed',
      });
    }
  };

  const renderContent = () => {
    if (!entry?.currentVersion) return null;

    const content = JSON.parse(entry.currentVersion.contentJson);

    switch (entry.type) {
      case 'expense':
        return (
          <View style={tw`bg-background mb-4 rounded-xl p-4`}>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Amount</Text>
              <Text style={tw`text-xl font-bold`}>
                {content.currency} {(content.amount / 100).toFixed(2)}
              </Text>
            </View>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Category</Text>
              <Text style={tw`text-foreground`}>{content.category}</Text>
            </View>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Split</Text>
              <Text style={tw`text-foreground`}>{content.splitType}</Text>
            </View>
            <View style={tw`border-background mt-2 border-t pt-2`}>
              <Text style={tw`text-foreground`}>{content.description}</Text>
            </View>
          </View>
        );

      case 'event':
        return (
          <View style={tw`bg-background mb-4 rounded-xl p-4`}>
            <Text style={tw`font-serif-semibold mb-2 text-xl`}>{content.title}</Text>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>When</Text>
              <Text style={tw`text-foreground`}>
                {new Date(content.startTime).toLocaleString()}
              </Text>
            </View>
            {content.location && (
              <View style={tw`mb-2 flex-row justify-between`}>
                <Text style={tw`text-subtitle`}>Where</Text>
                <Text style={tw`text-foreground`}>{content.location}</Text>
              </View>
            )}
            {content.notes && (
              <View style={tw`border-background mt-2 border-t pt-2`}>
                <Text style={tw`text-foreground`}>{content.notes}</Text>
              </View>
            )}
          </View>
        );

      case 'agreement':
        return (
          <View style={tw`bg-background mb-4 rounded-xl p-4`}>
            <Text style={tw`font-serif-semibold mb-2 text-xl`}>{content.title}</Text>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Effective</Text>
              <Text style={tw`text-foreground`}>{content.effectiveDate}</Text>
            </View>
            {content.expirationDate && (
              <View style={tw`mb-2 flex-row justify-between`}>
                <Text style={tw`text-subtitle`}>Expires</Text>
                <Text style={tw`text-foreground`}>{content.expirationDate}</Text>
              </View>
            )}
            <View style={tw`border-background mt-2 border-t pt-2`}>
              <Text style={tw`text-foreground`}>{content.termsText}</Text>
            </View>
          </View>
        );

      case 'communication':
        return (
          <View style={tw`bg-background mb-4 rounded-xl p-4`}>
            <View style={tw`mb-2 flex-row items-center`}>
              <Text style={tw`font-serif-semibold flex-1 text-xl`}>{content.subject}</Text>
              {content.importance === 'high' && (
                <View style={tw`bg-error/15 flex-row items-center rounded px-2 py-1`}>
                  <AlertTriangleIcon
                    height={INLINE_ICON_SIZE}
                    style={tw`text-error mr-1`}
                    width={INLINE_ICON_SIZE}
                  />
                  <Text style={tw`text-error text-xs`}>High</Text>
                </View>
              )}
            </View>
            <Text style={tw`text-foreground`}>{content.body}</Text>
          </View>
        );

      case 'upload':
        return (
          <View style={tw`bg-background mb-4 rounded-xl p-4`}>
            <Text style={tw`font-serif-semibold mb-2 text-xl`}>{content.title}</Text>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Type</Text>
              <Text style={tw`text-foreground capitalize`}>{content.documentType}</Text>
            </View>
            {content.description && (
              <Text style={tw`text-foreground mt-2`}>{content.description}</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <Text style={tw`text-subtitle`}>Entry not found</Text>
      </View>
    );
  }

  return (
    <View style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View
        style={tw`border-background flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>← Back</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>
          {TYPE_LABELS[entry.type]}
        </Text>
        <View style={tw`w-12`} />
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Status */}
        <View style={tw`mb-4 flex-row items-center`}>
          <View
            style={tw`rounded-full px-3 py-1 ${
              entry.acknowledgmentStatus === 'acknowledged'
                ? 'bg-success/15'
                : entry.acknowledgmentStatus === 'disputed'
                  ? 'bg-error/15'
                  : 'bg-warning/15'
            }`}
          >
            <View style={tw`flex-row items-center`}>
              {entry.acknowledgmentStatus === 'acknowledged' && (
                <CheckCircleIcon
                  height={INLINE_ICON_SIZE}
                  style={tw`text-success mr-1`}
                  width={INLINE_ICON_SIZE}
                />
              )}
              {entry.acknowledgmentStatus === 'disputed' && (
                <AlertTriangleIcon
                  height={INLINE_ICON_SIZE}
                  style={tw`text-error mr-1`}
                  width={INLINE_ICON_SIZE}
                />
              )}
              {entry.acknowledgmentStatus === 'pending' && (
                <ClockIcon
                  height={INLINE_ICON_SIZE}
                  style={tw`text-warning mr-1`}
                  width={INLINE_ICON_SIZE}
                />
              )}
              <Text
                style={tw`text-sm font-medium ${
                  entry.acknowledgmentStatus === 'acknowledged'
                    ? 'text-success'
                    : entry.acknowledgmentStatus === 'disputed'
                      ? 'text-error'
                      : 'text-warning'
                }`}
              >
                {entry.acknowledgmentStatus === 'acknowledged' && 'Acknowledged'}
                {entry.acknowledgmentStatus === 'disputed' && 'Disputed'}
                {entry.acknowledgmentStatus === 'pending' && 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={tw`text-subtitle ml-3 text-sm`}>{entry.createdAt.toLocaleDateString()}</Text>
        </View>

        {/* Content */}
        {renderContent()}

        {/* Attachments */}
        {attachments.length > 0 && (
          <View style={tw`mb-4`}>
            <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>
              Attachments ({attachments.length})
            </Text>
            {attachments.map((att) => (
              <View key={att.id} style={tw`bg-background mb-2 rounded-lg p-3`}>
                <View style={tw`flex-row items-center`}>
                  <PaperclipIcon
                    height={INLINE_ICON_SIZE}
                    style={tw`text-subtitle mr-1.5`}
                    width={INLINE_ICON_SIZE}
                  />
                  <Text style={tw`text-foreground`}>{att.originalFilename}</Text>
                </View>
                <Text style={tw`text-subtitle mt-1 text-xs`}>
                  Hash: {att.fileHash.substring(0, HASH_PREVIEW_LENGTH)}...
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Version History */}
        <Pressable
          style={tw`border-background flex-row items-center justify-between border-t py-3`}
          onPress={() => setShowVersions(!showVersions)}
        >
          <Text style={tw`text-subtitle`}>Version History</Text>
          <Text style={tw`text-placeholder`}>
            v{entry.currentVersion?.versionNumber ?? 1} {showVersions ? '▼' : '▶'}
          </Text>
        </Pressable>

        {showVersions && (
          <View style={tw`mb-4`}>
            {versions.map((v) => (
              <View key={v.id} style={tw`border-background border-b py-2`}>
                <Text style={tw`text-foreground`}>Version {v.versionNumber}</Text>
                <Text style={tw`text-subtitle text-sm`}>{v.createdAt.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dispute thread */}
        {dispute && (
          <View style={tw`bg-error/15 mb-4 rounded-xl p-4`}>
            <Text style={tw`text-error mb-2 font-semibold`}>Dispute</Text>
            <Text style={tw`text-error mb-2`}>{dispute.reasonText}</Text>
            {dispute.responses.map((r) => (
              <View key={r.id} style={tw`border-error mt-2 border-t pt-2`}>
                <Text style={tw`text-error`}>{r.responseText}</Text>
                <Text style={tw`text-error mt-1 text-xs`}>{r.createdAt.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        {canAct && (
          <View style={tw`mt-4 flex-row gap-3`}>
            <Pressable style={tw`bg-success flex-1 rounded-xl py-4`} onPress={handleAcknowledge}>
              <Text style={tw`text-center font-semibold text-white`}>Acknowledge</Text>
            </Pressable>
            <Pressable style={tw`bg-error/15 flex-1 rounded-xl py-4`} onPress={showDisputeModal}>
              <Text style={tw`text-error text-center font-semibold`}>Dispute</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Dispute Modal */}
      <Modal
        isVisible={isDisputeVisible}
        onBackButtonPress={hideDisputeModal}
        onBackdropPress={hideDisputeModal}
      >
        <View pointerEvents="box-none" style={tw`flex-1 justify-end`}>
          <View style={tw`bg-surface h-3/4 rounded-t-3xl`}>
            <View style={tw`flex-row items-center justify-between px-4 pb-2 pt-4`}>
              <Pressable onPress={hideDisputeModal}>
                <Text style={tw`text-primary`}>Cancel</Text>
              </Pressable>
              <Text style={tw`font-serif-semibold text-lg`}>Dispute Entry</Text>
              <Pressable onPress={handleDispute}>
                <Text style={tw`text-error font-semibold`}>Submit</Text>
              </Pressable>
            </View>
            <View style={tw`p-4`}>
              <Text style={tw`text-subtitle mb-4`}>
                Explain why you{"'"}re disputing this entry. Your co-parent will see this.
              </Text>
              <TextInput
                autoFocus
                multiline
                placeholder="Reason for dispute..."
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground h-40 rounded-xl border px-4 py-3`}
                textAlignVertical="top"
                value={disputeReason}
                onChangeText={setDisputeReason}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
