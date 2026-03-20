import { drizzle } from 'drizzle-orm/op-sqlite';
import { open } from '@op-engineering/op-sqlite';

const DATABASE_NAME = 'coparent.db';

// Open the SQLite database
const opsqlite = open({
  name: DATABASE_NAME,
});

// Create Drizzle instance
export const db = drizzle(opsqlite);

// Export the raw sqlite connection for migrations and direct queries
export { opsqlite };
