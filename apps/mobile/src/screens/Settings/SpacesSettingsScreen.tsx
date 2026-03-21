import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import {
  Alert,
  Button,
  EmojiText,
  ScreenContainer,
  ScreenHeader,
  Toast,
  Typography,
} from '@/components';
import { ArchiveRestoreIcon, ChevronRightIcon } from '@/icons';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import { SpaceService, type SpaceWithRole } from '@/services';
import { colors, tw } from '@/tailwind';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SpacesSettings'>;

const ROLE_LABELS: Record<string, string> = {
  editor: 'Editor',
  owner: 'Owner',
  viewer: 'Viewer',
};

export function SpacesSettingsScreen({ navigation }: Props) {
  const [spaces, setSpaces] = useState<SpaceWithRole[]>([]);
  const [archivedSpaces, setArchivedSpaces] = useState<SpaceWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSpaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await SpaceService.listSpaces({ includeArchived: true });
      setSpaces(all.filter((s) => !s.archivedAt));
      setArchivedSpaces(all.filter((s) => s.archivedAt));
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSpaces();
    }, [loadSpaces]),
  );

  const handleUnarchive = async (spaceId: string) => {
    try {
      await SpaceService.unarchiveSpace(spaceId);
      Toast.success('Space unarchived');
      await loadSpaces();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to unarchive Space',
        title: 'Unarchive Failed',
      });
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="My Spaces" />

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <View style={tw`flex-1 px-4 pt-4`}>
          {spaces.length === 0 ? (
            <View style={tw`bg-surface items-center rounded-xl p-8`}>
              <Typography style={tw`text-subtitle text-center text-base`}>
                No Spaces yet. Create one to get started.
              </Typography>
            </View>
          ) : (
            <View style={tw`bg-surface mb-4 overflow-hidden rounded-xl`}>
              {spaces.map((space, index) => (
                <Pressable
                  key={space.id}
                  style={tw`flex-row items-center p-4 ${
                    index < spaces.length - 1 ? 'border-background border-b' : ''
                  }`}
                  onPress={() => navigation.navigate('SpaceDetail', { spaceId: space.id })}
                >
                  <View
                    style={[
                      tw`mr-3 h-10 w-10 items-center justify-center rounded-full`,
                      { backgroundColor: space.color ?? colors.primary },
                    ]}
                  >
                    <EmojiText style={tw`text-lg`}>{space.emoji ?? '🏠'}</EmojiText>
                  </View>
                  <View style={tw`flex-1`}>
                    <Typography style={tw`text-foreground text-base font-medium`}>
                      {space.name}
                    </Typography>
                    <View style={tw`mt-0.5 flex-row items-center gap-2`}>
                      <Typography style={tw`text-subtitle text-sm`}>
                        {space.memberCount} {space.memberCount === 1 ? 'member' : 'members'}
                      </Typography>
                      <View style={tw`bg-primary/15 rounded-full px-2 py-0.5`}>
                        <Typography style={tw`text-primary text-xs font-medium`}>
                          {ROLE_LABELS[space.userRole] ?? space.userRole}
                        </Typography>
                      </View>
                    </View>
                  </View>
                  <ChevronRightIcon height={16} style={tw`text-placeholder`} width={16} />
                </Pressable>
              ))}
            </View>
          )}

          <Button
            buttonStyle={tw`bg-primary rounded-xl py-4`}
            textStyle={tw`text-base`}
            title="Create New Space"
            onPress={() => navigation.navigate('CreateSpaceSettings')}
          />

          {/* Archived Spaces */}
          {archivedSpaces.length > 0 && (
            <View style={tw`mt-6`}>
              <Typography
                style={tw`text-subtitle mb-3 text-sm font-medium uppercase tracking-wide`}
              >
                Archived Spaces
              </Typography>
              <View style={tw`bg-surface overflow-hidden rounded-xl opacity-70`}>
                {archivedSpaces.map((space, index) => (
                  <View
                    key={space.id}
                    style={tw`flex-row items-center p-4 ${
                      index < archivedSpaces.length - 1 ? 'border-background border-b' : ''
                    }`}
                  >
                    <View
                      style={[
                        tw`mr-3 h-10 w-10 items-center justify-center rounded-full`,
                        { backgroundColor: space.color ?? colors.primary },
                      ]}
                    >
                      <EmojiText style={tw`text-lg`}>{space.emoji ?? '🏠'}</EmojiText>
                    </View>
                    <View style={tw`flex-1`}>
                      <Typography style={tw`text-foreground text-base font-medium`}>
                        {space.name}
                      </Typography>
                      <Typography style={tw`text-subtitle text-sm`}>Archived</Typography>
                    </View>
                    {space.userRole === 'owner' && (
                      <Pressable
                        style={tw`flex-row items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5`}
                        onPress={() => handleUnarchive(space.id)}
                      >
                        <ArchiveRestoreIcon height={14} style={tw`text-primary`} width={14} />
                        <Typography style={tw`text-primary text-xs font-medium`}>
                          Unarchive
                        </Typography>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
