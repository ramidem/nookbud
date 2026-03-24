import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { parse } from 'dotenv';
import path from 'path';

// Load .env for the virtual @env module (never expose service role key)
const envPath = path.resolve(__dirname, '.env');
const envVars = parse(readFileSync(envPath, 'utf-8'));

function envPlugin() {
  const virtualId = '@env';
  const resolvedId = '\0' + virtualId;
  return {
    name: 'vite-plugin-react-native-dotenv',
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id === resolvedId) {
        return `
          export const IS_LIVE = ${JSON.stringify(envVars.IS_LIVE ?? 'false')};
          export const STORAGE_KEY = ${JSON.stringify(envVars.STORAGE_KEY ?? '')};
          export const API_BASE_URL = ${JSON.stringify(envVars.API_BASE_URL ?? '')};
          export const SUPABASE_API_KEY = ${JSON.stringify(envVars.SUPABASE_API_KEY ?? '')};
        `;
      }
    },
  };
}

const extensions = [
  '.mjs',
  '.web.tsx',
  '.tsx',
  '.web.ts',
  '.ts',
  '.web.jsx',
  '.jsx',
  '.web.js',
  '.js',
  '.css',
  '.json',
];

const rollupPlugin = (matchers: RegExp[]) => ({
  name: 'js-in-jsx',
  load(id: string) {
    if (matchers.some((matcher) => matcher.test(id)) && id.endsWith('.js')) {
      const file = readFileSync(id, { encoding: 'utf-8' });
      return esbuild.transformSync(file, { loader: 'jsx', jsx: 'automatic' });
    }
  },
});

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/mobile',
  define: {
    global: 'window',
  },
  resolve: {
    extensions,
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
      '@react-native/assets-registry/registry':
        'react-native-web/dist/modules/AssetRegistry/index',
    },
  },
  build: {
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    outDir: '../../dist/apps/mobile/web',
    rollupOptions: {
      plugins: [rollupPlugin([/react-native-vector-icons/])],
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
    },
  },
  plugins: [react(), nxViteTsPaths(), envPlugin()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
});
