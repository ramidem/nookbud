# CoParent — Discovery Brief

> A tamper-resistant, verifiable record system for co-parenting.

---

## 1. Problem Statement

Co-parents in conflict (separated, divorced, or never-married) face a fundamental problem: **memory is disputed, records are incomplete, and courts demand evidence.**

Current solutions:
- **Spreadsheets** — editable, no audit trail, not court-ready
- **Text messages** — fragmented, out of context, hard to export
- **Co-parenting apps** — focus on scheduling/chat, not legal defensibility
- **Email chains** — disorganized, no structure, easy to manipulate

**The gap:** No existing tool treats co-parenting records as **legal evidence** from day one.

---

## 2. Product Vision

CoParent is a **legally defensible record of co-parenting activity.**

It answers, with proof:
- What happened?
- When did it happen?
- Who did it?
- Was it acknowledged?
- Has it been altered?

**Think:**
- Part timeline
- Part evidence locker
- Part coordination system

---

## 3. Core Principles (Court-Ready Design)

| Principle | What It Means |
|-----------|---------------|
| **Immutability** | No silent edits — every change creates a new version |
| **Traceability** | Full history of who did what, when |
| **Authenticity** | Cryptographic proof of authorship |
| **Integrity** | Data cannot be tampered without detection |
| **Exportability** | Usable in court without technical expertise |

---

## 4. Core Features

### 4.1 Timeline (Evidence Feed)

Every action = immutable entry.

**Entry Types:**
- Expense (receipts, reimbursements)
- Event (pickups, dropoffs, activities)
- Agreement (decisions made together)
- Communication (structured messages, not chat)
- Upload (documents, photos, videos)

**Entry Metadata:**
- UUID, timestamp (server-side), created_by
- child_id, type, content (JSON)
- attachments, status (active / amended / disputed)

---

### 4.2 Audit Trail

**Every change creates a new record. Nothing is overwritten.**

Example:
```
Entry v1 (original)    → 2024-01-15 09:00
Entry v2 (edited)      → 2024-01-15 14:30  [diff: amount changed]
Entry v3 (corrected)   → 2024-01-16 08:00  [diff: note added]
```

Each version includes:
- Timestamp
- Who edited
- Diff of changes

**This is what makes it court-defensible.**

---

### 4.3 Acknowledgment System

Entries can be:
- `pending` — waiting for other parent
- `acknowledged` — confirmed by other parent
- `disputed` — flagged with reason

Each action logs: user_id, timestamp, optional comment.

---

### 4.4 Dispute Layer

Any entry can be flagged:
- Dispute reason
- Counter-evidence upload
- Threaded responses

**Captures both sides of the story.**

---

### 4.5 Calendar (Responsibility Ledger)

Not just dates — **responsibility mapping.**

Each event:
- Assigned parent
- Status (completed / missed)
- Notes

All changes logged: who, when, what changed.

---

### 4.6 Media & Document Storage

Supported: images, PDFs, videos (optional)

Each file:
- Hashed (SHA-256) at upload
- Timestamped
- Linked to entry

**Hash verification proves file integrity.**

---

## 5. Security & Encryption

### Data Protection
| Layer | Method |
|-------|--------|
| At rest | AES-256 (database + file storage) |
| In transit | TLS 1.3 |
| File integrity | SHA-256 hash stored with each file |
| Passwords | Argon2 hashing |

### Access Control
- Role-based: Parent A, Parent B, Viewer (lawyer/court)
- No deletion — soft delete only (visible in audit)
- All actions logged

### Tamper Resistance
- No hard deletes
- All edits create new versions
- Separate audit_log table

---

## 6. Court-Ready Export (Killer Feature)

### Export Types

**A. Timeline Report (PDF)**
- All entries, chronological
- Timestamps, authors, status
- Attachments inline
- Human-readable for lawyers/judges

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
- Verification layer (hashes, timestamps, system signature)

---

## 7. Data Model (Simplified)

```
users
children
entries
entry_versions
attachments
acknowledgments
disputes
audit_logs
```

---

## 8. MVP Scope

### Must-Have (Phase 1)
- [ ] Timeline with all entry types
- [ ] File uploads with hash verification
- [ ] Audit trail (version history)
- [ ] Acknowledgment system
- [ ] Court-ready export (PDF + ZIP)
- [ ] Role-based access (2 parents)

### Later Phases
- [ ] Digital signatures (PKI)
- [ ] Blockchain anchoring (optional)
- [ ] Lawyer/mediator portal
- [ ] Calendar sync (Google/Apple)
- [ ] Push notifications (conflict-aware)

---

## 9. UX Principles

### Neutral Language
| Avoid | Use Instead |
|-------|-------------|
| "You owe" | "Recorded" |
| "Debt" | "Balance" |
| "Failed to" | "Not completed" |

### Conflict-Aware Design
- No aggressive notifications
- No public blame
- Equal visibility for both parents
- Calm, professional tone

### Simplicity
Backend is complex. **Frontend must feel simple.**
- One timeline, scrollable
- Clear status indicators
- One-tap acknowledge/dispute

---

## 10. Competitive Positioning

**Most co-parenting apps:**
- Track expenses
- Allow chat
- Focus on scheduling

**CoParent:**
- Creates legally usable truth
- Built for the worst-case scenario
- Works in peace, proves in conflict

---

## 11. Positioning Statement

> **CoParent** — A secure, court-ready record system for co-parenting.

### Tagline Options
- "Document everything. Clearly."
- "Shared records. Verified."
- "When memory isn't enough."
- "Built for clarity. Ready for court."

---

## 12. Strategic Insight

**You are not building a productivity tool.**

You are building **conflict-resolution infrastructure.**

If done right:
- Indispensable in disputes
- Useful even in peaceful co-parenting
- Becomes the source of truth both parents trust

---

## Next Steps

1. **Market Research** — Validate problem, size the market, identify competitors
2. **Competitor Analysis** — Deep dive on OurFamilyWizard, Cozi, TalkingParents, etc.
3. **ICP Development** — Build 3-4 personas (high-conflict, amicable, lawyer-driven)
4. **PRD** — Full product requirements with phased delivery

---

*This brief is the input for discovery. Run market-researcher → competitor-analyst → icp-builder → prd-writer to generate full discovery docs.*
