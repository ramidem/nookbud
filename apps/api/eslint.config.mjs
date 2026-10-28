import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    // Log through Nest's Logger only, and never a password, token or message body (R29, SEC-8).
    files: ['src/**/*.ts'],
    rules: { 'no-console': 'error' },
  },
];
