import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...nx.configs['flat/react-typescript'],
  ...baseConfig,
  {
    ignores: ['.next/**/*', '**/out-tsc'],
  },
  {
    // Nothing the app logs may hold a password, token or message (R29, SEC-8). Until there is a
    // logger that redacts, the app does not log at all. Scripts print their own reports.
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-console': 'error' },
  },
  {
    // Auth goes through `@/auth`, so the provider can change without touching the app.
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    ignores: ['src/auth/providers/**', 'src/data/providers/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*'],
              message:
                "Use the auth module: import { getAuth } from '@/auth'. Only src/auth/providers and src/data/providers may import @supabase/*.",
            },
          ],
        },
      ],
    },
  },
];
