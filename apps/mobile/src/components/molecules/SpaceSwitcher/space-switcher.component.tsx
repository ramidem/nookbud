import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, View } from 'react-native';

import { BottomSheet, Divider, Typography, useBottomSheet } from '@/components';
import { useActiveSpace } from '@/hooks';
import { CheckCircleIcon, ChevronDownIcon, UsersIcon } from '@/icons';
import { SpaceService, type SpaceWithRole } from '@/services';
import { tw } from '@/tailwind';
import { DefaultComponentProps } from '@/types';

type Props = DefaultComponentProps & {
  showTrigger?: boolean;
};

export type SpaceSwitcherRef = {
  expand: () => void;
};

const ICON_SIZE = 20;
const EMOJI_SIZE = 28;
const CHECK_SIZE = 20;
const CHEVRON_SIZE = 16;
const ALL_SPACES_ICON_SIZE = 16;

const ROLE_LABELS: Record<string, string> = {
  editor: 'Editor',
  owner: 'Owner',
  viewer: 'Viewer',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <View style={tw`bg-background rounded-full px-2 py-0.5`}>
      <Typography style={tw`text-subtitle text-xs`}>{ROLE_LABELS[role] ?? role}</Typography>
    </View>
  );
}

function SpaceRow({
  isActive,
  onPress,
  space,
}: {
  isActive: boolean;
  onPress: () => void;
  space: SpaceWithRole;
}) {
  return (
    <Pressable style={tw`flex-row items-center px-4 py-3`} onPress={onPress}>
      <Typography style={tw`text-[${EMOJI_SIZE}px] mr-3`}>{space.emoji || '🏠'}</Typography>
      <View style={tw`flex-1`}>
        <Typography numberOfLines={1} style={tw`text-foreground text-base font-medium`}>
          {space.name}
        </Typography>
        <View style={tw`mt-0.5 flex-row items-center gap-2`}>
          <Typography style={tw`text-subtitle text-xs`}>
            {space.memberCount} {space.memberCount === 1 ? 'member' : 'members'}
          </Typography>
          <RoleBadge role={space.userRole} />
        </View>
      </View>
      {isActive && (
        <CheckCircleIcon height={CHECK_SIZE} style={tw`text-primary`} width={CHECK_SIZE} />
      )}
    </Pressable>
  );
}

export const SpaceSwitcher = forwardRef<SpaceSwitcherRef, Props>((props, ref) => {
  const { showTrigger = true, style } = props;
  const { activeSpace, activeSpaceId, isAllSpaces, switchToSpace } = useActiveSpace();
  const { closeSheet, expandSheet, sheetRef } = useBottomSheet();
  const [spaces, setSpaces] = useState<SpaceWithRole[]>([]);

  useImperativeHandle(ref, () => ({
    expand: () => {
      loadSpaces();
      expandSheet();
    },
  }));

  const loadSpaces = useCallback(async () => {
    const result = await SpaceService.listSpaces();
    setSpaces(result);
  }, []);

  // Load spaces on mount
  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  const handleOpenSheet = useCallback(() => {
    loadSpaces();
    expandSheet();
  }, [expandSheet, loadSpaces]);

  const handleSelectSpace = useCallback(
    (spaceId: string | null) => {
      switchToSpace(spaceId);
      closeSheet();
    },
    [closeSheet, switchToSpace],
  );

  return (
    <>
      {showTrigger && (
        <Pressable style={[tw`flex-row items-center gap-1.5`, style]} onPress={handleOpenSheet}>
          {isAllSpaces ? (
            <UsersIcon height={ICON_SIZE} style={tw`text-primary`} width={ICON_SIZE} />
          ) : (
            <Typography style={tw`text-lg`}>{activeSpace?.emoji || '🏠'}</Typography>
          )}
          <Typography
            numberOfLines={1}
            style={tw`font-serif-semibold text-foreground max-w-[180px] text-lg`}
            variant="heading"
          >
            {isAllSpaces ? 'All Spaces' : activeSpace?.name ?? 'Select Space'}
          </Typography>
          <ChevronDownIcon height={CHEVRON_SIZE} style={tw`text-subtitle`} width={CHEVRON_SIZE} />
        </Pressable>
      )}

      <BottomSheet backgroundStyle={tw`bg-sheet`} sheetRef={sheetRef} snapPoints={['50%', '85%']}>
        <View style={tw`pb-8`}>
          <Typography
            style={tw`font-serif-semibold text-foreground px-4 pb-3 text-xl`}
            variant="heading"
          >
            Switch Space
          </Typography>

          {/* All Spaces row */}
          <Pressable
            style={tw`flex-row items-center px-4 py-3`}
            onPress={() => handleSelectSpace(null)}
          >
            <View style={tw`mr-3 h-7 w-7 items-center justify-center rounded-full bg-neutral-200`}>
              <UsersIcon
                height={ALL_SPACES_ICON_SIZE}
                style={tw`text-subtitle`}
                width={ALL_SPACES_ICON_SIZE}
              />
            </View>
            <View style={tw`flex-1`}>
              <Typography style={tw`text-foreground text-base font-medium`}>All Spaces</Typography>
            </View>
            {isAllSpaces && (
              <CheckCircleIcon height={CHECK_SIZE} style={tw`text-primary`} width={CHECK_SIZE} />
            )}
          </Pressable>

          <Divider style={tw`my-1`} />

          {/* Individual spaces */}
          {spaces.map((space) => (
            <SpaceRow
              key={space.id}
              isActive={space.id === activeSpaceId}
              space={space}
              onPress={() => handleSelectSpace(space.id)}
            />
          ))}
        </View>
      </BottomSheet>
    </>
  );
});
