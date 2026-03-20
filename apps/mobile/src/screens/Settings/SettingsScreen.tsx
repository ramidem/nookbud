import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTw } from '@/hooks/useTw';
import {
  UserService,
  RelationshipService,
  ChildService,
} from '@/services';
import type { User, Relationship, Child } from '@/database/schema';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your local data including entries, children, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            // In production, implement proper data clearing
            Alert.alert('Not Implemented', 'Data clearing will be implemented in a future update.');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-white px-4 pt-14 pb-4 border-b border-gray-100`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Profile Section */}
        <View style={tw`bg-white rounded-xl mb-4`}>
          <Pressable
            style={tw`flex-row items-center p-4 border-b border-gray-100`}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <View style={tw`w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4`}>
              <Text style={tw`text-xl`}>👤</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-lg font-medium text-gray-900`}>
                {user?.displayName || 'Profile'}
              </Text>
              <Text style={tw`text-sm text-gray-500`}>
                {user?.timezone} • {user?.defaultCurrency}
              </Text>
            </View>
            <Text style={tw`text-gray-400 text-xl`}>›</Text>
          </Pressable>
        </View>

        {/* Children Section */}
        <View style={tw`bg-white rounded-xl mb-4`}>
          <View style={tw`px-4 py-3 border-b border-gray-100`}>
            <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide`}>
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
                <View style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}>
                  <Text style={tw`text-lg`}>👶</Text>
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
            style={tw`flex-row items-center justify-center p-4 border-t border-gray-100`}
            onPress={() => navigation.navigate('AddChildSettings')}
          >
            <Text style={tw`text-blue-600 font-medium`}>+ Add Child</Text>
          </Pressable>
        </View>

        {/* Relationship Section */}
        <View style={tw`bg-white rounded-xl mb-4`}>
          <View style={tw`px-4 py-3 border-b border-gray-100`}>
            <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide`}>
              Co-Parent Connection
            </Text>
          </View>
          <View style={tw`p-4`}>
            {relationship?.parentBId ? (
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3`}>
                  <Text style={tw`text-lg`}>👥</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-green-600`}>Connected</Text>
                  <Text style={tw`text-sm text-gray-500`}>Your co-parent has joined</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={tw`text-gray-700 mb-2`}>
                  Your co-parent hasn't joined yet. Share this code:
                </Text>
                <View style={tw`bg-gray-100 rounded-lg p-3`}>
                  <Text style={tw`text-center text-xl font-mono font-bold text-gray-900`}>
                    {relationship?.inviteToken || 'No code'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={tw`bg-white rounded-xl mb-4`}>
          <View style={tw`px-4 py-3 border-b border-gray-100`}>
            <Text style={tw`text-sm font-medium text-gray-600 uppercase tracking-wide`}>
              About
            </Text>
          </View>
          <View style={tw`p-4`}>
            <View style={tw`flex-row justify-between mb-2`}>
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
        <View style={tw`bg-white rounded-xl mb-4`}>
          <View style={tw`px-4 py-3 border-b border-gray-100`}>
            <Text style={tw`text-sm font-medium text-red-600 uppercase tracking-wide`}>
              Danger Zone
            </Text>
          </View>
          <Pressable style={tw`p-4`} onPress={handleClearData}>
            <Text style={tw`text-red-600 font-medium`}>Clear All Local Data</Text>
            <Text style={tw`text-sm text-gray-500 mt-1`}>
              Delete everything and start fresh
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
