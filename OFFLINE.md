# CoParent — Offline-First Architecture Research

> Last updated: March 2026  
> Stack context: React Native 0.83 (bare), Supabase/Postgres, `@op-engineering/op-sqlite` + Drizzle ORM (migrations 0000–0005)

---

## Executive Summary

**Use PowerSync.** It is the only production-ready solution that directly bridges Supabase/Postgres → SQLite on React Native, ships with a first-party `@powersync/drizzle-driver`, and supports SQLCipher encryption via `@powersync/op-sqlite` — all of which means you keep your existing Drizzle ORM schema, keep op-sqlite under the hood, and gain a battle-tested sync layer without rewriting your data model.

The migration cost is real but manageable: swap out the `open()` call for `PowerSyncDatabase`, add a `SupabaseConnector`, define sync rules in the PowerSync dashboard, and wrap your existing Drizzle schema with `DrizzleAppSchema`. Your immutable, append-only entry model is a natural fit for PowerSync's upload queue + server-side conflict resolution — entries never mutate, they version.

---

## Comparison Table

| Criterion | **PowerSync** | **WatermelonDB** | **Custom (op-sqlite + Supabase)** | **ElectricSQL** | **PouchDB/CouchDB** |
|---|---|---|---|---|---|
| **Supabase integration** | ✅ First-class, official | ⚠️ Manual, no adapter | ✅ Full control | ⚠️ HTTP streaming only; write path is your own | ❌ Needs CouchDB server |
| **React Native** | ✅ Official SDK | ✅ Native SQLite | ✅ Your current stack | ⚠️ Web-first; RN is experimental via PGlite | ⚠️ Works but heavy |
| **Encryption** | ✅ SQLCipher via `@powersync/op-sqlite` | ⚠️ Unofficial fork (`10play/WatermelonDBCipher`) | ✅ SQLCipher via `op-sqlite` config flag | ❌ No SQLite encryption | ❌ No file encryption |
| **Drizzle ORM** | ✅ `@powersync/drizzle-driver` (alpha, Sept 2025) | ❌ Own model DSL, incompatible | ✅ Keep as-is | ❌ Own query layer | ❌ Document DB |
| **Conflict resolution** | ✅ LWW default, custom server hooks | ✅ Custom via sync adapters | 🔧 You build it | ✅ CRDT via LWWW | ✅ Built-in MVCC |
| **Partial sync / per-user data** | ✅ Sync Rules (SQL-based filters) | 🔧 Manual in sync adapter | 🔧 Manual with RLS | ✅ Shape-based filtering | 🔧 Manual replication |
| **Offline writes queue** | ✅ Built-in upload queue | ✅ Built-in | 🔧 You build it | ⚠️ HTTP writes through your API | ✅ Built-in |
| **Self-host** | ✅ Source-available (FSL), Docker | N/A (no server) | N/A | ✅ Apache 2.0 | ✅ Apache 2.0 |
| **Pricing (cloud)** | Free tier (50 concurrent, 2 GB/mo); Pro $150+/mo | N/A | $0 (Supabase costs only) | Free tier available | $0 self-host |
| **Migration effort** | Medium — swap client, add connector + sync rules | High — full schema rewrite | Low — build sync logic on existing stack | High — no first-class RN, write path unclear | Very High — wrong paradigm |
| **Maturity / activity** | ✅ Active, production users, 2024–2025 releases | ✅ Stable, slower updates | N/A | ⚠️ Pivoting to web/AI focus in 2025–2026 | ✅ Stable but niche |

---

## Deep Dives

### 1. PowerSync (Recommended)

**What it is:** A dedicated sync middleware service that sits between your Supabase Postgres and your mobile SQLite database. It consumes the Postgres Write-Ahead Log (WAL) and streams changes down to clients via Sync Streams. Client writes go into a local upload queue and are flushed to Supabase when online.

**Architecture:**
```
Supabase Postgres → [PowerSync Service] → SQLite (on device)
                                        ← Upload Queue ←
```

**Why it's the right fit for CoParent:**

1. **Supabase is the primary integration target.** PowerSync was built with Supabase in mind. The official guide, the SupabaseConnector, and the example apps all use Supabase. This is not bolted on — it's the primary use case.

2. **Keeps your current op-sqlite + Drizzle stack.** The `@powersync/op-sqlite` package is a thin wrapper around the same `@op-engineering/op-sqlite` you're using. The `@powersync/drizzle-driver` (released Sept 2025, currently alpha) lets you `wrapPowerSyncWithDrizzle(powerSyncDb, { schema: drizzleSchema })` and use Drizzle queries as-is.

3. **Per-user partial sync via Sync Rules.** CoParent needs to sync only the spaces/children/entries belonging to the logged-in user's co-parenting relationships. Sync Rules are SQL expressions evaluated on the server — you define `WHERE user_id = token.sub` style filters without touching client code.

4. **Encryption is solved.** PowerSync ships `@powersync/op-sqlite` with SQLCipher support (announced Oct 2024). One config flag + passing `encryptionKey` at open time.

5. **Open source / self-hostable.** The PowerSync service is source-available under FSL license. You can self-host via Docker, which matters if CoParent ever needs to certify for legal/custody data compliance.

**What PowerSync does NOT do:**
- It does **not** handle server-side conflict resolution automatically beyond last-write-wins. Custom logic goes in a Supabase Edge Function or RLS policy.
- The Drizzle driver is alpha — migrations via `drizzle-kit` may have rough edges. Watch the `@powersync/drizzle-driver` changelog.
- PowerSync schema and Drizzle schema need to stay in sync (use `DrizzleAppSchema` to derive one from the other).

**Integration sketch:**
```typescript
// client.ts (replaces current open() call)
import { PowerSyncDatabase } from '@powersync/react-native';
import { OPSqliteOpenFactory } from '@powersync/op-sqlite';
import { wrapPowerSyncWithDrizzle, DrizzleAppSchema } from '@powersync/drizzle-driver';
import { drizzleSchema } from './schema';
import { SupabaseConnector } from './supabase-connector';

const factory = new OPSqliteOpenFactory({
  dbFilename: 'coparent.db',
  sqliteOptions: {
    encryptionKey: await Keychain.getEncryptionKey(), // see Encryption section
  },
});

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

export const powerSyncDb = new PowerSyncDatabase({
  database: factory,
  schema: AppSchema,
});

await powerSyncDb.connect(new SupabaseConnector());

export const db = wrapPowerSyncWithDrizzle(powerSyncDb, { schema: drizzleSchema });
```

---

### 2. Custom Sync on op-sqlite + Drizzle (Fallback / Zero Dependency)

**What it is:** Keep the current stack entirely. Implement sync manually using Supabase Realtime subscriptions for inbound changes and REST API calls (or RPC) for outbound writes. Track sync state with a local `sync_metadata` table.

**Why you might choose this:**
- Zero new dependencies, zero new services, zero new pricing tier
- Full control over sync logic, conflict resolution, and retry behavior
- CoParent's immutable model makes sync relatively simple — entries are INSERT-only, acknowledgments are INSERT-only, versions are INSERT-only
- No vendor lock-in beyond Supabase itself

**Why this is risky:**
- **Sync is genuinely hard.** Handling network interruption, partial sync, ordering, and multi-device conflicts requires significant engineering. The current `sync.service.ts` is a stub — you'd be building the real thing from scratch.
- **Realtime subscriptions are not a sync protocol.** They miss changes made while offline. You'd need a delta-fetch strategy (pull since `last_synced_at`) for catch-up — which is exactly what PowerSync implements.
- **No upload queue.** Offline writes need local queuing, conflict detection, and ordered replay. This is weeks of engineering.
- **Maintenance burden.** You own the sync engine forever.

**What a minimal custom sync looks like for CoParent:**
```
Outbound: Local write → op-sqlite → mark row as dirty (pending_sync = true)
          On reconnect → iterate dirty rows, upsert to Supabase via REST
          On success → mark pending_sync = false, update synced_at

Inbound:  On reconnect → pull WHERE updated_at > last_synced_at for each entity
          Apply to local SQLite, update last_synced_at per entity
          Subscribe to Realtime for live updates when online
```

The immutable model helps here: since entries are never updated, only versioned, `pending_sync` rows are always new INSERTs. Conflicts are structurally impossible on the entry level (each version has a unique ID). Conflicts only arise at the acknowledgment/dispute level, which can use server-authoritative last-write-wins.

**Verdict:** Viable for a lean early build, but you will eventually hit edge cases that PowerSync already solved. Use this only if PowerSync's pricing or architecture is a blocker.

---

### 3. WatermelonDB (Not Recommended for CoParent)

**What it is:** A React Native-first SQLite ORM with its own sync protocol. Well-designed for offline-first apps. Has a custom sync adapter pattern where you implement `pullChanges` and `pushChanges`.

**Why it doesn't fit CoParent:**
- **Requires complete schema rewrite.** WatermelonDB uses its own model DSL (class-based, `@lazy`, `@children`, etc.). You cannot use Drizzle with it — it's an either/or choice. All 6 migration files and your entire schema would need to be ported.
- **No official Supabase adapter.** The community has tutorials, but the sync adapter is custom code you write and maintain. The Supabase blog post uses Expo, not bare RN.
- **Encryption is hacky.** Native encryption requires `10play/WatermelonDBCipher`, an unofficial fork that isn't maintained by the WatermelonDB team. In Feb 2025, the Reddit consensus is still "WatermelonDB doesn't support encryption out of the box."
- **Slower development in 2024–2025.** WatermelonDB is stable but not actively gaining features. The ecosystem is thinner than PowerSync's.

**If you did use WatermelonDB**, the Supabase integration pattern is:
1. Implement `pullChanges` to call a Supabase RPC that returns a delta since `last_pulled_at`
2. Implement `pushChanges` to apply local changes to Supabase via upsert
3. Handle `_status` and `_changed` columns that WatermelonDB adds to each table

This is significant backend work on top of the schema rewrite. Not worth it given PowerSync exists.

---

## Encryption Approach

### Strategy: SQLCipher + Keychain/Keystore

**What to encrypt:** The entire database file at rest. SQLCipher encrypts at the page level with 256-bit AES, with negligible (~5%) overhead.

**op-sqlite SQLCipher setup:**
```json
// package.json
{
  "op-sqlite": {
    "sqlcipher": true
  }
}
```

```typescript
// With plain op-sqlite
import { open } from '@op-engineering/op-sqlite';
const db = open({ name: 'coparent.db', encryptionKey: key });

// With PowerSync
const factory = new OPSqliteOpenFactory({
  dbFilename: 'coparent.db',
  sqliteOptions: { encryptionKey: key },
});
```

**Key management — where to store the key:**

Use `react-native-keychain` (most mature, widely used, hardware-backed on supported devices):

```typescript
import * as Keychain from 'react-native-keychain';
import { randomBytes } from 'react-native-quick-crypto'; // or expo-crypto

const DB_KEY_SERVICE = 'coparent.db.key';

async function getOrCreateDbKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({ service: DB_KEY_SERVICE });
  if (existing) return existing.password;

  // First launch: generate and store key
  const key = randomBytes(32).toString('hex');
  await Keychain.setGenericPassword('coparent', key, {
    service: DB_KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    // On Android, uses Android Keystore (hardware-backed on modern devices)
    // On iOS, uses Secure Enclave / Keychain
  });
  return key;
}
```

**iOS:** Uses Keychain Services. With `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, the key is not backed up to iCloud and cannot be restored to another device.

**Android:** Uses EncryptedSharedPreferences backed by Android Keystore. On devices with StrongBox (Pixel 3+, most modern flagships), the key never leaves the secure hardware element.

**Key rotation:** For CoParent, key rotation is complex (requires re-encrypting the entire database). The pragmatic approach: generate the key once at install, tie it to the device. If the user loses the device, they lose local data — that's acceptable since everything syncs from Supabase on reinstall.

**What SQLCipher does NOT protect against:**
- A rooted/jailbroken device where the attacker can read Keychain
- An attacker with the unlocked device (key is in memory while app is open)
- Supabase-side data (that's handled by Supabase's RLS and at-rest encryption)

For CoParent's threat model (protect sensitive family/legal data from casual device access, exfiltration, or backup extraction), SQLCipher + Keychain is the right level.

---

## Conflict Resolution Strategy

### CoParent's Immutable Model is an Advantage

The core insight: CoParent's data model is fundamentally **append-only**:
- Timeline entries are never edited — new versions are created (`entry_versions`)
- Acknowledgments are immutable once created
- Audit logs are immutable by definition
- Disputes create new records, not edits

This collapses most conflict scenarios. The only "conflict" is: two devices both offline, both create something, both sync back. Since everything has a UUID primary key and `created_at` timestamp, there are **no update conflicts** — only potential duplicate inserts.

### Recommended Strategy: Idempotent Inserts + Server Authority on Mutations

**Entries / Versions / Acknowledgments / Audit Logs:**
```sql
-- Supabase schema: use ON CONFLICT DO NOTHING (or DO UPDATE for idempotency)
INSERT INTO entries (id, created_at, ...) 
ON CONFLICT (id) DO NOTHING;
```
Both devices create entry with UUID `abc-123`. Both try to sync. First one wins, second is a no-op. The local copy on both devices is identical. No conflict to resolve.

**Space membership changes / disputes:**
These can mutate (a space admin adds/removes a member). These use last-write-wins at the Supabase level:
```sql
INSERT INTO space_members (id, space_id, user_id, role, updated_at)
ON CONFLICT (space_id, user_id) DO UPDATE SET 
  role = EXCLUDED.role, 
  updated_at = EXCLUDED.updated_at
WHERE EXCLUDED.updated_at > space_members.updated_at;
```

**With PowerSync:**
The SupabaseConnector's `uploadData` method is where you implement this logic. PowerSync calls it with a queue of pending writes. You write the Supabase upsert logic there. LWW is the default if you just do a straight upsert — which is correct for CoParent's append-only model.

**Audit trail integrity:**
Since audit logs are created locally and synced, ensure audit log entries include:
- `device_id` (set at install, stored in Keychain)
- `local_created_at` (device time)
- `server_created_at` (set by Supabase trigger on INSERT)
- `user_id` (from Supabase auth)

This preserves the causal record even if device clocks are skewed.

### No CRDTs Needed

CRDTs (Conflict-free Replicated Data Types) are the right choice when you have concurrent edits to the same data (e.g., collaborative text editing, counters). CoParent doesn't have this. Version append + idempotent inserts is simpler, auditable, and correct for this domain.

---

## Migration Path from Current Stack

### Current State
```
@op-engineering/op-sqlite (v15.2.7)
  └── drizzle-orm (v0.45.1)
       └── migrations: 0000–0005
            └── coparent.db (unencrypted)
```

### Target State (with PowerSync)
```
@powersync/op-sqlite (wraps @op-engineering/op-sqlite with SQLCipher)
  └── PowerSyncDatabase
       └── @powersync/drizzle-driver
            └── wrapPowerSyncWithDrizzle(powerSyncDb, { schema })
                 └── existing Drizzle schema (minimal changes)
```

### Step-by-Step Migration

**Phase 1: Add encryption (no sync yet)**

1. Add `"op-sqlite": { "sqlcipher": true }` to `package.json`
2. Add `react-native-keychain`
3. Update `client.ts` to read key from Keychain and pass as `encryptionKey`
4. Handle existing unencrypted databases on first upgrade:
   ```typescript
   // Encrypt existing DB on first launch after update
   // SQLCipher supports ATTACH + sqlcipher_export to re-encrypt in place
   ```
5. Test thoroughly — this is a destructive operation if botched

**Phase 2: Install PowerSync**

```bash
yarn add @powersync/react-native @powersync/op-sqlite @powersync/drizzle-driver
```

Note: `@powersync/op-sqlite` replaces direct `@op-engineering/op-sqlite` usage. It's a wrapper, not a replacement package — you may need both in `package.json` depending on version.

**Phase 3: Add PowerSync schema alongside Drizzle schema**

Your existing Drizzle schema tables map 1:1 to PowerSync tables. Use `DrizzleAppSchema` to auto-derive the PowerSync schema:

```typescript
import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import * as schema from './schema'; // your existing drizzle schema files

export const AppSchema = new DrizzleAppSchema(schema);
```

Caveat: PowerSync's local SQLite is read-only for synced tables (PowerSync manages writes via the upload queue). Local-only tables (e.g., `sync_metadata`, UI state) must be marked `{ localOnly: true }`.

**Phase 4: Create SupabaseConnector**

```typescript
import { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/react-native';
import { supabase } from '../lib/supabase'; // your existing Supabase client

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      endpoint: POWERSYNC_URL, // from .env
      token: session?.access_token ?? '',
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const batch = await database.getCrudBatch(200);
    if (!batch) return;

    for (const op of batch.crud) {
      const { table, op: opType, id, opData } = op;
      if (opType === 'PUT') {
        await supabase.from(table).upsert({ id, ...opData });
      } else if (opType === 'DELETE') {
        // CoParent shouldn't delete much — soft delete preferred
        await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
      }
    }
    
    await batch.complete();
  }
}
```

**Phase 5: Define Sync Rules in PowerSync Dashboard**

```yaml
# sync_rules.yaml
bucket_definitions:
  user_spaces:
    parameters:
      - name: user_id
        token_parameter: sub
    data:
      - SELECT * FROM spaces WHERE id IN (
          SELECT space_id FROM space_members WHERE user_id = bucket.user_id
        )
      - SELECT * FROM space_members WHERE space_id IN (
          SELECT id FROM spaces WHERE id IN (
            SELECT space_id FROM space_members WHERE user_id = bucket.user_id
          )
        )
      - SELECT * FROM entries WHERE space_id IN (...)
      - SELECT * FROM entry_versions WHERE entry_id IN (...)
      - SELECT * FROM acknowledgments WHERE entry_id IN (...)
      - SELECT * FROM children WHERE space_id IN (...)
      - SELECT * FROM audit_logs WHERE space_id IN (...)
```

**Phase 6: Handle existing Drizzle migrations**

PowerSync manages its own local SQLite schema for synced tables. Your Drizzle migrations (0000–0005) were for the unmanaged schema. Going forward:

- **Synced tables:** Schema changes happen in Supabase first, then Sync Rules are updated, then `DrizzleAppSchema` auto-derives the new local schema
- **Local-only tables:** Continue using Drizzle Kit migrations
- The `drizzle/` folder migrations become Supabase migration references, not local ones

**Phase 7: Update `sync.service.ts`**

The stub `pullEntries` / `pushEntry` methods can be deleted. PowerSync handles this automatically. `SyncService` can be simplified to track `powerSyncDb.currentStatus` for UI feedback.

### Migration Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Drizzle driver alpha bugs | Medium | Pin version, test thoroughly, have fallback to raw SQL |
| Existing db encryption migration | High | Test on device with existing data; use SQLCipher's `ATTACH` export method |
| Sync Rules misconfiguration (data leak) | Medium | Test with two user accounts; verify RLS + Sync Rules alignment |
| PowerSync service downtime | Low | App continues working offline; sync resumes on restore |
| Breaking change in PowerSync SDK | Low | SDK is versioned; they have migration guides |

---

## Decision Recommendation

### Use PowerSync

**Rationale:**

1. **It solves the actual hard problem.** The `sync.service.ts` in CoParent is a stub with a comment saying "real sync implementation in a later story." That story is PowerSync. Building a custom sync engine to the quality PowerSync offers would take weeks and introduce years of maintenance.

2. **Stack preservation.** You keep op-sqlite (same package, just wrapped), you keep Drizzle ORM (first-party driver), you keep Supabase. The surface area of change is: one new client wrapper, one new connector class, one config file in the PowerSync dashboard.

3. **Encryption is native to the integration.** `@powersync/op-sqlite` + SQLCipher + Keychain is the documented, tested path for encrypted offline apps with PowerSync. This is not a workaround — it's how it's designed to be used.

4. **CoParent's immutable model is a sync-easy model.** Append-only entries mean no complex CRDT or OT logic. PowerSync's upload queue + Supabase upserts with `ON CONFLICT DO NOTHING` is correct and sufficient.

5. **Self-hostable when you need it.** For legal/custody data, you may eventually need to run your own infrastructure. PowerSync's FSL-licensed service can be self-hosted.

**The only real risk** is the Drizzle driver being alpha. Mitigation: keep a raw SQL escape hatch for critical queries, and watch the PowerSync releases page.

### What to implement first

1. SQLCipher encryption (Phase 1) — standalone, no sync dependency, immediate privacy win
2. PowerSync integration (Phases 2–5) — core sync engine
3. Sync Rules (Phase 5) — data partitioning per co-parenting space
4. Delete `sync.service.ts` stub, replace with PowerSync status hooks

### Cost

- **Development tier:** Free (50 concurrent connections, 2 GB/month) — sufficient for early users
- **Pro tier:** ~$150/month — when you need 1,000 concurrent connections
- **Self-host:** Free if you run your own server (Docker image available)

For a pre-revenue SaaS, start on the free tier. Upgrade when you hit limits — by then, you'll have revenue to justify it.

---

## References

- [PowerSync + Supabase Integration Guide](https://docs.powersync.com/integrations/supabase/guide.md)
- [PowerSync + Drizzle Driver](https://docs.powersync.com/client-sdks/orms/js/drizzle)
- [SQLCipher Support Announcement (Oct 2024)](https://releases.powersync.com/announcements/announcing-sqlcipher-support)
- [Drizzle ORM Integration Announcement (Sept 2025)](https://releases.powersync.com/announcements/drizzle-orm-integration-for-react-native-and-js-web-alpha)
- [PowerSync Open Source](https://www.powersync.com/open-source)
- [op-sqlite SQLCipher docs](https://op-engineering.github.io/op-sqlite/docs/installation/)
- [react-native-keychain](https://www.npmjs.com/package/react-native-keychain)
- [ElectricSQL (now pivoting to web/AI, not recommended for RN)](https://electric-sql.com)
