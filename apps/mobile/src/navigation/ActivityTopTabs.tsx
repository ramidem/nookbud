import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import React, { createContext, useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import { SlidersHorizontalIcon } from '@/icons';
import { CalendarScreen } from '@/screens/Calendar';
import { TimelineScreen } from '@/screens/Timeline';
import { colors } from '@/tailwind';

export type ActivityTopTabParamList = {
  Timeline: undefined;
  Calendar: undefined;
};

type ActivityFilterContextType = {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  setHasActiveFilters: (has: boolean) => void;
};

const ActivityFilterContext = createContext<ActivityFilterContextType>({
  hasActiveFilters: false,
  setHasActiveFilters: () => {},
  setShowFilters: () => {},
  showFilters: false,
});

export function useActivityFilter() {
  return useContext(ActivityFilterContext);
}

const TopTab = createMaterialTopTabNavigator<ActivityTopTabParamList>();

const HEADER_TOP_PADDING = 8;
const FILTER_ICON_SIZE = 20;
const FILTER_HIT_SLOP = 8;

function ActivityTabBar({ descriptors, navigation, state }: MaterialTopTabBarProps) {
  const tw = useTw();
  const isTimelineActive = state.index === 0;
  const { hasActiveFilters, setShowFilters } = useActivityFilter();

  return (
    <View style={tw`flex-row items-center px-4 py-2`}>
      {/* Left: filter icon (visible on Timeline only) */}
      <View style={tw`w-8 items-start`}>
        {isTimelineActive && (
          <Pressable hitSlop={FILTER_HIT_SLOP} onPress={() => setShowFilters(true)}>
            <SlidersHorizontalIcon
              height={FILTER_ICON_SIZE}
              style={tw`${hasActiveFilters ? 'text-primary' : 'text-subtitle'}`}
              width={FILTER_ICON_SIZE}
            />
          </Pressable>
        )}
      </View>

      {/* Center: segmented control */}
      <View style={tw`flex-1 items-center`}>
        <View style={tw`flex-row rounded-full bg-neutral-200 p-1`}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                accessibilityRole="tab"
                accessibilityState={isFocused ? { selected: true } : {}}
                style={tw`rounded-full px-5 py-2 ${isFocused ? 'bg-surface shadow-sm' : ''}`}
                onPress={onPress}
              >
                <Typography
                  style={tw`text-sm ${isFocused ? 'text-foreground font-semibold' : 'text-subtitle font-medium'}`}
                >
                  {route.name}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Right: spacer to balance the filter icon */}
      <View style={tw`w-8`} />
    </View>
  );
}

export function ActivityTopTabs() {
  const tw = useTw();
  const insets = useSafeAreaInsets();
  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  return (
    <ActivityFilterContext.Provider
      value={{ hasActiveFilters, setHasActiveFilters, setShowFilters, showFilters }}
    >
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
    </ActivityFilterContext.Provider>
  );
}
