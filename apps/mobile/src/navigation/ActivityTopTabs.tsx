import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import React from 'react';
import { Pressable, View } from 'react-native';

import { PageHeader } from '@/components';
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

const TOGGLE_ICON_SIZE = 20;

function ActivityTabBar({ navigation, state }: MaterialTopTabBarProps) {
  const tw = useTw();
  const isTimelineActive = state.index === 0;

  return (
    <PageHeader
      rightAction={
        <View style={tw`flex-row rounded-full bg-neutral-200 p-1`}>
          <Pressable
            style={tw`rounded-full p-2 ${isTimelineActive ? 'bg-surface shadow-sm' : ''}`}
            onPress={() => navigation.navigate('Timeline')}
          >
            <ClipboardListIcon
              height={TOGGLE_ICON_SIZE}
              style={tw`${isTimelineActive ? 'text-foreground' : 'text-subtitle'}`}
              width={TOGGLE_ICON_SIZE}
            />
          </Pressable>
          <Pressable
            style={tw`rounded-full p-2 ${!isTimelineActive ? 'bg-surface shadow-sm' : ''}`}
            onPress={() => navigation.navigate('Calendar')}
          >
            <CalendarIcon
              height={TOGGLE_ICON_SIZE}
              style={tw`${!isTimelineActive ? 'text-foreground' : 'text-subtitle'}`}
              width={TOGGLE_ICON_SIZE}
            />
          </Pressable>
        </View>
      }
      title="Activity"
    />
  );
}

export function ActivityTopTabs() {
  const tw = useTw();

  return (
    <View style={tw`bg-background flex-1`}>
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
