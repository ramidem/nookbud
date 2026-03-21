import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Button, EmojiText, PageHeader, Typography } from '@/components';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { CheckCircleIcon, PencilLineIcon, UsersIcon } from '@/icons';
import type { SpacesStackParamList } from '@/navigation/SpacesNavigator';
import { SpaceService, type SpaceWithRole } from '@/services';
import { colors, tw } from '@/tailwind';

type Props = NativeStackScreenProps<SpacesStackParamList, 'Spaces'>;

const ROLE_LABELS: Record<string, string> = {
  editor: 'Editor',
  owner: 'Owner',
  viewer: 'Viewer',
};

const CHECK_SIZE = 20;
const EDIT_ICON_SIZE = 16;

export function SpacesScreen({ navigation }: Props) {
  const twHook = useTw();
  const { activeSpaceId, isAllSpaces, switchToSpace } = useActiveSpace();
  const [spaces, setSpaces] = useState<SpaceWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSpaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SpaceService.listSpaces();
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
              style={tw`border-background flex-row items-center border-b p-4`}
              onPress={() => switchToSpace(null)}
            >
              <View
                style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}
              >
                <UsersIcon height={20} style={tw`text-subtitle`} width={20} />
              </View>
              <View style={tw`flex-1`}>
                <Typography style={tw`text-foreground text-base font-medium`}>
                  All Spaces
                </Typography>
              </View>
              {isAllSpaces && (
                <CheckCircleIcon height={CHECK_SIZE} style={tw`text-primary`} width={CHECK_SIZE} />
              )}
            </Pressable>

            {/* Individual spaces */}
            {spaces.map((space, index) => (
              <Pressable
                key={space.id}
                style={tw`flex-row items-center p-4 ${
                  index < spaces.length - 1 ? 'border-background border-b' : ''
                }`}
                onPress={() => switchToSpace(space.id)}
              >
                <View
                  style={[
                    tw`mr-3 h-10 w-10 items-center justify-center rounded-full`,
                    { backgroundColor: space.color ?? colors.primary },
                  ]}
                >
                  <EmojiText style={tw`text-lg`}>{space.emoji || '🏠'}</EmojiText>
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
                {space.id === activeSpaceId && (
                  <CheckCircleIcon
                    height={CHECK_SIZE}
                    style={tw`text-primary mr-2`}
                    width={CHECK_SIZE}
                  />
                )}
                <Pressable
                  hitSlop={8}
                  onPress={() => navigation.navigate('SpaceDetail', { spaceId: space.id })}
                >
                  <PencilLineIcon
                    height={EDIT_ICON_SIZE}
                    style={tw`text-subtitle`}
                    width={EDIT_ICON_SIZE}
                  />
                </Pressable>
              </Pressable>
            ))}
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
