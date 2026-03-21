import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import {
  Alert,
  Button,
  EmojiText,
  ScreenContainer,
  ScreenHeader,
  TextInput,
  Toast,
  Typography,
} from '@/components';
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_DISPLAY,
  type Child,
  type ResourceCategory,
} from '@/database/schema';
import { useActiveSpace } from '@/hooks/useActiveSpace.hook';
import { useTw } from '@/hooks/useTw';
import { CrossIcon, FileTextIcon, PaperclipIcon } from '@/icons';
import type { ResourcesStackParamList } from '@/navigation/ResourcesNavigator';
import { ChildService, ResourceService, SpaceService } from '@/services';
import { colors } from '@/tailwind';

type Props = NativeStackScreenProps<ResourcesStackParamList, 'AddResource'>;

const ACTIVE_BG = 'bg-primary';
const INACTIVE_BG = 'bg-background';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-subtitle';
const DOC_ICON_SIZE = 16;
const BYTES_PER_KB = 1024;

type PickedFile = {
  name: string;
  size: number;
  uri: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  const kb = bytes / BYTES_PER_KB;
  if (kb < BYTES_PER_KB) return `${kb.toFixed(1)} KB`;
  const mb = kb / BYTES_PER_KB;

  return `${mb.toFixed(1)} MB`;
}

export function AddResourceScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('other');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);

  useEffect(() => {
    async function load() {
      if (isAllSpaces || !activeSpaceId) {
        Alert.error({
          message: 'Please select a Space first.',
          title: 'No Space Selected',
        });
        navigation.goBack();

        return;
      }

      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'viewer') {
        Alert.error({
          message: 'Your role in this Space does not allow uploading resources.',
          title: 'Access Denied',
        });
        navigation.goBack();

        return;
      }

      const c = await ChildService.listBySpace(activeSpaceId);
      setChildren(c);
    }
    load();
  }, [activeSpaceId, isAllSpaces, navigation]);

  const canSave = title.trim().length > 0 && pickedFile !== null && !isAllSpaces && !!activeSpaceId;

  const handlePickFile = async () => {
    try {
      const [result] = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      if (result) {
        setPickedFile({
          name: result.name ?? 'document',
          size: result.size ?? 0,
          uri: result.uri,
        });
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.error({ message: 'Failed to pick file', title: 'Error' });
      }
    }
  };

  const handleUpload = async () => {
    if (!canSave || !pickedFile || !activeSpaceId) return;

    setIsLoading(true);
    try {
      await ResourceService.upload(activeSpaceId, pickedFile.uri, {
        category,
        childId: selectedChildId ?? undefined,
        description: description.trim() || undefined,
        title: title.trim(),
      });

      Toast.success('Resource uploaded');
      navigation.goBack();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to upload resource',
        title: 'Upload Failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader hasBackButton title="Add Resource" />

      <ScrollView contentContainerStyle={tw`px-4 pb-8 pt-4`}>
        {/* Space context pill */}
        {activeSpace && (
          <View style={tw`mb-4 self-start rounded-lg bg-neutral-200 px-3 py-1.5`}>
            <Text style={tw`text-foreground text-sm`}>
              <EmojiText>{activeSpace.emoji}</EmojiText> {activeSpace.name}
            </Text>
          </View>
        )}

        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Title *</Text>
          <TextInput
            placeholder="e.g., Birth Certificate, Insurance Card"
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Description</Text>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="Optional notes about this resource"
            placeholderTextColor={colors.placeholder}
            style={tw`h-20`}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Category */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Category *</Text>
          <ScrollView
            horizontal
            contentContainerStyle={tw`gap-2`}
            showsHorizontalScrollIndicator={false}
          >
            {RESOURCE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={tw`rounded-full px-4 py-1.5 ${category === cat ? ACTIVE_BG : INACTIVE_BG}`}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={tw`text-sm font-medium ${category === cat ? ACTIVE_TEXT : INACTIVE_TEXT}`}
                >
                  {RESOURCE_CATEGORY_DISPLAY[cat]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Child selector */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Related Child</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`rounded-full px-4 py-1.5 ${
                  selectedChildId === null ? ACTIVE_BG : INACTIVE_BG
                }`}
                onPress={() => setSelectedChildId(null)}
              >
                <Text
                  style={tw`text-sm font-medium ${
                    selectedChildId === null ? ACTIVE_TEXT : INACTIVE_TEXT
                  }`}
                >
                  None
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`rounded-full px-4 py-1.5 ${
                    selectedChildId === child.id ? ACTIVE_BG : INACTIVE_BG
                  }`}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Text
                    style={tw`text-sm font-medium ${
                      selectedChildId === child.id ? ACTIVE_TEXT : INACTIVE_TEXT
                    }`}
                  >
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* File picker */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>File *</Text>

          {pickedFile ? (
            <View style={tw`bg-background flex-row items-center rounded-xl p-4`}>
              <PaperclipIcon
                height={DOC_ICON_SIZE}
                style={tw`text-subtitle mr-2`}
                width={DOC_ICON_SIZE}
              />
              <View style={tw`flex-1`}>
                <Typography numberOfLines={1} style={tw`text-foreground text-sm`}>
                  {pickedFile.name}
                </Typography>
                {pickedFile.size > 0 && (
                  <Typography style={tw`text-subtitle text-xs`}>
                    {formatFileSize(pickedFile.size)}
                  </Typography>
                )}
              </View>
              <Pressable onPress={() => setPickedFile(null)}>
                <CrossIcon height={DOC_ICON_SIZE} style={tw`text-error`} width={DOC_ICON_SIZE} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={tw`border-divider items-center rounded-xl border border-dashed py-8`}
              onPress={handlePickFile}
            >
              <FileTextIcon height={32} style={tw`text-subtitle mb-2`} width={32} />
              <Typography style={tw`text-foreground text-sm font-medium`}>Choose File</Typography>
              <Typography style={tw`text-subtitle mt-1 text-xs`}>PDF or image</Typography>
            </Pressable>
          )}
        </View>

        {/* Upload button */}
        <Button
          isDisabled={!canSave}
          isLoading={isLoading}
          size="lg"
          title="Upload Resource"
          onPress={handleUpload}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
