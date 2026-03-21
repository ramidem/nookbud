import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTw } from '@/hooks/useTw';
import { CalendarIcon, ClipboardListIcon } from '@/icons';
import { CalendarScreen } from '@/screens/Calendar';
import { TimelineScreen } from '@/screens/Timeline';
import { colors } from '@/tailwind';

export type ActivityTopTabParamList = {
  Timeline: undefined;
  Calendar: undefined;
};

const TopTab = createMaterialTopTabNavigator<ActivityTopTabParamList>();

const HEADER_TOP_PADDING = 8;
const TOGGLE_ICON_SIZE = 22;
const TOGGLE_HIT_SLOP = 6;

function ActivityTabBar({ navigation, state }: MaterialTopTabBarProps) {
  const tw = useTw();
  const isTimelineActive = state.index === 0;

  return (
    <View
      style={tw`border-divider bg-surface flex-row items-center justify-between border-b px-4 pb-3`}
    >
      <Text style={tw`text-foreground font-serif-bold text-2xl`}>Activity</Text>

      <View style={tw`flex-row items-center gap-4`}>
        <Pressable hitSlop={TOGGLE_HIT_SLOP} onPress={() => navigation.navigate('Timeline')}>
          <ClipboardListIcon
            height={TOGGLE_ICON_SIZE}
            style={tw`${isTimelineActive ? 'text-primary' : 'text-subtitle'}`}
            width={TOGGLE_ICON_SIZE}
          />
        </Pressable>
        <Pressable hitSlop={TOGGLE_HIT_SLOP} onPress={() => navigation.navigate('Calendar')}>
          <CalendarIcon
            height={TOGGLE_ICON_SIZE}
            style={tw`${!isTimelineActive ? 'text-primary' : 'text-subtitle'}`}
            width={TOGGLE_ICON_SIZE}
          />
        </Pressable>
      </View>
    </View>
  );
}

export function ActivityTopTabs() {
  const tw = useTw();
  const insets = useSafeAreaInsets();

  return (
    <View style={[tw`bg-background flex-1`, { paddingTop: insets.top + HEADER_TOP_PADDING }]}>
      <TopTab.Navigator
        screenOptions={{
          lazy: true,
          swipeEnabled: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtitle,
        }}
        tabBar={(props) => <ActivityTabBar {...props} />}
      >
        <TopTab.Screen component={TimelineScreen} name="Timeline" />
        <TopTab.Screen component={CalendarScreen} name="Calendar" />
      </TopTab.Navigator>
    </View>
  );
}
