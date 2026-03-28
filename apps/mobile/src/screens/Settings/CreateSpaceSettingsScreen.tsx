import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button, EmojiText, ScreenContainer, ScreenHeader, Typography } from '@/components';
import { DEFAULT_SPACE_COLOR, SPACE_COLOR_OPTIONS } from '@/config/space';
import type { SettingsStackParamList } from '@/navigation/SettingsNavigator';
import { SpaceService } from '@/services';
import { useLocalStorageStore } from '@/stores';
import { colors, defaultInputContainerStyle, defaultInputTextStyle, tw } from '@/tailwind';

type Props = NativeStackScreenProps<SettingsStackParamList, 'CreateSpaceSettings'>;

const EXAMPLE_NAMES = ['Smith & Jones', "Lola Cora's Care", 'Portland Family', "Finn's Circle"];
const EMOJI_OPTIONS = ['🏠', '👨‍👩‍👧', '🌿', '⭐', '🌸', '🏡', '💙', '🌻'];
const COLOR_OPTIONS = SPACE_COLOR_OPTIONS;

const MIN_NAME_LENGTH = 2;
const COLOR_SWATCH_SIZE = 40;
const COLOR_SWATCH_BORDER_PADDING = 4;
const COLOR_SWATCH_BORDER_SIZE = COLOR_SWATCH_SIZE + COLOR_SWATCH_BORDER_PADDING;

export function CreateSpaceSettingsScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏠');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_SPACE_COLOR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = name.trim().length >= MIN_NAME_LENGTH;

  const handleCreate = async () => {
    if (!canCreate) return;

    setIsLoading(true);
    setError(null);

    try {
      const space = await SpaceService.createSpace(name.trim(), selectedEmoji, selectedColor);
      useLocalStorageStore.getState().setActiveSpaceId(space.id);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Space');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer header={<ScreenHeader title="Create Space" />}>
      <ScrollView contentContainerStyle={tw`flex-grow px-6 pb-8 pt-4`}>
        <Typography style={tw`text-subtitle mb-6 text-base`}>
          A Space is your care circle for a child or group of children.
        </Typography>

        <Typography style={tw`text-subtitle mb-3 text-sm font-medium`}>
          Tap an example or type your own
        </Typography>
        <View style={tw`mb-6 flex-row flex-wrap gap-2`}>
          {EXAMPLE_NAMES.map((example) => (
            <Pressable
              key={example}
              style={tw`rounded-xl border px-4 py-2 ${
                name === example ? 'bg-primary border-primary' : 'border-divider bg-background'
              }`}
              onPress={() => setName(example)}
            >
              <Typography
                style={tw`text-sm font-medium ${name === example ? 'text-white' : 'text-foreground'}`}
              >
                {example}
              </Typography>
            </Pressable>
          ))}
        </View>

        <TextInput
          autoCapitalize="words"
          placeholder="Name your Space"
          placeholderTextColor={colors.placeholder}
          style={[defaultInputContainerStyle, ...defaultInputTextStyle, tw`mb-6`]}
          value={name}
          onChangeText={setName}
        />

        <Typography style={tw`text-subtitle mb-3 text-sm font-medium`}>Pick an icon</Typography>
        <ScrollView
          horizontal
          contentContainerStyle={tw`gap-3`}
          showsHorizontalScrollIndicator={false}
          style={tw`mb-6`}
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              style={tw`h-12 w-12 items-center justify-center rounded-full ${
                selectedEmoji === emoji ? 'bg-primary' : 'bg-background'
              }`}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <EmojiText style={tw`text-2xl`}>{emoji}</EmojiText>
            </Pressable>
          ))}
        </ScrollView>

        <Typography style={tw`text-subtitle mb-3 text-sm font-medium`}>Pick a color</Typography>
        <View style={tw`mb-8 flex-row gap-3`}>
          {COLOR_OPTIONS.map((color) => (
            <Pressable
              key={color}
              style={[
                tw`items-center justify-center rounded-full ${
                  selectedColor === color
                    ? 'border-foreground border-2'
                    : 'border-2 border-transparent'
                }`,
                { height: COLOR_SWATCH_BORDER_SIZE, width: COLOR_SWATCH_BORDER_SIZE },
              ]}
              onPress={() => setSelectedColor(color)}
            >
              <View
                style={[
                  tw`rounded-full`,
                  {
                    backgroundColor: color,
                    height: COLOR_SWATCH_SIZE,
                    width: COLOR_SWATCH_SIZE,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        {selectedEmoji && name.trim().length > 0 && (
          <View style={tw`bg-background mb-8 items-center rounded-2xl p-6`}>
            <Typography style={tw`mb-1 text-4xl`}>{selectedEmoji}</Typography>
            <Typography style={tw`font-serif-semibold text-foreground text-xl`} variant="heading">
              {name.trim()}
            </Typography>
            <Typography style={tw`text-subtitle mt-1 text-sm`}>Your Space preview</Typography>
          </View>
        )}

        {error && (
          <View style={tw`bg-error/15 mb-4 rounded-xl p-4`}>
            <Typography style={tw`text-error`}>{error}</Typography>
          </View>
        )}

        <View style={tw`flex-1`} />

        <View style={tw`pt-4`}>
          <Button
            buttonStyle={tw`rounded-xl py-4 ${canCreate && !isLoading ? 'bg-primary' : 'bg-disabled'}`}
            isDisabled={!canCreate}
            isLoading={isLoading}
            textStyle={tw`text-lg`}
            title="Create Space"
            onPress={handleCreate}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
