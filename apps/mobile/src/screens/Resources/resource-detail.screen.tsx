import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, View } from 'react-native';

import { Alert, Button, ScreenContainer, ScreenHeader, Toast, Typography } from '@/components';
import { useTw } from '@/hooks/useTw';
import {
  BabyIcon,
  BookOpenIcon,
  CopyIcon,
  HeartPulseIcon,
  LockIcon,
  PackageIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserIcon,
  WalletIcon,
  XCircleIcon,
} from '@/icons';
import type { ResourcesStackParamList } from '@/navigation/ResourcesNavigator';
import { ChildService, FileService, ResourceService, SpaceService } from '@/services';
import { colors, tw } from '@/tailwind';
import {
  RESOURCE_CATEGORY_DISPLAY,
  type Child,
  type Resource,
  type ResourceCategory,
} from '@/types';

type Props = NativeStackScreenProps<ResourcesStackParamList, 'ResourceDetail'>;

const ICON_SIZE = 20;
const HASH_DISPLAY_LENGTH = 16;
const BYTES_PER_KB = 1024;
const COPY_FEEDBACK_DURATION = 2000;

const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  financial: 'bg-warning/15 text-warning',
  identity: 'bg-accent-soft/20 text-accent',
  insurance: 'bg-primary/15 text-primary',
  legal: 'bg-error/15 text-error',
  medical: 'bg-success/15 text-success',
  other: 'bg-neutral-200 text-subtitle',
  school: 'bg-primary/15 text-primary',
};

const CATEGORY_ICONS: Record<
  ResourceCategory,
  React.FC<{ height: number; width: number; style: unknown }>
> = {
  financial: WalletIcon,
  identity: UserIcon,
  insurance: LockIcon,
  legal: ScaleIcon,
  medical: HeartPulseIcon,
  other: PackageIcon,
  school: BookOpenIcon,
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  const kb = bytes / BYTES_PER_KB;
  if (kb < BYTES_PER_KB) return `${kb.toFixed(1)} KB`;
  const mb = kb / BYTES_PER_KB;

  return `${mb.toFixed(1)} MB`;
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function ResourceDetailScreen({ navigation, route }: Props) {
  const { resourceId } = route.params;
  const twHook = useTw();
  const [resource, setResource] = useState<Resource | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canDelete, setCanDelete] = useState(false);

  // Integrity verification
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    actualHash: string;
    expectedHash: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const loadResource = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await ResourceService.getById(resourceId);
      setResource(r);

      if (r?.childId) {
        const spaceChildren = await ChildService.listBySpace(r.spaceId);
        const found = spaceChildren.find((c) => c.id === r.childId);
        setChild(found ?? null);
      }

      if (r) {
        const role = await SpaceService.getUserRole(r.spaceId);
        setCanDelete(role === 'owner' || role === 'editor');
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useFocusEffect(
    useCallback(() => {
      loadResource();
    }, [loadResource]),
  );

  const handleOpenFile = async () => {
    if (!resource) return;
    const fileUri = FileService.getFileUri(resource.storagePath);
    try {
      await Linking.openURL(fileUri);
    } catch {
      Alert.error({
        message: 'Could not open the file. The file may have been moved or deleted.',
        title: 'Open Failed',
      });
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!resource) return;
    setIsVerifying(true);
    try {
      const result = await ResourceService.verifyIntegrity(resource.id);
      setVerifyResult(result);
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Verification failed',
        title: 'Verification Error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyHash = () => {
    if (!resource) return;
    Clipboard.setString(resource.fileHash);
    setCopied(true);
    Toast.success('Hash copied');
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  };

  const handleDelete = () => {
    if (!resource) return;
    Alert.warning({
      actions: [
        { label: 'Cancel', variant: 'cancel' },
        {
          label: 'Delete',
          onPress: async () => {
            try {
              await ResourceService.softDelete(resource.id);
              Toast.success('Resource deleted');
              navigation.goBack();
            } catch (err) {
              Alert.error({
                message: err instanceof Error ? err.message : 'Failed to delete resource',
                title: 'Delete Failed',
              });
            }
          },
        },
      ],
      message: 'This resource will be removed from the list. The file will be preserved.',
      title: 'Delete Resource',
    });
  };

  if (isLoading || !resource) {
    return (
      <ScreenContainer header={<ScreenHeader hasBackButton title="Resource" />}>
        <View style={twHook`flex-1 items-center justify-center`}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const CategoryIcon = CATEGORY_ICONS[resource.category];
  const categoryColorClass = CATEGORY_COLORS[resource.category];
  const isImage = isImageMimeType(resource.mimeType);

  return (
    <ScreenContainer
      header={
        <ScreenHeader
          hasBackButton
          extraAction={
            canDelete
              ? {
                  icon: <Trash2Icon height={ICON_SIZE} style={tw`text-error`} width={ICON_SIZE} />,
                  onPress: handleDelete,
                }
              : undefined
          }
          title={resource.title}
        />
      }
    >
      <View style={tw`flex-1 px-4 pb-8 pt-4`}>
        {/* Category badge */}
        <View style={tw`mb-4 flex-row items-center`}>
          <View
            style={tw`flex-row items-center rounded-full px-3 py-1.5 ${categoryColorClass.split(' ')[0]}`}
          >
            <CategoryIcon
              height={14}
              style={tw`${categoryColorClass.split(' ')[1]} mr-1.5`}
              width={14}
            />
            <Typography style={tw`${categoryColorClass.split(' ')[1]} text-sm font-medium`}>
              {RESOURCE_CATEGORY_DISPLAY[resource.category]}
            </Typography>
          </View>
        </View>

        {/* Child */}
        {child && (
          <View style={tw`mb-4 flex-row items-center`}>
            <BabyIcon height={16} style={tw`text-subtitle mr-2`} width={16} />
            <Typography style={tw`text-foreground text-sm`}>{child.name}</Typography>
          </View>
        )}

        {/* Upload info */}
        <View style={tw`mb-4`}>
          <Typography style={tw`text-subtitle text-sm`}>
            Uploaded {formatDate(resource.createdAt)}
          </Typography>
        </View>

        {/* Description */}
        {resource.description ? (
          <View style={tw`bg-surface mb-4 rounded-xl p-4`}>
            <Typography style={tw`text-foreground text-base leading-6`}>
              {resource.description}
            </Typography>
          </View>
        ) : null}

        {/* Image preview */}
        {isImage && (
          <View style={tw`mb-4 overflow-hidden rounded-xl`}>
            <Image
              resizeMethod="resize"
              resizeMode="cover"
              source={{ cache: 'force-cache', uri: FileService.getFileUri(resource.storagePath) }}
              style={tw`h-48 w-full`}
            />
          </View>
        )}

        {/* File section */}
        <View style={tw`bg-surface mb-4 rounded-xl`}>
          <View style={tw`border-background border-b px-4 py-3`}>
            <Typography style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
              File
            </Typography>
          </View>
          <View style={tw`p-4`}>
            <Typography style={tw`text-foreground text-sm font-medium`}>
              {resource.originalFilename}
            </Typography>
            <Typography style={tw`text-subtitle mt-1 text-xs`}>
              {formatFileSize(resource.fileSizeBytes)} · {resource.mimeType}
            </Typography>
            <Button buttonStyle={tw`mt-3`} title="Open File" onPress={handleOpenFile} />
          </View>
        </View>

        {/* Integrity section */}
        <View style={tw`bg-surface rounded-xl`}>
          <View style={tw`border-background border-b px-4 py-3`}>
            <Typography style={tw`text-subtitle text-sm font-medium uppercase tracking-wide`}>
              Integrity
            </Typography>
          </View>
          <View style={tw`p-4`}>
            {/* Hash display */}
            <View style={tw`mb-3 flex-row items-center`}>
              <Typography style={tw`text-subtitle mr-2 text-xs`}>SHA-256:</Typography>
              <Typography style={tw`text-foreground flex-1 font-mono text-xs`}>
                {resource.fileHash.substring(0, HASH_DISPLAY_LENGTH)}...
              </Typography>
              <Pressable onPress={handleCopyHash}>
                <CopyIcon
                  height={16}
                  style={tw`${copied ? 'text-success' : 'text-subtitle'}`}
                  width={16}
                />
              </Pressable>
            </View>

            {/* Verify button */}
            <Pressable
              disabled={isVerifying}
              style={tw`flex-row items-center justify-center rounded-xl bg-neutral-200 py-3`}
              onPress={handleVerifyIntegrity}
            >
              {isVerifying ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <ShieldCheckIcon height={16} style={tw`text-foreground mr-2`} width={16} />
                  <Typography style={tw`text-foreground text-sm font-medium`}>
                    Verify Integrity
                  </Typography>
                </>
              )}
            </Pressable>

            {/* Verification result */}
            {verifyResult && (
              <View
                style={tw`mt-3 flex-row items-center rounded-xl p-3 ${
                  verifyResult.verified ? 'bg-success/15' : 'bg-error/15'
                }`}
              >
                {verifyResult.verified ? (
                  <>
                    <ShieldCheckIcon height={16} style={tw`text-success mr-2`} width={16} />
                    <Typography style={tw`text-success text-sm font-medium`}>
                      Verified — file has not been modified
                    </Typography>
                  </>
                ) : (
                  <>
                    <XCircleIcon height={16} style={tw`text-error mr-2`} width={16} />
                    <Typography style={tw`text-error text-sm font-medium`}>
                      Hash mismatch — file may have been modified
                    </Typography>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
