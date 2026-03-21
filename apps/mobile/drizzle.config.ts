import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  out: './drizzle',
  schema: './src/database/schema/index.ts', // Required for React Native SQLite migration format
});
