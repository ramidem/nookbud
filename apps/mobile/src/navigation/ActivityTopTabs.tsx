import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import React, { createContext, useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
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

function ActivityTabBar({ descriptors, navigation, state }: MaterialTopTabBarProps) {
  const tw = useTw();
  const isTimelineActive = state.index === 0;
  const { hasActiveFilters, setShowFilters } = useActivityFilter();

  return (
    <View style={tw`bg-surface border-divider flex-row items-center border-b px-4 pb-2`}>
      <View style={tw`flex-1 flex-row`}>
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
              style={tw`mr-4 pb-1 ${isFocused ? 'border-primary border-b-2' : ''}`}
              onPress={onPress}
            >
              <Typography
                style={tw`text-sm font-medium ${isFocused ? 'text-primary' : 'text-subtitle'}`}
              >
                {route.name}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      {isTimelineActive && (
        <Pressable
          style={tw`${hasActiveFilters ? 'bg-primary/15' : 'bg-neutral-200'} rounded-lg px-3 py-1.5`}
          onPress={() => setShowFilters(true)}
        >
          <Typography
            style={tw`${hasActiveFilters ? 'text-primary' : 'text-subtitle'} text-xs font-medium`}
          >
            {hasActiveFilters ? 'Filtered' : 'Filter'}
          </Typography>
        </Pressable>
      )}
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
      <View style={[tw`bg-surface flex-1`, { paddingTop: insets.top + HEADER_TOP_PADDING }]}>
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
