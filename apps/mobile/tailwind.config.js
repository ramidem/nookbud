/* eslint-disable sort-keys */

/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.box': `border border-black`,
      });
    }),
  ],
  theme: {
    // FOR FONTS: This is only for intellisense the real config is in apps/mobile/src/tailwind
    fontFamily: {
      bold: 'InterBold',
      'bold-italic': 'InterBoldItalic',
      medium: 'InterMedium',
      'medium-italic': 'InterMediumItalic',
      sans: 'InterRegular',
      'sans-italic': 'InterItalic',
      semibold: 'InterSemiBold',
      'semibold-italic': 'InterSemiBoldItalic',
      serif: 'EBGaramond-Regular',
      'serif-bold': 'EBGaramond-Bold',
      'serif-medium': 'EBGaramond-Medium',
      'serif-semibold': 'EBGaramond-SemiBold',
    },
    extend: {
      flex: {
        2: '2 2 0%',
      },
      colors: {
        white: '#ffffff',
        black: '#000000',

        // Brand
        primary: '#6F8F7B',             // Sage Green — trust / structure
        accent: '#C97C5D',              // Muted Terracotta — human / highlight
        'accent-soft': '#D8A7A0',       // Dusty Rose — empathy / subtle UI
        secondary: '#C8BFB6',           // Warm Taupe — support / UI depth

        // Semantic — light-first, dark: overrides
        background: '#F7F3EE',          // Warm Off-White
        foreground: '#2F2F2F',          // Primary text
        surface: '#ffffff',             // Cards / panels
        divider: '#C8BFB6',            // Warm Taupe borders
        subtitle: '#6E6A66',            // Secondary text
        placeholder: '#B0A99F',         // Muted warm placeholder
        muted: '#C8BFB6',              // Tertiary text
        disabled: '#C8BFB6',           // Disabled state
        overlay: '#2F2F2F',            // Modal/toast backdrop
        sheet: '#ffffff',              // Bottom sheet bg
        underlay: '#F7F3EE',           // Pressable underlay

        // Dark mode overrides (applied via dark: prefix)
        'dark-background': '#1A1614',
        'dark-foreground': '#F7F3EE',
        'dark-surface': '#2A2522',
        'dark-divider': '#3D3632',
        'dark-sheet': '#2A2522',
        'dark-underlay': '#1A1614',

        // Feedback
        error: '#B76E6E',              // Dispute
        success: '#7FAF8E',            // Acknowledged / completed
        warning: '#D9B86C',            // Pending

        // Keyboard
        'kbd-button': '#8A8279',
        'kbd-surface': '#3D3632',

        // Warm neutral scale
        neutral: {
          50: '#FAF8F5',
          100: '#F7F3EE',
          200: '#E8E2DA',
          300: '#D4CCC3',
          400: '#C8BFB6',
          500: '#8A8279',
          600: '#6E6A66',
          700: '#524E4A',
          800: '#3D3632',
          900: '#2A2522',
          950: '#1A1614',
        },
      },
    },
  },
};
