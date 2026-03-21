import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useRef } from 'react';
import { Pressable } from 'react-native';
import { type SvgProps } from 'react-native-svg';

import { ActivityNavigator } from './ActivityNavigator';
import { ResourcesNavigator } from './ResourcesNavigator';
import { SettingsNavigator } from './SettingsNavigator';

import { SpaceSwitcher, type SpaceSwitcherRef } from '@/components';
import { useTw } from '@/hooks/useTw';
import { BookOpenIcon, ClipboardListIcon, GearIcon, LayersIcon } from '@/icons';
import { colors } from '@/tailwind';

export type MainTabParamList = {
  SpacesTab: undefined;
  ActivityTab: undefined;
  ResourcesTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICON_SIZE = 24;

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

function EmptyScreen() {
  return null;
}

export function MainNavigator() {
  const tw = useTw();
  const spaceSwitcherRef = useRef<SpaceSwitcherRef>(null);

  return (
    <>
      <Tab.Navigator
        initialRouteName="ActivityTab"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtitle,
          tabBarLabelStyle: tw`mt-1 text-xs`,
          tabBarStyle: tw`border-divider bg-surface border-t pt-2`,
        }}
      >
        <Tab.Screen
          component={EmptyScreen}
          name="SpacesTab"
          options={{
            tabBarButton: (props) => (
              <Pressable {...props} onPress={() => spaceSwitcherRef.current?.expand()}>
                {props.children}
              </Pressable>
            ),
            tabBarIcon: () => (
              <LayersIcon height={TAB_ICON_SIZE} style={tw`text-subtitle`} width={TAB_ICON_SIZE} />
            ),
            tabBarLabel: 'Spaces',
          }}
        />
        <Tab.Screen
          component={ActivityNavigator}
          name="ActivityTab"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={ClipboardListIcon} />,
            tabBarLabel: 'Activity',
          }}
        />
        <Tab.Screen
          component={ResourcesNavigator}
          name="ResourcesTab"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={BookOpenIcon} />,
            tabBarLabel: 'Resources',
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

      <SpaceSwitcher ref={spaceSwitcherRef} showTrigger={false} />
    </>
  );
}
