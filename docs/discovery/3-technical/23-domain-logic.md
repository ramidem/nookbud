# Nookbud — Domain Logic

> **Date:** 2026-04-07
> **Status:** ✅ Documented (Phases 1–3 implemented)

---

## Domain Concepts

### Child
A child associated with a Space. Belongs to exactly one Space. Has: name, date of birth, optional avatar. Multiple children can be in one Space (e.g., siblings).

### Entry
An immutable record of a care event. Every entry has:
- Type (expense, event, agreement, communication, milestone, upload)
- Creator (space member who created it)
- Server-set timestamp
- Version number (starts at 1)
- Optional: `requires_ack` flag
- Optional: child association

Entry types and their key fields:
| Type | Key Fields |
|------|-----------|
| **Expense** | amount, currency, category, description, paid_by, shared_with |
| **Event** | title, event_type (pickup, medical, school, activity, other), date, location, outcome |
| **Agreement** | title, description, effective_date, parties |
| **Communication** | channel (in-person, phone, text, email, app), summary, tone |
| **Milestone** | title, description, child_id, milestone_date |
| **Upload** | file_name, file_type, file_size, storage_url, sha256_hash |

### Entry Version
Created on every edit. Links to prior version via `previous_version_id`. Stores: diff, `edited_by`, `edited_at` (server timestamp). The original (version 1) is never overwritten.

### Acknowledgment
A response to an entry marked `requires_ack`. States: PENDING → ACKNOWLEDGED or DISPUTED. Disputed entries require a `dispute_note`.

### Verified Care Report
The export artifact. Two formats:
- **PDF** — human-readable; entries, versions, acknowledgment status, file list with hashes
- **Evidence Bundle (ZIP)** — PDF + `data.json` + `attachments/` + `manifest.txt` (SHA-256 of every file)

---

## Business Rules

### Entry Rules
1. Entries are never hard deleted — soft delete creates a `deleted_at` timestamp
2. An entry edit = new version; `version` integer increments
3. Timestamps (`created_at`, `updated_at`) are always server-set — never client-set
4. File hashes are computed server-side on upload; client cannot supply the hash
5. `requires_ack` can only be set at creation (not added retroactively)

### Acknowledgment Rules
1. Only members with `editor` role or above can acknowledge or dispute an entry
2. The creator of an entry cannot acknowledge their own entry
3. DISPUTED requires a `dispute_note` — cannot dispute without explanation
4. After the creator edits a disputed entry (creating a new version), the acknowledgment for that entry resets to PENDING
5. EXPIRED after 14 days with no response — system-triggered, not user-triggered

### Export Rules
1. Export is available to all roles (owner, editor, viewer)
2. Export respects Space scope — viewer of Space A cannot export Space B
3. Full version history of all entries in scope is included
4. SHA-256 hashes for all file attachments are included in both PDF and manifest

---

## Calculations

### SHA-256 File Integrity
```
hash = sha256(file_bytes)          # computed server-side on upload
manifest_line = "{hash}  {filename}"  # space-delimited, like shasum output
```

Verification (anyone with the ZIP can run):
```bash
sha256sum -c manifest.txt          # verifies all files in bundle
```

### Export Filename Convention
```
nookbud-export-{spaceSlug}-{YYYY-MM-DD}.pdf
nookbud-bundle-{spaceSlug}-{YYYY-MM-DD}.zip
```

---

## Terminology Decisions

| Concept | Term Used | Rationale |
|---------|-----------|-----------|
| Entry labels | co-parent, guardian, grandparent, etc. | Display-only, non-functional — flexible for all family structures |
| Export | Verified Care Report | "Verified" = hashed; "Care" = warm; "Report" = professional |
| Record bundle | Evidence Bundle | Only used in professional context (export to lawyer) |

---

**Sources:** prd.md (deleted 2026-10-14 — superseded by ROADMAP-2026.md) (Phases 1–3), `docs/firebase-spec.md`, BRIEF.md
