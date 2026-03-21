import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, Pressable, Share } from 'react-native';

import { useTw } from '@/hooks/useTw';
import { CheckCircleIcon, LightbulbIcon } from '@/icons';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'InvitePartner'>;

const COPY_FEEDBACK_DURATION = 2000;

export function InvitePartnerScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { inviteToken } = route.params;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(inviteToken);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on CoParent! Use code: ${inviteToken}\n\nOr tap this link: coparent://invite/${inviteToken}`,
      });
    } catch (err) {
      // User cancelled or error
    }
  };

  const handleDone = () => {
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'OnboardingDone' }],
    });
  };

  return (
    <View style={tw`flex-1 bg-white px-6 pt-16`}>
      <Text style={tw`mb-2 text-3xl font-bold text-gray-900`}>Invite your co-parent</Text>
      <Text style={tw`mb-8 text-base text-gray-600`}>
        Share this code so they can join and see the same records.
      </Text>

      <View style={tw`mb-6 items-center rounded-2xl bg-gray-100 p-6`}>
        <Text style={tw`mb-2 text-sm text-gray-500`}>Invite Code</Text>
        <Text style={tw`font-mono text-3xl font-bold tracking-widest text-gray-900`}>
          {inviteToken}
        </Text>
        <Text style={tw`mt-2 text-sm text-gray-500`}>Valid for 30 days</Text>
      </View>

      <View style={tw`mb-8 flex-row gap-3`}>
        <Pressable style={tw`flex-1 rounded-xl bg-gray-100 py-4`} onPress={handleCopy}>
          <View style={tw`flex-row items-center justify-center`}>
            {copied && <CheckCircleIcon height={16} style={tw`mr-1 text-green-600`} width={16} />}
            <Text style={tw`font-medium text-gray-900`}>{copied ? 'Copied!' : 'Copy Code'}</Text>
          </View>
        </Pressable>

        <Pressable style={tw`flex-1 rounded-xl bg-blue-600 py-4`} onPress={handleShare}>
          <Text style={tw`text-center font-medium text-white`}>Share</Text>
        </Pressable>
      </View>

      <View style={tw`mb-8 flex-row rounded-xl bg-amber-50 p-4`}>
        <LightbulbIcon height={16} style={tw`mr-2 mt-0.5 text-amber-800`} width={16} />
        <Text style={tw`flex-1 text-sm text-amber-800`}>
          You can start using CoParent right away. Your co-parent can join anytime using this code,
          and they{"'"}ll see all the records you{"'"}ve created.
        </Text>
      </View>

      <View style={tw`flex-1`} />

      <View style={tw`pb-8`}>
        <Pressable style={tw`mb-3 rounded-xl bg-blue-600 py-4`} onPress={handleDone}>
          <Text style={tw`text-center text-lg font-semibold text-white`}>
            Done — Start Using CoParent
          </Text>
        </Pressable>

        <Pressable onPress={handleDone}>
          <Text style={tw`text-center text-base text-gray-500`}>I{"'"}ll invite them later</Text>
        </Pressable>
      </View>
    </View>
  );
}
