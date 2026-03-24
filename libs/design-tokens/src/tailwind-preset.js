/* eslint-disable sort-keys */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    fontFamily: {
      sans: 'InterRegular',
      'sans-italic': 'InterItalic',
      medium: 'InterMedium',
      'medium-italic': 'InterMediumItalic',
      semibold: 'InterSemiBold',
      'semibold-italic': 'InterSemiBoldItalic',
      bold: 'InterBold',
      'bold-italic': 'InterBoldItalic',
      serif: 'EBGaramond-Regular',
      'serif-medium': 'EBGaramond-Medium',
      'serif-semibold': 'EBGaramond-SemiBold',
      'serif-bold': 'EBGaramond-Bold',
    },
    extend: {
      flex: {
        2: '2 2 0%',
      },
      colors: {
        white: '#ffffff',
        black: '#000000',

        // Brand
        primary: '#6F8F7B',
        accent: '#C97C5D',
        'accent-soft': '#D8A7A0',
        secondary: '#C8BFB6',

        // Semantic — light-first
        background: '#F7F3EE',
        foreground: '#2F2F2F',
        surface: '#ffffff',
        divider: '#C8BFB6',
        subtitle: '#6E6A66',
        placeholder: '#B0A99F',
        muted: '#C8BFB6',
        disabled: '#C8BFB6',
        overlay: '#2F2F2F',
        sheet: '#ffffff',
        underlay: '#F7F3EE',

        // Dark mode overrides
        'dark-background': '#1A1614',
        'dark-foreground': '#F7F3EE',
        'dark-surface': '#2A2522',
        'dark-divider': '#3D3632',
        'dark-sheet': '#2A2522',
        'dark-underlay': '#1A1614',

        // Feedback
        error: '#B76E6E',
        success: '#7FAF8E',
        warning: '#D9B86C',

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
