import React, { useState } from 'react';
import { View, Text, Pressable, Share, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTw } from '@/hooks/useTw';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'InvitePartner'>;

export function InvitePartnerScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { inviteToken } = route.params;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(inviteToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on CoParent to track our co-parenting activities. Use this invite code: ${inviteToken}`,
      });
    } catch (err) {
      // User cancelled or error
    }
  };

  const handleSkip = () => {
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'OnboardingDone' }],
    });
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'OnboardingDone' }],
    });
  };

  return (
    <View style={tw`flex-1 bg-white px-6 pt-16`}>
      <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>
        Invite your co-parent
      </Text>
      <Text style={tw`text-base text-gray-600 mb-8`}>
        Share this code so they can join and see the same records.
      </Text>

      <View style={tw`bg-gray-100 rounded-2xl p-6 mb-6 items-center`}>
        <Text style={tw`text-sm text-gray-500 mb-2`}>Invite Code</Text>
        <Text style={tw`text-3xl font-mono font-bold text-gray-900 tracking-widest`}>
          {inviteToken}
        </Text>
        <Text style={tw`text-sm text-gray-500 mt-2`}>Valid for 30 days</Text>
      </View>

      <View style={tw`flex-row gap-3 mb-8`}>
        <Pressable
          style={tw`flex-1 bg-gray-100 rounded-xl py-4`}
          onPress={handleCopy}
        >
          <Text style={tw`text-gray-900 text-center font-medium`}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </Text>
        </Pressable>

        <Pressable
          style={tw`flex-1 bg-blue-600 rounded-xl py-4`}
          onPress={handleShare}
        >
          <Text style={tw`text-white text-center font-medium`}>
            Share
          </Text>
        </Pressable>
      </View>

      <View style={tw`bg-amber-50 rounded-xl p-4 mb-8`}>
        <Text style={tw`text-amber-800 text-sm`}>
          💡 You can start using CoParent right away. Your co-parent can join
          anytime using this code, and they'll see all the records you've created.
        </Text>
      </View>

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Pressable
          style={tw`bg-blue-600 rounded-xl py-4 mb-3`}
          onPress={handleDone}
        >
          <Text style={tw`text-white text-center text-lg font-semibold`}>
            Done — Start Using CoParent
          </Text>
        </Pressable>

        <Pressable onPress={handleSkip}>
          <Text style={tw`text-gray-500 text-center text-base`}>
            I'll invite them later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
