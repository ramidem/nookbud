import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, TextInput, View } from 'react-native';

import {
  Alert,
  BottomSheet,
  Button,
  EmojiText,
  ScreenContainer,
  ScreenHeader,
  SelectDropdown,
  Toast,
  Typography,
  useBottomSheet,
} from '@/components';
import {
  SPACE_MEMBER_LABELS,
  SPACE_MEMBER_LABEL_DISPLAY,
  type SpaceMemberLabel,
  type SpaceRole,
} from '@/database/schema';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ChevronRightIcon,
  PencilLineIcon,
  UsersIcon,
} from '@/icons';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import { SpaceMemberService, SpaceService, type SpaceDetails, type SpaceInvite } from '@/services';
import { useLocalStorageStore } from '@/stores';
import { colors, defaultInputContainerStyle, defaultInputTextStyle, tw } from '@/tailwind';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SpaceDetail'>;

const COPY_FEEDBACK_DURATION = 2000;

const EMOJI_OPTIONS = ['🏠', '👨‍👩‍👧', '🌿', '⭐', '🌸', '🏡', '💙', '🌻'];
const COLOR_OPTIONS = ['#6F8F7B', '#C97C5D', '#D8A7A0', '#7B9EC4', '#9B8EC4', '#C4A97B'];
const COLOR_SWATCH_SIZE = 36;
const COLOR_SWATCH_BORDER_PADDING = 4;
const COLOR_SWATCH_BORDER_SIZE = COLOR_SWATCH_SIZE + COLOR_SWATCH_BORDER_PADDING;

const INVITE_ROLES: Array<{ role: SpaceRole; label: string; description: string }> = [
  { description: 'Can add and view care records', label: 'Editor', role: 'editor' },
  { description: 'Can view and export records only', label: 'Viewer', role: 'viewer' },
];

const ROLE_LABELS: Record<string, string> = {
  editor: 'Editor',
  owner: 'Owner',
  viewer: 'Viewer',
};

export function SpaceDetailScreen({ navigation, route }: Props) {
  const { spaceId } = route.params;

  const [space, setSpace] = useState<SpaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Appearance editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Invite sheet
  const inviteSheet = useBottomSheet();
  const [inviteRole, setInviteRole] = useState<SpaceRole>('editor');
  const [inviteLabel, setInviteLabel] = useState<SpaceMemberLabel | undefined>(undefined);
  const [invite, setInvite] = useState<SpaceInvite | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const labelOptions = useMemo(
    () => SPACE_MEMBER_LABELS.map((l) => ({ id: l, label: SPACE_MEMBER_LABEL_DISPLAY[l] })),
    [],
  );

  // Role change sheet
  const roleSheet = useBottomSheet();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const isOwner = space?.userRole === 'owner';

  const loadSpace = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SpaceService.getSpaceById(spaceId);
      setSpace(result);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [spaceId]);

  useFocusEffect(
    useCallback(() => {
      loadSpace();
    }, [loadSpace]),
  );

  // --- Appearance ---

  const handleStartEditName = () => {
    if (!isOwner || !space) return;
    setEditName(space.name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim() || !space) return;
    setIsSavingName(true);
    try {
      await SpaceService.renameSpace(spaceId, editName.trim());
      await loadSpace();
      setIsEditingName(false);
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to rename Space',
        title: 'Rename Failed',
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangeEmoji = async (emoji: string) => {
    if (!isOwner) return;
    try {
      await SpaceService.updateSpaceAppearance(spaceId, emoji, undefined);
      await loadSpace();
    } catch {
      // Silent fail
    }
  };

  const handleChangeColor = async (color: string) => {
    if (!isOwner) return;
    try {
      await SpaceService.updateSpaceAppearance(spaceId, undefined, color);
      await loadSpace();
    } catch {
      // Silent fail
    }
  };

  // --- Invite ---

  const handleOpenInvite = () => {
    setInvite(null);
    setCopied(false);
    setInviteRole('editor');
    setInviteLabel(undefined);
    inviteSheet.expandSheet();
  };

  const handleSelectInviteLabel = (id: string) => {
    setInviteLabel(id === inviteLabel ? undefined : (id as SpaceMemberLabel));
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await SpaceMemberService.generateInviteCode(spaceId, inviteRole, inviteLabel);
      setInvite(result);
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to generate code',
        title: 'Invite Failed',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!invite) return;
    Clipboard.setString(invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  };

  const handleShareInvite = async () => {
    if (!invite) return;
    try {
      await Share.share({
        message: `Join my Space on CoParent! Use code: ${invite.code}\n\nOr tap: ${invite.deepLink}`,
      });
    } catch {
      // User cancelled
    }
  };

  // --- Role change ---

  const handleOpenRoleSheet = (memberId: string) => {
    setSelectedMemberId(memberId);
    roleSheet.expandSheet();
  };

  const handleAssignRole = async (newRole: SpaceRole) => {
    if (!selectedMemberId) return;
    try {
      await SpaceMemberService.assignRole(spaceId, selectedMemberId, { role: newRole });
      roleSheet.closeSheet();
      await loadSpace();
      Toast.success('Role updated');
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to change role',
        title: 'Role Change Failed',
      });
    }
  };

  // --- Remove member ---

  const handleRemoveMember = (memberId: string, name: string) => {
    Alert.warning({
      actions: [
        { label: 'Cancel', variant: 'cancel' },
        {
          label: 'Remove',
          onPress: async () => {
            try {
              await SpaceMemberService.removeMember(spaceId, memberId);
              await loadSpace();
              Toast.success(`${name} removed`);
            } catch (err) {
              Alert.error({
                message: err instanceof Error ? err.message : 'Failed to remove member',
                title: 'Remove Failed',
              });
            }
          },
        },
      ],
      message: `Remove ${name} from this Space? They will lose access to all records.`,
      title: 'Remove Member',
    });
  };

  // --- Archive / Unarchive ---

  const handleArchiveSpace = () => {
    Alert.warning({
      actions: [
        { label: 'Cancel', variant: 'cancel' },
        {
          label: 'Archive',
          onPress: async () => {
            try {
              await SpaceService.archiveSpace(spaceId);
              Toast.success('Space archived');
              navigation.goBack();
            } catch (err) {
              Alert.error({
                message: err instanceof Error ? err.message : 'Failed to archive Space',
                title: 'Archive Failed',
              });
            }
          },
        },
      ],
      message:
        'This Space will be hidden from your Space switcher. All records are preserved and you can unarchive at any time.',
      title: 'Archive Space',
    });
  };

  const handleUnarchiveSpace = async () => {
    try {
      await SpaceService.unarchiveSpace(spaceId);
      Toast.success('Space unarchived');
      await loadSpace();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to unarchive Space',
        title: 'Unarchive Failed',
      });
    }
  };

  // --- Leave / Delete ---

  const handleLeaveSpace = () => {
    Alert.warning({
      actions: [
        { label: 'Cancel', variant: 'cancel' },
        {
          label: 'Leave',
          onPress: async () => {
            try {
              await SpaceService.leaveSpace(spaceId);
              Toast.success('Left Space');
              navigation.goBack();
            } catch (err) {
              Alert.error({
                message: err instanceof Error ? err.message : 'Failed to leave Space',
                title: 'Leave Failed',
              });
            }
          },
        },
      ],
      message: 'You will lose access to all records in this Space.',
      title: 'Leave Space',
    });
  };

  const handleDeleteSpace = () => {
    Alert.warning({
      actions: [
        { label: 'Cancel', variant: 'cancel' },
        {
          label: 'Delete',
          onPress: async () => {
            try {
              await SpaceService.deleteSpace(spaceId);
              useLocalStorageStore.getState().setActiveSpaceId(null);
              Toast.success('Space deleted');
              navigation.goBack();
            } catch (err) {
              Alert.error({
                message: err instanceof Error ? err.message : 'Failed to delete Space',
                title: 'Delete Failed',
              });
            }
          },
        },
      ],
      message:
        'This will remove all members from this Space. All records will be preserved in the audit log.',
      title: 'Delete Space',
    });
  };

  if (isLoading || !space) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Space" />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title={space.name} />

      <ScrollView contentContainerStyle={tw`px-4 pb-8 pt-4`}>
        {/* Space Appearance (owner only) */}
        {isOwner && (
          <View style={tw`bg-surface mb-4 rounded-xl`}>
            <View style={tw`border-divider border-b px-4 py-3`}>
              <Typography style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
                Appearance
              </Typography>
            </View>

            {/* Name */}
            <View style={tw`border-divider border-b p-4`}>
              {isEditingName ? (
                <View style={tw`flex-row items-center gap-2`}>
                  <TextInput
                    autoFocus
                    autoCapitalize="words"
                    placeholderTextColor={colors.placeholder}
                    style={[defaultInputContainerStyle, ...defaultInputTextStyle, tw`mr-2 flex-1`]}
                    value={editName}
                    onChangeText={setEditName}
                    onSubmitEditing={handleSaveName}
                  />
                  <Pressable onPress={handleSaveName}>
                    {isSavingName ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Typography style={tw`text-primary font-semibold`}>Save</Typography>
                    )}
                  </Pressable>
                  <Pressable onPress={() => setIsEditingName(false)}>
                    <Typography style={tw`text-subtitle`}>Cancel</Typography>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={tw`flex-row items-center`} onPress={handleStartEditName}>
                  <View
                    style={[
                      tw`mr-3 h-12 w-12 items-center justify-center rounded-full`,
                      { backgroundColor: space.color ?? colors.primary },
                    ]}
                  >
                    <EmojiText style={tw`text-2xl`}>{space.emoji ?? '🏠'}</EmojiText>
                  </View>
                  <Typography style={tw`text-foreground flex-1 text-lg font-medium`}>
                    {space.name}
                  </Typography>
                  <PencilLineIcon height={18} style={tw`text-subtitle`} width={18} />
                </Pressable>
              )}
            </View>

            {/* Emoji picker */}
            <View style={tw`border-divider border-b p-4`}>
              <Typography style={tw`text-subtitle mb-2 text-sm font-medium`}>Icon</Typography>
              <ScrollView
                horizontal
                contentContainerStyle={tw`gap-2`}
                showsHorizontalScrollIndicator={false}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    style={tw`h-10 w-10 items-center justify-center rounded-full ${
                      space.emoji === emoji ? 'bg-primary' : 'bg-background'
                    }`}
                    onPress={() => handleChangeEmoji(emoji)}
                  >
                    <EmojiText style={tw`text-xl`}>{emoji}</EmojiText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Color picker */}
            <View style={tw`p-4`}>
              <Typography style={tw`text-subtitle mb-2 text-sm font-medium`}>Color</Typography>
              <View style={tw`flex-row gap-3`}>
                {COLOR_OPTIONS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      tw`items-center justify-center rounded-full ${
                        space.color === color
                          ? 'border-foreground border-2'
                          : 'border-2 border-transparent'
                      }`,
                      { height: COLOR_SWATCH_BORDER_SIZE, width: COLOR_SWATCH_BORDER_SIZE },
                    ]}
                    onPress={() => handleChangeColor(color)}
                  >
                    <View
                      style={[
                        tw`rounded-full`,
                        {
                          backgroundColor: color,
                          height: COLOR_SWATCH_SIZE,
                          width: COLOR_SWATCH_SIZE,
                        },
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Members Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Typography style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
              Members
            </Typography>
          </View>

          {space.members.map((member, index) => {
            const isSelf = member.userId === space.createdBy && member.role === 'owner';
            const isLastMember = index === space.members.length - 1;

            return (
              <View
                key={member.id}
                style={tw`p-4 ${!isLastMember ? 'border-divider border-b' : ''}`}
              >
                <View style={tw`flex-row items-center`}>
                  <View
                    style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}
                  >
                    <Typography style={tw`text-foreground font-semibold`}>
                      {member.user.displayName.charAt(0).toUpperCase()}
                    </Typography>
                  </View>
                  <View style={tw`flex-1`}>
                    <Typography style={tw`text-foreground text-base font-medium`}>
                      {member.user.displayName}
                    </Typography>
                    <View style={tw`mt-0.5 flex-row items-center gap-2`}>
                      {member.label && (
                        <View style={tw`bg-accent-soft/20 rounded-full px-2 py-0.5`}>
                          <Typography style={tw`text-accent text-xs font-medium`}>
                            {SPACE_MEMBER_LABEL_DISPLAY[member.label as SpaceMemberLabel]}
                          </Typography>
                        </View>
                      )}
                      <View style={tw`bg-primary/15 rounded-full px-2 py-0.5`}>
                        <Typography style={tw`text-primary text-xs font-medium`}>
                          {ROLE_LABELS[member.role] ?? member.role}
                        </Typography>
                      </View>
                      {member.joinedAt && (
                        <Typography style={tw`text-subtitle text-xs`}>
                          Joined {member.joinedAt.toLocaleDateString()}
                        </Typography>
                      )}
                    </View>
                  </View>

                  {/* Owner actions for non-self members */}
                  {isOwner && !isSelf && member.role !== 'owner' && (
                    <Pressable onPress={() => handleOpenRoleSheet(member.userId)}>
                      <ChevronRightIcon height={16} style={tw`text-placeholder`} width={16} />
                    </Pressable>
                  )}
                </View>

                {/* Owner action buttons for non-self members */}
                {isOwner && !isSelf && member.role !== 'owner' && (
                  <View style={tw`pl-13 mt-3 flex-row gap-2`}>
                    <Pressable
                      style={tw`rounded-lg bg-neutral-200 px-3 py-1.5`}
                      onPress={() => handleOpenRoleSheet(member.userId)}
                    >
                      <Typography style={tw`text-foreground text-xs font-medium`}>
                        Change Role
                      </Typography>
                    </Pressable>
                    <Pressable
                      style={tw`bg-error/10 rounded-lg px-3 py-1.5`}
                      onPress={() => handleRemoveMember(member.userId, member.user.displayName)}
                    >
                      <Typography style={tw`text-error text-xs font-medium`}>Remove</Typography>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          {/* Invite member button (owner only) */}
          {isOwner && (
            <Pressable
              style={tw`border-divider flex-row items-center justify-center border-t p-4`}
              onPress={handleOpenInvite}
            >
              <UsersIcon height={16} style={tw`text-primary mr-2`} width={16} />
              <Typography style={tw`text-primary font-medium`}>Invite Member</Typography>
            </Pressable>
          )}
        </View>

        {/* Children Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Typography style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
              Children
            </Typography>
          </View>

          {space.children.length === 0 ? (
            <View style={tw`p-4`}>
              <Typography style={tw`text-subtitle text-sm`}>No children in this Space</Typography>
            </View>
          ) : (
            space.children.map((child, index) => (
              <View
                key={child.id}
                style={tw`flex-row items-center p-4 ${
                  index < space.children.length - 1 ? 'border-divider border-b' : ''
                }`}
              >
                <View
                  style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}
                >
                  <Typography style={tw`text-lg`}>👶</Typography>
                </View>
                <View style={tw`flex-1`}>
                  <Typography style={tw`text-foreground text-base font-medium`}>
                    {child.name}
                  </Typography>
                  {child.dateOfBirth && (
                    <Typography style={tw`text-subtitle text-sm`}>
                      DOB: {child.dateOfBirth.toLocaleDateString()}
                    </Typography>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Danger Zone */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Typography style={tw`text-error text-sm font-medium uppercase tracking-wide`}>
              Danger Zone
            </Typography>
          </View>

          {isOwner && !space.archivedAt && (
            <Pressable
              style={tw`border-divider flex-row items-center border-b p-4`}
              onPress={handleArchiveSpace}
            >
              <ArchiveIcon height={18} style={tw`text-warning mr-3`} width={18} />
              <View style={tw`flex-1`}>
                <Typography style={tw`text-foreground font-medium`}>Archive Space</Typography>
                <Typography style={tw`text-subtitle mt-1 text-sm`}>
                  Hide from switcher — all records preserved
                </Typography>
              </View>
            </Pressable>
          )}

          {isOwner && space.archivedAt && (
            <Pressable
              style={tw`border-divider flex-row items-center border-b p-4`}
              onPress={handleUnarchiveSpace}
            >
              <ArchiveRestoreIcon height={18} style={tw`text-primary mr-3`} width={18} />
              <View style={tw`flex-1`}>
                <Typography style={tw`text-primary font-medium`}>Unarchive Space</Typography>
                <Typography style={tw`text-subtitle mt-1 text-sm`}>
                  Restore this Space to the switcher
                </Typography>
              </View>
            </Pressable>
          )}

          {isOwner ? (
            <Pressable style={tw`p-4`} onPress={handleDeleteSpace}>
              <Typography style={tw`text-error font-medium`}>Delete Space</Typography>
              <Typography style={tw`text-subtitle mt-1 text-sm`}>
                All records will be preserved in the audit log
              </Typography>
            </Pressable>
          ) : (
            <Pressable style={tw`p-4`} onPress={handleLeaveSpace}>
              <Typography style={tw`text-error font-medium`}>Leave Space</Typography>
              <Typography style={tw`text-subtitle mt-1 text-sm`}>
                You will lose access to all records
              </Typography>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Invite Member Bottom Sheet */}
      <BottomSheet
        backgroundStyle={tw`bg-sheet`}
        sheetRef={inviteSheet.sheetRef}
        snapPoints={['65%']}
      >
        <View style={tw`p-6`}>
          <Typography
            style={tw`font-serif-semibold text-foreground mb-4 text-center text-lg`}
            variant="heading"
          >
            Invite Member
          </Typography>

          {!invite ? (
            <>
              <Typography style={tw`text-subtitle mb-3 text-sm font-medium`}>
                Select a role
              </Typography>
              {INVITE_ROLES.map((item) => (
                <Pressable
                  key={item.role}
                  style={tw`mb-2 rounded-xl border p-4 ${
                    inviteRole === item.role ? 'border-primary bg-primary/5' : 'border-divider'
                  }`}
                  onPress={() => setInviteRole(item.role)}
                >
                  <Typography style={tw`text-foreground text-base font-medium`}>
                    {item.label}
                  </Typography>
                  <Typography style={tw`text-subtitle mt-0.5 text-sm`}>
                    {item.description}
                  </Typography>
                </Pressable>
              ))}

              <View style={tw`mb-2 mt-2`}>
                <SelectDropdown
                  label="Their relationship (optional)"
                  options={labelOptions}
                  placeholder="None"
                  selectedId={inviteLabel}
                  onSelect={handleSelectInviteLabel}
                />
              </View>

              <Button
                buttonStyle={tw`bg-primary mt-4 rounded-xl py-4`}
                isLoading={isGenerating}
                textStyle={tw`text-base`}
                title="Generate Invite Code"
                onPress={handleGenerateCode}
              />
            </>
          ) : (
            <View style={tw`items-center`}>
              <Typography style={tw`text-subtitle mb-2 text-sm`}>
                Share this code with your invitee
              </Typography>

              <View style={tw`mb-4 w-full rounded-xl bg-neutral-200 p-6`}>
                <Typography
                  style={tw`text-foreground text-center text-3xl font-bold tracking-widest`}
                >
                  {invite.code}
                </Typography>
              </View>

              <Typography style={tw`text-subtitle mb-6 text-center text-xs`}>
                Role: {ROLE_LABELS[invite.role]}
                {invite.label ? ` · ${SPACE_MEMBER_LABEL_DISPLAY[invite.label]}` : ''} — Expires in
                7 days
              </Typography>

              <View style={tw`w-full flex-row gap-3`}>
                <Button
                  style={tw`flex-1`}
                  title={copied ? 'Copied!' : 'Copy Code'}
                  variant="outlined"
                  onPress={handleCopyCode}
                />
                <Button style={tw`flex-1`} title="Share" onPress={handleShareInvite} />
              </View>
            </View>
          )}
        </View>
      </BottomSheet>

      {/* Change Role Bottom Sheet */}
      <BottomSheet
        enableDynamicSizing
        backgroundStyle={tw`bg-sheet`}
        sheetRef={roleSheet.sheetRef}
        snapPoints={['50%']}
      >
        <View style={tw`p-6`}>
          <Typography
            style={tw`font-serif-semibold text-foreground mb-4 text-center text-lg`}
            variant="heading"
          >
            Change Role
          </Typography>

          {INVITE_ROLES.map((item) => (
            <Pressable
              key={item.role}
              style={tw`border-divider mb-2 rounded-xl border p-4`}
              onPress={() => handleAssignRole(item.role)}
            >
              <Typography style={tw`text-foreground text-base font-medium`}>
                {item.label}
              </Typography>
              <Typography style={tw`text-subtitle mt-0.5 text-sm`}>{item.description}</Typography>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}
