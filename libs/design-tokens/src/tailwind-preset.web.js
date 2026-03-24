/* eslint-disable sort-keys */

const base = require('./tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  theme: {
    ...base.theme,
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      'sans-italic': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      medium: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      'medium-italic': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      semibold: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      'semibold-italic': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      bold: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      'bold-italic': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['EB Garamond', 'ui-serif', 'Georgia', 'serif'],
      'serif-medium': ['EB Garamond', 'ui-serif', 'Georgia', 'serif'],
      'serif-semibold': ['EB Garamond', 'ui-serif', 'Georgia', 'serif'],
      'serif-bold': ['EB Garamond', 'ui-serif', 'Georgia', 'serif'],
    },
  },
};
