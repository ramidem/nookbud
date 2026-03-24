/* eslint-disable sort-keys */

const preset = require('../../libs/design-tokens/src/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
};
