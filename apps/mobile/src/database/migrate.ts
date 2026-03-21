import { useMigrations } from 'drizzle-orm/op-sqlite/migrator';

import migrations from '../../drizzle/migrations';

import { db } from './client';

/**
 * Hook to run database migrations on app startup.
 * Returns { success, error } to handle migration state in UI.
 */
export function useDbMigrations() {
  return useMigrations(db, migrations);
}

/**
 * Type for migration status
 */
export type MigrationStatus = {
  success: boolean;
  error?: Error;
};
