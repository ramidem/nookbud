import plugin from 'tailwindcss/plugin';
import resolveConfig from 'tailwindcss/resolveConfig';
import { create } from 'twrnc';

import tailwindConfig from '../../tailwind.config';

import CONFIG from '@/config';

const theme = resolveConfig(tailwindConfig);

export const tw = create({
  ...tailwindConfig,
  plugins: [
    ...tailwindConfig.plugins,
    plugin(({ addUtilities }) => {
      addUtilities({
        '.box': `border border-black`,
        '.font-bold-italic': `font-bold-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-medium-italic': `font-medium-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-sans-italic': `font-sans-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
        '.font-semibold-italic': `font-semibold-italic ${CONFIG.IS_IOS ? 'italic' : ''}`,
      });
    }),
  ],
  theme: {
    ...tailwindConfig.theme,
    fontFamily: {
      bold: CONFIG.IS_ANDROID ? 'InterBold' : 'Inter 18pt Bold',
      'bold-italic': CONFIG.IS_ANDROID ? 'InterBoldItalic' : 'Inter 18pt Bold Italic',
      medium: CONFIG.IS_ANDROID ? 'InterMedium' : 'Inter 18pt Medium',
      'medium-italic': CONFIG.IS_ANDROID ? 'InterMediumItalic' : 'Inter 18pt Medium Italic',
      sans: CONFIG.IS_ANDROID ? 'InterRegular' : 'Inter 18pt Regular',
      'sans-italic': CONFIG.IS_ANDROID ? 'InterItalic' : 'Inter 18pt Italic',
      semibold: CONFIG.IS_ANDROID ? 'InterSemiBold' : 'Inter 18pt SemiBold',
      'semibold-italic': CONFIG.IS_ANDROID ? 'InterSemiBoldItalic' : 'Inter 18pt SemiBold Italic',
      serif: 'EBGaramond-Regular',
      'serif-bold': 'EBGaramond-Bold',
      'serif-medium': 'EBGaramond-Medium',
      'serif-semibold': 'EBGaramond-SemiBold',
    },
  },
});

export const errorContainerStyle = (err: boolean) => err && tw`border-error`;

export const disabledInputStyle = (isDisabled: boolean) => isDisabled && tw`opacity-40`;

export const focusedInputStyle = (isFocused: boolean) =>
  isFocused && tw`border-primary dark:border-neutral-50`;

export const errorTextStyle = (err: boolean) => err && tw`text-error`;

export const defaultInputContainerStyle = tw`bg-surface min-h-[56px] flex-row items-center rounded-xl border border-neutral-300 px-4`;
export const defaultInputAreaContainerStyle = tw`bg-surface flex-row rounded-xl border border-neutral-300 px-4 py-3`;
export const defaultInputTextStyle = [
  tw`text-foreground flex-1 font-normal`,
  CONFIG.IS_ANDROID ? { textAlignVertical: 'center' } : null,
];

export const colors = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...((theme.theme as any).colors as any),
};
