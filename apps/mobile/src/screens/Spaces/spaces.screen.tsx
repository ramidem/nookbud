import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Button, PageHeader, Typography } from '@/components';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { ArchiveIcon, UsersIcon } from '@/icons';
import type { SpacesStackParamList } from '@/navigation/SpacesNavigator';
import { SpaceService, type SpaceWithRole } from '@/services';
import { colors, tw } from '@/tailwind';

type Props = NativeStackScreenProps<SpacesStackParamList, 'Spaces'>;

const ROLE_LABELS: Record<string, string> = {
  editor: 'Editor',
  owner: 'Owner',
  viewer: 'Viewer',
};

const ARCHIVE_ICON_SIZE = 14;

export function SpacesScreen({ navigation }: Props) {
  const twHook = useTw();
  const { activeSpaceId, isAllSpaces, switchToSpace } = useActiveSpace();
  const [spaces, setSpaces] = useState<SpaceWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSpaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SpaceService.listSpaces({ includeArchived: true });
      setSpaces(result);
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

  return (
    <View style={twHook`bg-background flex-1`}>
      <PageHeader title="Spaces" />

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={tw`px-4 pb-8 pt-4`}>
          <View style={tw`bg-surface overflow-hidden rounded-xl`}>
            {/* All Spaces row */}
            <Pressable
              style={[
                tw`border-background flex-row items-center border-b p-4`,
                isAllSpaces && tw`bg-primary/15`,
              ]}
              onPress={() => switchToSpace(null)}
            >
              <View
                style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}
              >
                <UsersIcon height={20} style={tw`text-subtitle`} width={20} />
              </View>
              <View style={tw`flex-1`}>
                <Typography
                  style={tw`text-base font-medium ${isAllSpaces ? 'text-primary' : 'text-foreground'}`}
                >
                  All Spaces
                </Typography>
              </View>
            </Pressable>

            {/* Individual spaces */}
            {spaces.map((space, index) => {
              const isArchived = !!space.archivedAt;
              const isActive = space.id === activeSpaceId;

              return (
                <Pressable
                  key={space.id}
                  style={[
                    tw`flex-row items-center p-4 ${
                      index < spaces.length - 1 ? 'border-background border-b' : ''
                    }`,
                    isActive && tw`bg-primary/15`,
                    isArchived && { opacity: 0.6 },
                  ]}
                  onPress={() => navigation.navigate('SpaceDetail', { spaceId: space.id })}
                >
                  <View
                    style={[
                      tw`mr-3 h-10 w-10 items-center justify-center rounded-full`,
                      { backgroundColor: space.color ?? colors.primary },
                    ]}
                  >
                    <Typography style={tw`text-white text-sm font-semibold`}>
                      {space.name.trim().charAt(0).toUpperCase()}
                    </Typography>
                  </View>
                  <View style={tw`flex-1`}>
                    <Typography
                      style={tw`text-base font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}
                    >
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
                      {isArchived && (
                        <View
                          style={tw`flex-row items-center gap-1 rounded-full bg-neutral-200 px-2 py-0.5`}
                        >
                          <ArchiveIcon
                            height={ARCHIVE_ICON_SIZE}
                            style={tw`text-subtitle`}
                            width={ARCHIVE_ICON_SIZE}
                          />
                          <Typography style={tw`text-subtitle text-xs font-medium`}>
                            Archived
                          </Typography>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Button
            buttonStyle={tw`bg-primary mt-4 rounded-xl py-4`}
            textStyle={tw`text-base`}
            title="Create New Space"
            onPress={() => navigation.navigate('CreateSpace')}
          />
        </ScrollView>
      )}
    </View>
  );
}
