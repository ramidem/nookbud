import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { and, desc, eq, ne } from 'drizzle-orm';
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PageHeader } from '@/components';
import { db } from '@/database';
import { entries, entryVersions, auditLogs, type AuditLog } from '@/database/schema';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { SendHorizontalIcon } from '@/icons';
import type { CommunicationStackParamList } from '@/navigation/CommunicationNavigator';
import { EntryService, UserService } from '@/services';
import type { CommunicationContent } from '@/types/entry-content.types';

type Props = NativeStackScreenProps<CommunicationStackParamList, 'Communication'>;

type MessageItem = {
  id: string;
  kind: 'message';
  body: string;
  createdBy: string;
  createdAt: Date;
};

type SystemItem = {
  id: string;
  kind: 'system';
  text: string;
  createdAt: Date;
};

type ChatItem = MessageItem | SystemItem;

const SEND_ICON_SIZE = 20;
const HOURS_PER_DAY = 24;
const MS_PER_DAY = 1000 * 60 * 60 * HOURS_PER_DAY;
const COMPOSER_MIN_BOTTOM = 8;

function formatAuditAction(log: AuditLog): string {
  const action = log.action;

  switch (action) {
    case 'create':
      return `Created a ${log.entityType}`;
    case 'accept_invite':
      return 'Joined the space';
    case 'generate_invite':
      return 'Generated an invite';
    case 'assign_role':
      return 'Updated a member role';
    case 'remove_member':
      return 'Removed a member';
    case 'transfer_ownership':
      return 'Transferred ownership';
    case 'archive':
      return `Archived a ${log.entityType}`;
    case 'unarchive':
      return `Unarchived a ${log.entityType}`;
    default:
      return `${action} on ${log.entityType}`;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / MS_PER_DAY);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CommunicationScreen({ navigation }: Props) {
  const tw = useTw();
  const insets = useSafeAreaInsets();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList<ChatItem>>(null);
  const currentUserId = UserService.getCurrentUserId();

  const loadMessages = useCallback(async () => {
    if (!activeSpaceId || isAllSpaces) {
      setItems([]);
      setIsLoading(false);

      return;
    }

    try {
      // Fetch communication entries for the active space
      const entryRows = await db
        .select()
        .from(entries)
        .where(
          and(
            eq(entries.spaceId, activeSpaceId),
            eq(entries.type, 'communication'),
            ne(entries.status, 'soft_deleted'),
          ),
        )
        .orderBy(desc(entries.createdAt));

      const messageItems: ChatItem[] = [];

      for (const entry of entryRows) {
        if (!entry.currentVersionId) continue;

        const [version] = await db
          .select()
          .from(entryVersions)
          .where(eq(entryVersions.id, entry.currentVersionId));

        if (!version) continue;

        const content = JSON.parse(version.contentJson) as CommunicationContent;

        messageItems.push({
          body: content.body,
          createdAt: entry.createdAt,
          createdBy: entry.createdBy,
          id: entry.id,
          kind: 'message',
        });
      }

      // Fetch audit logs for this space (space entity only for system events)
      const auditRows = await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.entityType, 'space'), eq(auditLogs.entityId, activeSpaceId)))
        .orderBy(desc(auditLogs.createdAt));

      const systemItems: ChatItem[] = auditRows.map((log) => ({
        createdAt: log.createdAt,
        id: log.id,
        kind: 'system' as const,
        text: formatAuditAction(log),
      }));

      // Merge and sort descending (newest first) for inverted FlatList
      const merged = [...messageItems, ...systemItems].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      setItems(merged);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [activeSpaceId, isAllSpaces]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadMessages();
    }, [loadMessages]),
  );

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !activeSpaceId || isSending) return;

    setIsSending(true);
    setMessageText('');

    try {
      await EntryService.create({
        content: { body: text, importance: 'normal', subject: '' },
        spaceId: activeSpaceId,
        type: 'communication',
      });

      await loadMessages();
    } catch {
      // Restore text on failure
      setMessageText(text);
    } finally {
      setIsSending(false);
    }
  };

  // No active space or All Spaces
  if (!activeSpaceId || isAllSpaces) {
    return (
      <View style={tw`bg-background flex-1`}>
        <PageHeader leftAction={<BackButton onPress={() => navigation.goBack()} />} title="Messages" />
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Text style={tw`text-subtitle text-center text-base`}>
            Select a specific space to view messages.
          </Text>
        </View>
      </View>
    );
  }

  const spaceName = activeSpace?.name ?? 'Messages';

  const renderItem = ({ index, item }: { item: ChatItem; index: number }) => {
    // Date separator logic — items are sorted newest-first (inverted list)
    // In inverted FlatList, visually "next" item is at index+1 (which is older)
    const prevItem = index < items.length - 1 ? items[index + 1] : null;
    const currentDate = formatDateSeparator(item.createdAt);
    const prevDate = prevItem ? formatDateSeparator(prevItem.createdAt) : null;
    const showDateSeparator = currentDate !== prevDate;

    return (
      <View>
        {showDateSeparator && (
          <View style={tw`items-center py-3`}>
            <Text style={tw`text-placeholder text-xs font-medium`}>{currentDate}</Text>
          </View>
        )}
        {item.kind === 'system' ? (
          <View style={tw`items-center px-4 py-2`}>
            <View style={tw`rounded-full bg-neutral-200 px-4 py-1.5`}>
              <Text style={tw`text-subtitle text-xs`}>{item.text}</Text>
            </View>
          </View>
        ) : (
          <MessageBubble
            body={item.body}
            createdAt={item.createdAt}
            isOwn={item.createdBy === currentUserId}
          />
        )}
      </View>
    );
  };

  return (
    <View style={tw`bg-background flex-1`}>
      <PageHeader leftAction={<BackButton onPress={() => navigation.goBack()} />} title={spaceName} />

      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0} style={tw`flex-1`}>
        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color={tw.color('primary')} size="large" />
          </View>
        ) : items.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center px-8`}>
            <Text style={tw`text-subtitle text-center text-base`}>
              No messages yet. Start the conversation.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            inverted
            contentContainerStyle={tw`px-4 py-2`}
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}

        {/* Composer */}
        <View
          style={[
            tw`bg-surface border-divider flex-row items-end border-t px-4 py-2`,
            { paddingBottom: Math.max(insets.bottom, COMPOSER_MIN_BOTTOM) },
          ]}
        >
          <TextInput
            multiline
            editable={!isSending}
            placeholder="Type a message..."
            placeholderTextColor={tw.color('placeholder')}
            style={tw`text-foreground mr-3 max-h-24 min-h-[40px] flex-1 rounded-2xl bg-neutral-100 px-4 py-2.5 text-base`}
            value={messageText}
            onChangeText={setMessageText}
          />
          <Pressable
            disabled={!messageText.trim() || isSending}
            style={tw`mb-1 h-10 w-10 items-center justify-center rounded-full ${
              messageText.trim() ? 'bg-primary' : 'bg-neutral-300'
            }`}
            onPress={handleSend}
          >
            <SendHorizontalIcon
              height={SEND_ICON_SIZE}
              style={tw`text-white`}
              width={SEND_ICON_SIZE}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({
  body,
  createdAt,
  isOwn,
}: {
  body: string;
  createdAt: Date;
  isOwn: boolean;
}) {
  const tw = useTw();

  return (
    <View style={tw`px-4 py-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      <View
        style={tw`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isOwn ? 'bg-primary rounded-br-sm' : 'bg-surface rounded-bl-sm'
        }`}
      >
        <Text style={tw`text-base ${isOwn ? 'text-white' : 'text-foreground'}`}>{body}</Text>
      </View>
      <Text style={tw`text-placeholder mt-1 px-1 text-xs`}>{formatTime(createdAt)}</Text>
    </View>
  );
}
