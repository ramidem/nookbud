# CoParent — Discovery Brief

> Shared records for everyone raising a child.

---

## 1. Problem Statement

Anyone responsible for raising a child — whether separated parents, married couples, OFW families, grandparent guardians, adoptive families, or blended households — faces a fundamental problem: **care decisions are made daily, but there is no shared, verifiable record of what happened, when, and who was responsible.**

This isn't only a problem in conflict. It's a problem whenever more than one person shares responsibility for a child's wellbeing and needs to stay accountable, coordinated, and — if it ever matters — provably involved.

Current solutions:
- **Spreadsheets** — editable, no audit trail, not defensible
- **Text messages / WhatsApp groups** — fragmented, out of context, hard to export, easily disputed
- **Co-parenting apps** — assume a 2-parent conflict model; no support for guardians, extended family, or multiple care arrangements
- **Email chains** — disorganized, no structure, easy to manipulate
- **Verbal agreements** — no record at all; memory is unreliable

**The gap:** No existing tool provides a **shared, verifiable record of a child's care** that works across family structures, supports multiple caregivers with different roles, and produces defensible documentation when it matters — whether for courts, schools, hospitals, or immigration.

---

## 2. Product Vision

CoParent is a **shared care records platform** — a single source of truth for everyone raising a child together.

It answers, with proof:
- What happened?
- When did it happen?
- Who did it?
- Was it acknowledged by the other caregivers?
- Has the record been altered?

**Think:**
- Part care timeline
- Part verified record system
- Part coordination layer for shared responsibility

CoParent works in peace and proves in conflict. Most users will never need court. But every record they create is court-ready from day one — because the same architecture that makes records trustworthy for a family also makes them trustworthy for a judge.

---

## 3. Core Principles (Verified Records Design)

| Principle | What It Means |
|-----------|---------------|
| **Immutability** | No silent edits — every change creates a new version |
| **Traceability** | Full history of who did what, when |
| **Authenticity** | Cryptographic proof of authorship |
| **Integrity** | Data cannot be tampered without detection |
| **Exportability** | Usable anywhere trust matters — courts, schools, hospitals, agencies |

---

## 4. Core Concept: Spaces

A **Space** is a care circle — one arrangement around a child or group of children. It is the organizing primitive of CoParent.

**Why Spaces:**
- A father with children from two different relationships needs two separate Spaces — with different members, different children, different records
- A grandmother raising a grandchild while the parent works abroad needs a Space with the OFW parent
- An adoptive family with a biological parent contact agreement needs a Space with three members
- A blended family manager might belong to three Spaces across different arrangements

**Space members have roles:**

| Role | Access |
|------|--------|
| `owner` | Full control — created the Space, manages members |
| `parent` | Full read/write — log entries, acknowledge, dispute |
| `guardian` | Full read/write — same as parent, for non-parent caregivers |
| `lawyer` | Read-only — view records, export, but cannot create entries |
| `viewer` | Read-only — limited visibility, ideal for mediators or coordinators |

A user can belong to **multiple Spaces** and switch between them. An "All Spaces" view merges timelines across arrangements.

---

## 5. Core Features

### 5.1 Timeline (Care Feed)

Every action = immutable entry within a Space.

**Entry Types:**
- Expense (receipts, reimbursements, support payments)
- Event (pickups, dropoffs, school activities, medical appointments)
- Agreement (decisions made together by Space members)
- Communication (structured messages — evidence-grade, not chat)
- Upload (documents, photos, videos)

**Entry Metadata:**
- UUID, timestamp (server-side), created_by
- space_id, child_id, type, content (JSON)
- attachments, status (active / amended / disputed)

---

### 5.2 Audit Trail

**Every change creates a new record. Nothing is overwritten.**

Example:
```
Entry v1 (original)    → 2026-01-15 09:00
Entry v2 (edited)      → 2026-01-15 14:30  [diff: amount changed]
Entry v3 (corrected)   → 2026-01-16 08:00  [diff: note added]
```

Each version includes:
- Timestamp
- Who edited
- Diff of changes

**This is what makes the record defensible.**

---

### 5.3 Acknowledgment System

Entries can be:
- `pending` — waiting for other Space members
- `acknowledged` — confirmed by one or more members
- `disputed` — flagged with reason

Each action logs: user_id, timestamp, optional comment.

---

### 5.4 Dispute Layer

Any entry can be flagged:
- Dispute reason
- Counter-evidence upload
- Threaded responses

**Captures all sides of the story.**

---

### 5.5 Calendar (Responsibility Ledger)

Not just dates — **responsibility mapping.**

Each event:
- Assigned member
- Status (completed / missed)
- Notes

All changes logged: who, when, what changed.

---

### 5.6 Media & Document Storage

Supported: images, PDFs, videos (optional)

Each file:
- Hashed (SHA-256) at upload
- Timestamped
- Linked to entry within a Space

**Hash verification proves file integrity.**

---

## 6. Security & Encryption

### Data Protection
| Layer | Method |
|-------|--------|
| At rest | AES-256 (database + file storage) |
| In transit | TLS 1.3 |
| File integrity | SHA-256 hash stored with each file |
| Passwords | Argon2 hashing |

### Access Control
- Role-based: owner, parent, guardian, lawyer, viewer
- Scoped per Space — members only see Spaces they belong to
- No deletion — soft delete only (visible in audit)
- All actions logged

### Tamper Resistance
- No hard deletes
- All edits create new versions
- Separate audit_log table

---

## 7. Verified Care Report (Export)

### Export Types

**A. Timeline Report (PDF)**
- All entries within a Space, chronological
- Timestamps, authors, status
- Attachments inline
- Human-readable for lawyers, judges, schools, hospitals, or agencies

**B. Evidence Bundle (ZIP)**
- JSON data (machine-readable)
- PDF summary
- All attachments
- Hash manifest file

**C. Audit Report**
- Full edit history
- Acknowledgment logs
- Dispute logs

### Export Features
- Date range filter
- Child filter
- Entry type filter
- Space filter (single or all)
- Verification layer (hashes, timestamps, system signature)

---

## 8. Data Model (Simplified)

```
users
spaces
space_members (user_id, space_id, role)
children (linked to spaces)
entries (scoped to spaces)
entry_versions
attachments
acknowledgments
disputes
audit_logs
```

---

## 9. MVP Scope

### Must-Have (Phase 1 — Complete)
- [x] Timeline with all entry types
- [x] File uploads with hash verification
- [x] Audit trail (version history)
- [x] Acknowledgment system
- [x] Verified care report export (PDF + ZIP)
- [x] Role-based access (2 members)

### Phase 2 (Complete)
- [x] Native UX improvements (date pickers, calendar)
- [x] Partner invite system
- [x] Supabase foundation
- [x] Push notifications

### Phase 3 (Next)
- [ ] Spaces — multi-space support, roles, Space switcher
- [ ] All Spaces timeline view
- [ ] Onboarding rewrite (create first Space)
- [ ] Space settings (rename, emoji/color, manage members)

### Later Phases
- [ ] Lawyer/viewer access portal
- [ ] Shared export links
- [ ] Expense summaries and care pattern insights
- [ ] Digital signatures (PKI)
- [ ] Calendar sync (Google/Apple)

---

## 10. UX Principles

### Inclusive Language
| Avoid | Use Instead |
|-------|-------------|
| "Parent A / Parent B" | "Space member" or member's name |
| "Co-parent" (as label) | "Member" or role name |
| "You owe" | "Recorded" |
| "Debt" | "Balance" |
| "Failed to" | "Not completed" |
| "Court-ready" (in positioning) | "Verified records" |
| "Evidence bundle" | "Verified care report" |
| "Evidence" (in UI) | "Record" |
| "Custody" (in UI) | "Care arrangement" |
| "Violation" | "Unresolved item" |

### Care-Aware Design
- No aggressive notifications
- No blame framing
- Equal visibility for all Space members
- Calm, professional tone
- Inclusive of all family structures — the UI never assumes two parents

### Simplicity
Backend is complex. **Frontend must feel simple.**
- One timeline per Space, scrollable
- Clear status indicators
- One-tap acknowledge/dispute
- Space switcher in the header for multi-space users

---

## 11. Competitive Positioning

**Most family coordination apps:**
- Assume two parents in conflict
- Track expenses and allow chat
- Focus on scheduling

**CoParent:**
- Works for any care arrangement — not just divorce
- Spaces model supports multiple caregivers with defined roles
- Creates verified, defensible records — not just logs
- Inclusive by design: guardians, lawyers, extended family are first-class members
- Works in peace, proves when it matters

---

## 12. Positioning Statement

> **CoParent** — Shared records for everyone raising a child.

### Tagline Options
- "Every child deserves a clear record of their care."
- "Shared responsibility. Verified records."
- "For everyone raising a child, together."
- "Build the record now. It speaks for itself later."

---

## 13. Strategic Insight

**You are not building a conflict-resolution tool.**

You are building **shared care accountability infrastructure.**

If done right:
- Useful for any family that shares responsibility for a child
- Indispensable when trust is tested
- Becomes the source of truth that everyone in the care circle relies on
- Spaces model means the product grows with the complexity of real families

The market is not "divorced parents." The market is **everyone who shares responsibility for raising a child** — and needs a record they can all trust.

---

## Next Steps

1. **Market Research** — Validate broader market beyond divorce, size the opportunity across family structures
2. **Competitor Analysis** — Assess gaps in existing tools through the Spaces/inclusive lens
3. **ICP Development** — Build 5 personas across family structures
4. **PRD** — Full product requirements with Spaces as a core primitive

---

*This brief is the input for discovery. All discovery docs should reflect the inclusive framing and Spaces model defined here.*
