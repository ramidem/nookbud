/* eslint-disable sort-keys */
const preset = require('../../libs/design-tokens/src/tailwind-preset.web');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sage: '#4A7C59',
          'sage-light': '#5A9A6B',
          offwhite: '#FAF8F4',
          amber: '#D4845A',
          charcoal: '#2C2C2C',
          gray: '#9A9490',
          surface: '#EDF3EF',
          border: '#E8E4DF',
        },
      },
    },
  },
};
