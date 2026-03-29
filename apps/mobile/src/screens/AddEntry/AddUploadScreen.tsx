import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { Alert, EmojiText } from '@/components/atoms';
import { useActiveSpace } from '@/hooks';
import { useTw } from '@/hooks/useTw';
import { CameraIcon, CrossIcon, FileTextIcon, ImageIcon, LockIcon, PaperclipIcon } from '@/icons';
import type { ActivityStackParamList } from '@/navigation/ActivityNavigator';
import { EntryService, ChildService, SpaceService, type AttachmentInput } from '@/services';
import { colors } from '@/tailwind';
import type { Child } from '@/types';

type Props = NativeStackScreenProps<ActivityStackParamList, 'AddUpload'>;

const uploadFormSchema = z.object({
  description: z.string().optional(),
  documentType: z.enum(['medical', 'school', 'legal', 'other']),
  selectedChildId: z.string().nullable(),
  title: z.string().min(1, 'Title is required'),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

const ACTIVE_BG = 'bg-primary';
const INACTIVE_BG = 'bg-neutral-200';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-foreground';
const DOC_ICON_SIZE = 16;
const BUTTON_ICON_SIZE = 24;

const DOC_TYPES: { label: string; value: UploadFormData['documentType'] }[] = [
  { label: 'Medical', value: 'medical' },
  { label: 'School', value: 'school' },
  { label: 'Legal', value: 'legal' },
  { label: 'Other', value: 'other' },
];

export function AddUploadScreen({ navigation }: Props) {
  const tw = useTw();
  const { activeSpace, activeSpaceId, isAllSpaces } = useActiveSpace();
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [hasPermission, setHasPermission] = useState(true);
  const [files, setFiles] = useState<AttachmentInput[]>([]);

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<UploadFormData>({
    defaultValues: {
      description: '',
      documentType: 'other' as const,
      selectedChildId: null,
      title: '',
    },
    mode: 'onChange',
    resolver: zodResolver(uploadFormSchema),
  });

  useEffect(() => {
    async function load() {
      if (isAllSpaces || !activeSpaceId) {
        Alert.error({
          message:
            'Please select a Space first. Tap the Space switcher at the top to choose which Space to log this entry to.',
          title: 'No Space Selected',
        });
        navigation.goBack();

        return;
      }

      // Role permission check
      const role = await SpaceService.getUserRole(activeSpaceId);
      if (role === 'viewer') {
        Alert.error({
          message: 'Your role in this Space does not allow creating entries.',
          title: 'Access Denied',
        });
        setHasPermission(false);
        navigation.goBack();

        return;
      }

      const c = await ChildService.listBySpace(activeSpaceId);
      setChildren(c);
    }
    load();
  }, [activeSpaceId, isAllSpaces, navigation]);

  const canSave = isValid && files.length > 0 && hasPermission && !isAllSpaces;

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      const newFiles: AttachmentInput[] = result.map((doc) => ({
        filename: doc.name ?? 'document',
        mimeType: doc.type ?? 'application/octet-stream',
        sourceUri: doc.uri,
      }));

      setFiles([...files, ...newFiles]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.error({ message: 'Failed to pick document', title: 'Error' });
      }
    }
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
    });

    if (result.assets) {
      const newFiles: AttachmentInput[] = result.assets.map((asset) => ({
        filename: asset.fileName ?? 'image.jpg',
        mimeType: asset.type ?? 'image/jpeg',
        sourceUri: asset.uri ?? '',
      }));

      setFiles([...files, ...newFiles]);
    }
  };

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
    });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setFiles([
        ...files,
        {
          filename: asset.fileName ?? 'photo.jpg',
          mimeType: asset.type ?? 'image/jpeg',
          sourceUri: asset.uri ?? '',
        },
      ]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!activeSpaceId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        attachmentInputs: files,
        childId: data.selectedChildId ?? undefined,
        content: {
          description: data.description?.trim() || undefined,
          documentType: data.documentType,
          title: data.title.trim(),
        },
        spaceId: activeSpaceId,
        type: 'upload',
      });

      navigation.goBack();
    } catch (err) {
      Alert.error({
        message: err instanceof Error ? err.message : 'Failed to save',
        title: 'Error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={tw`bg-surface flex-1`}>
      {/* Header */}
      <View
        style={tw`border-background flex-row items-center justify-between border-b px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-primary text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-foreground font-serif-semibold text-lg`}>Upload Document</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSubmit(onSubmit)}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-primary' : 'text-placeholder'} text-base font-semibold`}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
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
          <Controller
            control={control}
            name="title"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                placeholder="e.g., Medical Report - March 2026"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground rounded-xl border px-4 py-3`}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Document Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Type</Text>
          <Controller
            control={control}
            name="documentType"
            render={({ field: { onChange, value } }) => (
              <View style={tw`flex-row flex-wrap gap-2`}>
                {DOC_TYPES.map((type) => (
                  <Pressable
                    key={type.value}
                    style={tw`rounded-lg px-4 py-2 ${value === type.value ? ACTIVE_BG : INACTIVE_BG}`}
                    onPress={() => onChange(type.value)}
                  >
                    <Text style={tw`${value === type.value ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Files */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Files *</Text>

          {/* File list */}
          {files.length > 0 && (
            <View style={tw`mb-4`}>
              {files.map((file, index) => (
                <View
                  key={index}
                  style={tw`bg-background mb-2 flex-row items-center rounded-lg p-3`}
                >
                  <PaperclipIcon
                    height={DOC_ICON_SIZE}
                    style={tw`text-subtitle mr-1.5`}
                    width={DOC_ICON_SIZE}
                  />
                  <Text numberOfLines={1} style={tw`text-foreground flex-1`}>
                    {file.filename}
                  </Text>
                  <Pressable onPress={() => removeFile(index)}>
                    <CrossIcon
                      height={DOC_ICON_SIZE}
                      style={tw`text-error`}
                      width={DOC_ICON_SIZE}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Add file buttons */}
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 items-center rounded-xl bg-neutral-200 py-4`}
              onPress={handlePickDocument}
            >
              <FileTextIcon
                height={BUTTON_ICON_SIZE}
                style={tw`text-subtitle mb-1`}
                width={BUTTON_ICON_SIZE}
              />
              <Text style={tw`text-foreground text-sm`}>Document</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 items-center rounded-xl bg-neutral-200 py-4`}
              onPress={handlePickImage}
            >
              <ImageIcon
                height={BUTTON_ICON_SIZE}
                style={tw`text-subtitle mb-1`}
                width={BUTTON_ICON_SIZE}
              />
              <Text style={tw`text-foreground text-sm`}>Gallery</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 items-center rounded-xl bg-neutral-200 py-4`}
              onPress={handleTakePhoto}
            >
              <CameraIcon
                height={BUTTON_ICON_SIZE}
                style={tw`text-subtitle mb-1`}
                width={BUTTON_ICON_SIZE}
              />
              <Text style={tw`text-foreground text-sm`}>Camera</Text>
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                multiline
                placeholder="What is this document about?"
                placeholderTextColor={colors.placeholder}
                style={tw`border-divider text-foreground h-24 rounded-xl border px-4 py-3`}
                textAlignVertical="top"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Child */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-subtitle mb-2 text-sm font-medium`}>Related Child</Text>
            <Controller
              control={control}
              name="selectedChildId"
              render={({ field: { onChange, value } }) => (
                <View style={tw`flex-row flex-wrap gap-2`}>
                  <Pressable
                    style={tw`rounded-lg px-4 py-2 ${value === null ? ACTIVE_BG : INACTIVE_BG}`}
                    onPress={() => onChange(null)}
                  >
                    <Text style={tw`${value === null ? ACTIVE_TEXT : INACTIVE_TEXT}`}>All</Text>
                  </Pressable>
                  {children.map((child) => (
                    <Pressable
                      key={child.id}
                      style={tw`rounded-lg px-4 py-2 ${value === child.id ? ACTIVE_BG : INACTIVE_BG}`}
                      onPress={() => onChange(child.id)}
                    >
                      <Text style={tw`${value === child.id ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                        {child.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        )}

        {/* Info */}
        <View style={tw`bg-success/15 flex-row rounded-xl p-4`}>
          <LockIcon height={16} style={tw`text-success mr-2 mt-0.5`} width={16} />
          <Text style={tw`text-success flex-1 text-sm`}>
            Files are stored securely with SHA-256 verification. The hash proves they haven{"'"}t
            been modified.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
