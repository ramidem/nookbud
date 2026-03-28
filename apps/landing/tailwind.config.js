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
      fontFamily: {
        garamond: ['"EB Garamond"', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
};
