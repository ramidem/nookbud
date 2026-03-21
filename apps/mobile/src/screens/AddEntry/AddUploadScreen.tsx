import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import type { Child } from '@/database/schema';
import { useTw } from '@/hooks/useTw';
import { CameraIcon, CrossIcon, FileTextIcon, ImageIcon, LockIcon, PaperclipIcon } from '@/icons';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';
import { EntryService, RelationshipService, ChildService, type AttachmentInput } from '@/services';
import type { DocumentType } from '@/types/entry-content.types';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddUpload'>;

const ACTIVE_BG = 'bg-blue-600';
const INACTIVE_BG = 'bg-gray-100';
const ACTIVE_TEXT = 'text-white';
const INACTIVE_TEXT = 'text-gray-700';
const DOC_ICON_SIZE = 16;
const BUTTON_ICON_SIZE = 24;

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { label: 'Medical', value: 'medical' },
  { label: 'School', value: 'school' },
  { label: 'Legal', value: 'legal' },
  { label: 'Other', value: 'other' },
];

export function AddUploadScreen({ navigation }: Props) {
  const tw = useTw();
  const [isLoading, setIsLoading] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [files, setFiles] = useState<AttachmentInput[]>([]);

  useEffect(() => {
    async function load() {
      const rel = await RelationshipService.getCurrentRelationship();
      if (rel) {
        setRelationshipId(rel.id);
        const c = await ChildService.listByRelationship(rel.id);
        setChildren(c);
      }
    }
    load();
  }, []);

  const canSave = title.trim().length > 0 && files.length > 0;

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
        Alert.alert('Error', 'Failed to pick document');
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

  const handleSave = async () => {
    if (!canSave || !relationshipId) return;

    setIsLoading(true);
    try {
      await EntryService.create({
        attachmentInputs: files,
        childId: selectedChildId ?? undefined,
        content: {
          description: description.trim() || undefined,
          documentType,
          title: title.trim(),
        },
        relationshipId,
        type: 'upload',
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-white`}
    >
      {/* Header */}
      <View
        style={tw`flex-row items-center justify-between border-b border-gray-100 px-4 pb-4 pt-14`}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-base text-blue-600`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Upload Document</Text>
        <Pressable disabled={!canSave || isLoading} onPress={handleSave}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Title *</Text>
          <TextInput
            placeholder="e.g., Medical Report - March 2026"
            placeholderTextColor="#9CA3AF"
            style={tw`rounded-xl border border-gray-300 px-4 py-3`}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Document Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Type</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {DOC_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={tw`rounded-lg px-4 py-2 ${documentType === type.value ? ACTIVE_BG : INACTIVE_BG}`}
                onPress={() => setDocumentType(type.value)}
              >
                <Text style={tw`${documentType === type.value ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Files */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Files *</Text>

          {/* File list */}
          {files.length > 0 && (
            <View style={tw`mb-4`}>
              {files.map((file, index) => (
                <View key={index} style={tw`mb-2 flex-row items-center rounded-lg bg-gray-50 p-3`}>
                  <PaperclipIcon
                    height={DOC_ICON_SIZE}
                    style={tw`mr-1.5 text-gray-500`}
                    width={DOC_ICON_SIZE}
                  />
                  <Text numberOfLines={1} style={tw`flex-1 text-gray-700`}>
                    {file.filename}
                  </Text>
                  <Pressable onPress={() => removeFile(index)}>
                    <CrossIcon
                      height={DOC_ICON_SIZE}
                      style={tw`text-red-500`}
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
              style={tw`flex-1 items-center rounded-xl bg-gray-100 py-4`}
              onPress={handlePickDocument}
            >
              <FileTextIcon
                height={BUTTON_ICON_SIZE}
                style={tw`mb-1 text-gray-600`}
                width={BUTTON_ICON_SIZE}
              />
              <Text style={tw`text-sm text-gray-700`}>Document</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 items-center rounded-xl bg-gray-100 py-4`}
              onPress={handlePickImage}
            >
              <ImageIcon
                height={BUTTON_ICON_SIZE}
                style={tw`mb-1 text-gray-600`}
                width={BUTTON_ICON_SIZE}
              />
              <Text style={tw`text-sm text-gray-700`}>Gallery</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 items-center rounded-xl bg-gray-100 py-4`}
              onPress={handleTakePhoto}
            >
              <CameraIcon
                height={BUTTON_ICON_SIZE}
                style={tw`mb-1 text-gray-600`}
                width={BUTTON_ICON_SIZE}
              />
              <Text style={tw`text-sm text-gray-700`}>Camera</Text>
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Description</Text>
          <TextInput
            multiline
            placeholder="What is this document about?"
            placeholderTextColor="#9CA3AF"
            style={tw`h-24 rounded-xl border border-gray-300 px-4 py-3`}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Child */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`mb-2 text-sm font-medium text-gray-600`}>Related Child</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`rounded-lg px-4 py-2 ${selectedChildId === null ? ACTIVE_BG : INACTIVE_BG}`}
                onPress={() => setSelectedChildId(null)}
              >
                <Text style={tw`${selectedChildId === null ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                  All
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`rounded-lg px-4 py-2 ${selectedChildId === child.id ? ACTIVE_BG : INACTIVE_BG}`}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Text style={tw`${selectedChildId === child.id ? ACTIVE_TEXT : INACTIVE_TEXT}`}>
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Info */}
        <View style={tw`flex-row rounded-xl bg-green-50 p-4`}>
          <LockIcon height={16} style={tw`mr-2 mt-0.5 text-green-800`} width={16} />
          <Text style={tw`flex-1 text-sm text-green-800`}>
            Files are stored securely with SHA-256 verification. The hash proves they haven{"'"}t
            been modified.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
