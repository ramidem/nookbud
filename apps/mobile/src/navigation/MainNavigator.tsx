import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type SvgProps } from 'react-native-svg';

import { SettingsNavigator } from './SettingsNavigator';
import { TimelineNavigator } from './TimelineNavigator';

import { SpaceSwitcher } from '@/components';
import { useTw } from '@/hooks/useTw';
import { CalendarIcon, ClipboardListIcon, GearIcon, ShareIcon } from '@/icons';
import { CalendarScreen } from '@/screens/Calendar';
import { ExportScreen } from '@/screens/Export';

export type MainTabParamList = {
  TimelineTab: undefined;
  CalendarTab: undefined;
  ExportTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 24;
const HEADER_TOP_PADDING = 8;

function TabIcon({ focused, Icon }: { Icon: React.FC<SvgProps>; focused: boolean }) {
  const tw = useTw();

  return (
    <Icon
      height={TAB_ICON_SIZE}
      style={tw`${focused ? 'text-primary' : 'text-subtitle'}`}
      width={TAB_ICON_SIZE}
    />
  );
}

export function MainNavigator() {
  const tw = useTw();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => (
          <View
            style={[
              tw`bg-surface border-divider flex-row items-center border-b px-4 pb-3`,
              { paddingTop: insets.top + HEADER_TOP_PADDING },
            ]}
          >
            <SpaceSwitcher />
          </View>
        ),
        headerShown: true,
        tabBarActiveTintColor: '#6F8F7B',
        tabBarInactiveTintColor: '#6E6A66',
        tabBarLabelStyle: tw`mt-1 text-xs`,
        tabBarStyle: tw`border-divider bg-surface border-t pt-2`,
      }}
    >
      <Tab.Screen
        component={TimelineNavigator}
        name="TimelineTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={ClipboardListIcon} />,
          tabBarLabel: 'Timeline',
        }}
      />
      <Tab.Screen
        component={CalendarScreen}
        name="CalendarTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={CalendarIcon} />,
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen
        component={ExportScreen}
        name="ExportTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={ShareIcon} />,
          tabBarLabel: 'Export',
        }}
      />
      <Tab.Screen
        component={SettingsNavigator}
        name="SettingsTab"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={GearIcon} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
