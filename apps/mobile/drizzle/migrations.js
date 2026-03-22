// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './0000_bright_korath.sql';
import m0001 from './0001_spaces_migration.sql';
import m0002 from './0002_rbac_simplification.sql';
import m0003 from './0003_member_label.sql';
import m0004 from './0004_resources.sql';
import m0005 from './0005_space_archived.sql';
import m0006 from './0006_user_name_split.sql';
import m0007 from './0007_child_role.sql';
import journal from './meta/_journal.json';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
    m0006,
    m0007,
  },
};
