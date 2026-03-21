import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, View } from 'react-native';

import type { SpaceRole } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import { CheckCircleIcon, LightbulbIcon } from '@/icons';
import type { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { SpaceMemberService, type SpaceInvite } from '@/services';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'InviteMembers'>;

const COPY_FEEDBACK_DURATION = 2000;

type RoleOption = {
  description: string;
  label: string;
  value: SpaceRole;
};

const ROLE_OPTIONS: RoleOption[] = [
  { description: 'Can add and view care records', label: 'Editor', value: 'editor' },
  { description: 'Can view and export records only', label: 'Viewer', value: 'viewer' },
];

export function InvitePartnerScreen({ navigation, route }: Props) {
  const tw = useTw();
  const { spaceId } = route.params;
  const [selectedRole, setSelectedRole] = useState<SpaceRole>('editor');
  const [invite, setInvite] = useState<SpaceInvite | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await SpaceMemberService.generateInviteCode(spaceId, selectedRole);
      setInvite(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invite');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!invite) return;
    Clipboard.setString(invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  };

  const handleShare = async () => {
    if (!invite) return;
    try {
      await Share.share({
        message: `Join my Space on CoParent! Use code: ${invite.code}\n\nOr tap this link: ${invite.deepLink}`,
      });
    } catch {
      // User cancelled or error
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'OnboardingDone' }],
    });
  };

  return (
    <View style={tw`bg-surface flex-1 px-6 pt-16`}>
      <Text style={tw`text-foreground font-serif-bold mb-2 text-3xl`}>
        Invite members to your Space
      </Text>
      <Text style={tw`text-subtitle mb-8 text-base`}>
        Anyone who helps care for this child can join — parents, grandparents, guardians, or
        lawyers.
      </Text>

      {!invite ? (
        <>
          <Text style={tw`text-subtitle mb-3 text-sm font-medium`}>What is their role?</Text>
          {ROLE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={tw`mb-3 rounded-xl border p-4 ${
                selectedRole === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-divider bg-background'
              }`}
              onPress={() => setSelectedRole(option.value)}
            >
              <Text
                style={tw`text-foreground text-base font-medium ${
                  selectedRole === option.value ? 'text-primary' : ''
                }`}
              >
                {option.label}
              </Text>
              <Text style={tw`text-subtitle mt-1 text-sm`}>{option.description}</Text>
            </Pressable>
          ))}

          {error && (
            <View style={tw`bg-error/15 mt-4 rounded-xl p-4`}>
              <Text style={tw`text-error`}>{error}</Text>
            </View>
          )}

          <View style={tw`flex-1`} />

          <View style={tw`pb-8`}>
            <Pressable
              disabled={isGenerating}
              style={tw`bg-primary mb-3 flex-row justify-center rounded-xl py-4`}
              onPress={handleGenerateInvite}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-center text-lg font-semibold text-white`}>
                  Generate Invite Code
                </Text>
              )}
            </Pressable>

            <Pressable onPress={handleDone}>
              <Text style={tw`text-subtitle text-center text-base`}>Skip for now</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <View style={tw`mb-6 items-center rounded-2xl bg-neutral-200 p-6`}>
            <Text style={tw`text-subtitle mb-2 text-sm`}>Invite Code</Text>
            <Text style={tw`text-foreground font-mono text-3xl font-bold tracking-widest`}>
              {invite.code}
            </Text>
            <Text style={tw`text-subtitle mt-2 text-sm`}>
              Role: {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label} · Valid for 7 days
            </Text>
          </View>

          <View style={tw`mb-8 flex-row gap-3`}>
            <Pressable style={tw`flex-1 rounded-xl bg-neutral-200 py-4`} onPress={handleCopy}>
              <View style={tw`flex-row items-center justify-center`}>
                {copied && <CheckCircleIcon height={16} style={tw`text-success mr-1`} width={16} />}
                <Text style={tw`text-foreground font-medium`}>
                  {copied ? 'Copied!' : 'Copy Code'}
                </Text>
              </View>
            </Pressable>

            <Pressable style={tw`bg-primary flex-1 rounded-xl py-4`} onPress={handleShare}>
              <Text style={tw`text-center font-medium text-white`}>Share</Text>
            </Pressable>
          </View>

          <View style={tw`bg-warning/15 mb-8 flex-row rounded-xl p-4`}>
            <LightbulbIcon height={16} style={tw`text-warning mr-2 mt-0.5`} width={16} />
            <Text style={tw`text-warning flex-1 text-sm`}>
              You can start using CoParent right away. Members can join anytime using this code, and
              they{"'"}ll see all the records you{"'"}ve created.
            </Text>
          </View>

          <View style={tw`flex-1`} />

          <View style={tw`pb-8`}>
            <Pressable style={tw`bg-primary mb-3 rounded-xl py-4`} onPress={handleDone}>
              <Text style={tw`text-center text-lg font-semibold text-white`}>
                Done — Start Using CoParent
              </Text>
            </Pressable>

            <Pressable onPress={handleDone}>
              <Text style={tw`text-subtitle text-center text-base`}>
                I{"'"}ll invite more members later
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
