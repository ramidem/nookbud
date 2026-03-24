/* eslint-disable sort-keys */

/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const preset = require('../../libs/design-tokens/src/tailwind-preset');

module.exports = {
  presets: [preset],
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.box': `border border-black`,
      });
    }),
  ],
};
