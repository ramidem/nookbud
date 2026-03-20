/* eslint-disable no-magic-numbers */
import { Canvas, Fill, LinearGradient, vec } from '@shopify/react-native-skia';
import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useLocalStorageStore } from '@/stores';
import { colors } from '@/tailwind';

type Props = {
  variant?: 'bottomSheet' | 'login' | 'welcome';
};

const DARK_BG = colors['dark-background'];

const DARK_GRADIENTS: Record<string, string[]> = {
  bottomSheet: [colors['dark-sheet'], DARK_BG],
  login: [colors.neutral[950], DARK_BG, colors.neutral[950]],
  welcome: [DARK_BG, colors.neutral[950], DARK_BG],
};

const LIGHT_GRADIENTS: Record<string, string[]> = {
  bottomSheet: [colors.neutral[100], colors.white],
  login: [colors.neutral[50], colors.white, colors.neutral[50]],
  welcome: [colors.white, colors.neutral[50], colors.white],
};

export function GradientBackground(props: Props) {
  const { variant = 'login' } = props;
  const colorScheme = useLocalStorageStore((s) => s.colorScheme);
  const isDark = colorScheme === 'dark';
  const { height, width } = useWindowDimensions();

  const gradientColors = isDark ? DARK_GRADIENTS[variant] : LIGHT_GRADIENTS[variant];

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {/* Base linear gradient */}
      <Fill>
        <LinearGradient
          colors={gradientColors}
          end={vec(width / 2, height)}
          start={vec(width / 2, 0)}
        />
      </Fill>
    </Canvas>
  );
}
