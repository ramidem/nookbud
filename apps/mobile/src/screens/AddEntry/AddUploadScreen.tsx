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
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { useTw } from '@/hooks/useTw';
import {
  EntryService,
  RelationshipService,
  ChildService,
  type AttachmentInput,
} from '@/services';
import type { Child } from '@/database/schema';
import type { DocumentType } from '@/types/entry-content.types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TimelineStackParamList } from '@/navigation/TimelineNavigator';

type Props = NativeStackScreenProps<TimelineStackParamList, 'AddUpload'>;

const DOC_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'school', label: 'School', icon: '📚' },
  { value: 'legal', label: 'Legal', icon: '⚖️' },
  { value: 'other', label: 'Other', icon: '📄' },
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
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: true,
      });

      const newFiles: AttachmentInput[] = result.map((doc) => ({
        sourceUri: doc.uri,
        filename: doc.name ?? 'document',
        mimeType: doc.type ?? 'application/octet-stream',
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
        sourceUri: asset.uri!,
        filename: asset.fileName ?? 'image.jpg',
        mimeType: asset.type ?? 'image/jpeg',
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
          sourceUri: asset.uri!,
          filename: asset.fileName ?? 'photo.jpg',
          mimeType: asset.type ?? 'image/jpeg',
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
        relationshipId,
        type: 'upload',
        childId: selectedChildId ?? undefined,
        content: {
          title: title.trim(),
          description: description.trim() || undefined,
          documentType,
        },
        attachmentInputs: files,
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
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-gray-100`}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={tw`text-blue-600 text-base`}>Cancel</Text>
        </Pressable>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Upload Document</Text>
        <Pressable onPress={handleSave} disabled={!canSave || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={tw`${canSave ? 'text-blue-600' : 'text-gray-400'} text-base font-semibold`}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Title *</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3`}
            placeholder="e.g., Medical Report - March 2026"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Document Type */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Type</Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {DOC_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={tw`px-4 py-2 rounded-lg ${documentType === type.value ? 'bg-blue-600' : 'bg-gray-100'}`}
                onPress={() => setDocumentType(type.value)}
              >
                <Text style={tw`${documentType === type.value ? 'text-white' : 'text-gray-700'}`}>
                  {type.icon} {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Files */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Files *</Text>
          
          {/* File list */}
          {files.length > 0 && (
            <View style={tw`mb-4`}>
              {files.map((file, index) => (
                <View
                  key={index}
                  style={tw`flex-row items-center bg-gray-50 rounded-lg p-3 mb-2`}
                >
                  <Text style={tw`flex-1 text-gray-700`} numberOfLines={1}>
                    📎 {file.filename}
                  </Text>
                  <Pressable onPress={() => removeFile(index)}>
                    <Text style={tw`text-red-500`}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Add file buttons */}
          <View style={tw`flex-row gap-2`}>
            <Pressable
              style={tw`flex-1 bg-gray-100 rounded-xl py-4 items-center`}
              onPress={handlePickDocument}
            >
              <Text style={tw`text-2xl mb-1`}>📄</Text>
              <Text style={tw`text-gray-700 text-sm`}>Document</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 bg-gray-100 rounded-xl py-4 items-center`}
              onPress={handlePickImage}
            >
              <Text style={tw`text-2xl mb-1`}>🖼️</Text>
              <Text style={tw`text-gray-700 text-sm`}>Gallery</Text>
            </Pressable>
            <Pressable
              style={tw`flex-1 bg-gray-100 rounded-xl py-4 items-center`}
              onPress={handleTakePhoto}
            >
              <Text style={tw`text-2xl mb-1`}>📷</Text>
              <Text style={tw`text-gray-700 text-sm`}>Camera</Text>
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Description</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 h-24`}
            placeholder="What is this document about?"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Child */}
        {children.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-medium text-gray-600 mb-2`}>Related Child</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              <Pressable
                style={tw`px-4 py-2 rounded-lg ${selectedChildId === null ? 'bg-blue-600' : 'bg-gray-100'}`}
                onPress={() => setSelectedChildId(null)}
              >
                <Text style={tw`${selectedChildId === null ? 'text-white' : 'text-gray-700'}`}>
                  All
                </Text>
              </Pressable>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={tw`px-4 py-2 rounded-lg ${selectedChildId === child.id ? 'bg-blue-600' : 'bg-gray-100'}`}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Text style={tw`${selectedChildId === child.id ? 'text-white' : 'text-gray-700'}`}>
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Info */}
        <View style={tw`bg-green-50 rounded-xl p-4`}>
          <Text style={tw`text-green-800 text-sm`}>
            🔒 Files are stored securely with SHA-256 verification. The hash proves they haven't been modified.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
