// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './0000_bright_korath.sql';
import m0001 from './0001_spaces_migration.sql';
import m0002 from './0002_rbac_simplification.sql';
import journal from './meta/_journal.json';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
  },
};
