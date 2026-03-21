import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Linking,
} from 'react-native';

import { PageHeader } from '@/components';
import type { User, Child } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import { BabyIcon, ChevronRightIcon, ShareIcon, UserIcon, UsersIcon } from '@/icons';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import {
  UserService,
  SpaceService,
  NotificationService,
  type NotificationPrefs,
  type PermissionStatus,
  type SpaceWithRole,
} from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

const NOTIFICATION_TOGGLES: Array<{
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}> = [
  { description: 'When a member adds a new entry', key: 'newEntry', label: 'New Entries' },
  {
    description: 'When your entry is acknowledged',
    key: 'acknowledged',
    label: 'Acknowledgments',
  },
  { description: 'When your entry is disputed', key: 'disputed', label: 'Disputes' },
  {
    description: 'When there is a new dispute response',
    key: 'disputeResponse',
    label: 'Dispute Responses',
  },
];

export function SettingsScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<SpaceWithRole[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(NotificationService.getPrefs());
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadPermissionStatus();
    }, []),
  );

  const loadPermissionStatus = async () => {
    const status = await NotificationService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const u = await UserService.getCurrentUser();
      setUser(u);

      const spaceList = await SpaceService.listSpaces();
      setSpaces(spaceList);

      // Gather children from all spaces
      const allChildren: Child[] = [];
      for (const space of spaceList) {
        const details = await SpaceService.getSpaceById(space.id);
        if (details) {
          allChildren.push(...details.children);
        }
      }
      setChildren(allChildren);
    } catch {
      // Silent fail — settings load is non-critical
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifPref = (key: keyof NotificationPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    NotificationService.savePrefs(updated);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your local data including entries, children, and settings. This cannot be undone.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: async () => {
            Alert.alert('Not Implemented', 'Data clearing will be implemented in a future update.');
          },
          style: 'destructive',
          text: 'Clear Data',
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={tw`bg-surface flex-1 items-center justify-center`}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={tw`bg-background flex-1`}>
      <PageHeader title="Settings" />

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Profile Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <Pressable
            style={tw`border-divider flex-row items-center border-b p-4`}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <View
              style={tw`mr-4 h-12 w-12 items-center justify-center rounded-full bg-neutral-200`}
            >
              <UserIcon height={24} style={tw`text-primary`} width={24} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-foreground text-lg font-medium`}>
                {user?.displayName || 'Profile'}
              </Text>
              <Text style={tw`text-subtitle text-sm`}>
                {user?.timezone} • {user?.defaultCurrency}
              </Text>
            </View>
            <ChevronRightIcon height={20} style={tw`text-placeholder`} width={20} />
          </Pressable>
        </View>

        {/* Children Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Text style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
              Children
            </Text>
          </View>
          {children.length === 0 ? (
            <View style={tw`p-4`}>
              <Text style={tw`text-subtitle`}>No children added</Text>
            </View>
          ) : (
            children.map((child, index) => (
              <Pressable
                key={child.id}
                style={tw`flex-row items-center p-4 ${
                  index < children.length - 1 ? 'border-divider border-b' : ''
                }`}
                onPress={() => navigation.navigate('ChildSettings', { childId: child.id })}
              >
                <View
                  style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-neutral-200`}
                >
                  <BabyIcon height={20} style={tw`text-success`} width={20} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-foreground text-base font-medium`}>{child.name}</Text>
                  {child.dateOfBirth && (
                    <Text style={tw`text-subtitle text-sm`}>
                      DOB: {child.dateOfBirth.toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <ChevronRightIcon height={16} style={tw`text-placeholder`} width={16} />
              </Pressable>
            ))
          )}
          <Pressable
            style={tw`border-divider flex-row items-center justify-center border-t p-4`}
            onPress={() => navigation.navigate('AddChildSettings')}
          >
            <Text style={tw`text-primary font-medium`}>+ Add Child</Text>
          </Pressable>
        </View>

        {/* Notifications Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Text style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
              Notifications
            </Text>
          </View>

          {permissionStatus === 'denied' ? (
            <View style={tw`p-4`}>
              <Text style={tw`text-subtitle mb-2 text-sm`}>
                Notifications are disabled. Enable them in your device settings.
              </Text>
              <Pressable
                style={tw`bg-primary rounded-lg py-3`}
                onPress={() => Linking.openSettings()}
              >
                <Text style={tw`text-center text-sm font-medium text-white`}>
                  Enable in Settings
                </Text>
              </Pressable>
            </View>
          ) : (
            NOTIFICATION_TOGGLES.map((toggle, index) => (
              <View
                key={toggle.key}
                style={tw`flex-row items-center justify-between px-4 py-3 ${
                  index < NOTIFICATION_TOGGLES.length - 1 ? 'border-divider border-b' : ''
                }`}
              >
                <View style={tw`mr-3 flex-1`}>
                  <Text style={tw`text-foreground text-base font-medium`}>{toggle.label}</Text>
                  <Text style={tw`text-subtitle text-sm`}>{toggle.description}</Text>
                </View>
                <Switch
                  trackColor={{ false: colors.disabled, true: colors.primary }}
                  value={notifPrefs[toggle.key]}
                  onValueChange={() => handleToggleNotifPref(toggle.key)}
                />
              </View>
            ))
          )}
        </View>

        {/* My Spaces Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <Pressable
            style={tw`flex-row items-center p-4`}
            onPress={() => navigation.navigate('SpacesSettings')}
          >
            <View
              style={tw`mr-4 h-12 w-12 items-center justify-center rounded-full bg-neutral-200`}
            >
              <UsersIcon height={24} style={tw`text-accent`} width={24} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-foreground text-lg font-medium`}>My Spaces</Text>
              <Text style={tw`text-subtitle text-sm`}>
                {spaces.length} {spaces.length === 1 ? 'Space' : 'Spaces'}
              </Text>
            </View>
            <ChevronRightIcon height={20} style={tw`text-placeholder`} width={20} />
          </Pressable>
        </View>

        {/* Export Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <Pressable
            style={tw`flex-row items-center p-4`}
            onPress={() => navigation.navigate('Export')}
          >
            <View
              style={tw`mr-4 h-12 w-12 items-center justify-center rounded-full bg-neutral-200`}
            >
              <ShareIcon height={24} style={tw`text-primary`} width={24} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-foreground text-lg font-medium`}>Export</Text>
              <Text style={tw`text-subtitle text-sm`}>
                Generate court-ready reports and evidence bundles
              </Text>
            </View>
            <ChevronRightIcon height={20} style={tw`text-placeholder`} width={20} />
          </Pressable>
        </View>

        {/* About Section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Text style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>About</Text>
          </View>
          <View style={tw`p-4`}>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Version</Text>
              <Text style={tw`text-foreground`}>1.0.0</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-subtitle`}>Build</Text>
              <Text style={tw`text-foreground`}>Phase 1 MVP</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-divider border-b px-4 py-3`}>
            <Text style={tw`text-error text-sm font-medium uppercase tracking-wide`}>
              Danger Zone
            </Text>
          </View>
          <Pressable style={tw`p-4`} onPress={handleClearData}>
            <Text style={tw`text-error font-medium`}>Clear All Local Data</Text>
            <Text style={tw`text-subtitle mt-1 text-sm`}>Delete everything and start fresh</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
