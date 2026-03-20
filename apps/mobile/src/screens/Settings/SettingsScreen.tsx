import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Switch,
  Linking,
} from 'react-native';

import type { User, Relationship, Child } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import {
  UserService,
  RelationshipService,
  ChildService,
  NotificationService,
  type NotificationPrefs,
} from '@/services';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

const COPY_FEEDBACK_DURATION = 2000;

const NOTIFICATION_TOGGLES: Array<{
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}> = [
  { description: 'When your partner adds a new entry', key: 'newEntry', label: 'New Entries' },
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
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [copied, setCopied] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(NotificationService.getPrefs());
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus>('undetermined');

  const loadPermissionStatus = useCallback(async () => {
    const status = await NotificationService.getPermissionStatus();
    setPermissionStatus(status);
  }, []);

  useEffect(() => {
    loadData();
    loadPermissionStatus();
  }, [loadPermissionStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const u = await UserService.getCurrentUser();
      setUser(u);

      const rel = await RelationshipService.getCurrentRelationship();
      setRelationship(rel);

      if (rel) {
        const c = await ChildService.listByRelationship(rel.id);
        setChildren(c);
      }
    } catch {
      // Silent fail — settings load is non-critical
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (relationship?.inviteToken) {
      Clipboard.setString(relationship.inviteToken);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    }
  };

  const handleShareInvite = async () => {
    if (!relationship?.inviteToken) return;
    try {
      await Share.share({
        message: `Join me on CoParent! Use code: ${relationship.inviteToken}\n\nOr tap this link: coparent://invite/${relationship.inviteToken}`,
      });
    } catch {
      // User cancelled or error
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
            // In production, implement proper data clearing
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
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`border-b border-gray-100 bg-white px-4 pb-4 pt-14`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Profile Section */}
        <View style={tw`mb-4 rounded-xl bg-white`}>
          <Pressable
            style={tw`flex-row items-center border-b border-gray-100 p-4`}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <View style={tw`mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-100`}>
              <Text aria-label="person" role="img" style={tw`text-xl`}>
                👤
              </Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-lg font-medium text-gray-900`}>
                {user?.displayName || 'Profile'}
              </Text>
              <Text style={tw`text-sm text-gray-500`}>
                {user?.timezone} • {user?.defaultCurrency}
              </Text>
            </View>
            <Text style={tw`text-xl text-gray-400`}>›</Text>
          </Pressable>
        </View>

        {/* Children Section */}
        <View style={tw`mb-4 rounded-xl bg-white`}>
          <View style={tw`border-b border-gray-100 px-4 py-3`}>
            <Text style={tw`text-sm font-medium uppercase tracking-wide text-gray-600`}>
              Children
            </Text>
          </View>
          {children.length === 0 ? (
            <View style={tw`p-4`}>
              <Text style={tw`text-gray-500`}>No children added</Text>
            </View>
          ) : (
            children.map((child, index) => (
              <Pressable
                key={child.id}
                style={tw`flex-row items-center p-4 ${
                  index < children.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onPress={() => navigation.navigate('ChildSettings', { childId: child.id })}
              >
                <View
                  style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100`}
                >
                  <Text aria-label="child" role="img" style={tw`text-lg`}>
                    👶
                  </Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-gray-900`}>{child.name}</Text>
                  {child.dateOfBirth && (
                    <Text style={tw`text-sm text-gray-500`}>
                      DOB: {child.dateOfBirth.toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={tw`text-gray-400`}>›</Text>
              </Pressable>
            ))
          )}
          <Pressable
            style={tw`flex-row items-center justify-center border-t border-gray-100 p-4`}
            onPress={() => navigation.navigate('AddChildSettings')}
          >
            <Text style={tw`font-medium text-blue-600`}>+ Add Child</Text>
          </Pressable>
        </View>

        {/* Notifications Section */}
        <View style={tw`mb-4 rounded-xl bg-white`}>
          <View style={tw`border-b border-gray-100 px-4 py-3`}>
            <Text style={tw`text-sm font-medium uppercase tracking-wide text-gray-600`}>
              Notifications
            </Text>
          </View>

          {permissionStatus === 'denied' ? (
            <View style={tw`p-4`}>
              <Text style={tw`mb-2 text-sm text-gray-500`}>
                Notifications are disabled. Enable them in your device settings.
              </Text>
              <Pressable
                style={tw`rounded-lg bg-blue-600 py-3`}
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
                  index < NOTIFICATION_TOGGLES.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View style={tw`mr-3 flex-1`}>
                  <Text style={tw`text-base font-medium text-gray-900`}>{toggle.label}</Text>
                  <Text style={tw`text-sm text-gray-500`}>{toggle.description}</Text>
                </View>
                <Switch
                  trackColor={{ false: '#D1D5DB', true: '#6F8F7B' }}
                  value={notifPrefs[toggle.key]}
                  onValueChange={() => handleToggleNotifPref(toggle.key)}
                />
              </View>
            ))
          )}
        </View>

        {/* Relationship Section */}
        <View style={tw`mb-4 rounded-xl bg-white`}>
          <View style={tw`border-b border-gray-100 px-4 py-3`}>
            <Text style={tw`text-sm font-medium uppercase tracking-wide text-gray-600`}>
              Co-Parent Connection
            </Text>
          </View>
          <View style={tw`p-4`}>
            {relationship?.parentBId ? (
              <View style={tw`flex-row items-center`}>
                <View
                  style={tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100`}
                >
                  <Text aria-label="people" role="img" style={tw`text-lg`}>
                    👥
                  </Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-green-600`}>Connected</Text>
                  <Text style={tw`text-sm text-gray-500`}>Your co-parent has joined</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={tw`mb-2 text-gray-700`}>
                  Your co-parent hasn{"'"}t joined yet. Share this code:
                </Text>
                <View style={tw`mb-3 rounded-lg bg-gray-100 p-3`}>
                  <Text style={tw`text-center font-mono text-xl font-bold text-gray-900`}>
                    {relationship?.inviteToken || 'No code'}
                  </Text>
                </View>
                {relationship?.inviteToken ? (
                  <View style={tw`flex-row gap-3`}>
                    <Pressable
                      style={tw`flex-1 rounded-lg bg-gray-100 py-3`}
                      onPress={handleCopyCode}
                    >
                      <Text style={tw`text-center text-sm font-medium text-gray-900`}>
                        {copied ? 'Copied!' : 'Copy Code'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={tw`flex-1 rounded-lg bg-blue-600 py-3`}
                      onPress={handleShareInvite}
                    >
                      <Text style={tw`text-center text-sm font-medium text-white`}>
                        Share Invite
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={tw`mb-4 rounded-xl bg-white`}>
          <View style={tw`border-b border-gray-100 px-4 py-3`}>
            <Text style={tw`text-sm font-medium uppercase tracking-wide text-gray-600`}>About</Text>
          </View>
          <View style={tw`p-4`}>
            <View style={tw`mb-2 flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Version</Text>
              <Text style={tw`text-gray-900`}>1.0.0</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-600`}>Build</Text>
              <Text style={tw`text-gray-900`}>Phase 1 MVP</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={tw`mb-4 rounded-xl bg-white`}>
          <View style={tw`border-b border-gray-100 px-4 py-3`}>
            <Text style={tw`text-sm font-medium uppercase tracking-wide text-red-600`}>
              Danger Zone
            </Text>
          </View>
          <Pressable style={tw`p-4`} onPress={handleClearData}>
            <Text style={tw`font-medium text-red-600`}>Clear All Local Data</Text>
            <Text style={tw`mt-1 text-sm text-gray-500`}>Delete everything and start fresh</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
