# Nookbud — Domain Logic

> **Status:** 📝 TODO — Document domain-specific rules
> **Depends on:** PRD (prd.md)

---

## Domain Concepts

### Space
A care circle — one child arrangement with defined members and roles. A user can belong to multiple Spaces.

### Entry Types
- **Expense** — Financial transaction in a care arrangement
- **Event** — Scheduled or completed care event (pickup, medical visit, school activity)
- **Agreement** — Documented verbal or written agreement between members
- **Communication** — Logged communication between members
- **Milestone** — Child milestone (first word, birthday, academic achievement)

### Acknowledgment
A formal response to an entry: Acknowledged, Disputed, or Pending. Required on entries marked for acknowledgment. Builds the audit trail.

### Verified Care Report
Export bundle: PDF summary + JSON data + file attachments + SHA-256 hash manifest.

---

## Business Rules

- Entries are immutable — edits create new versions
- Only owners can delete a Space (soft delete)
- Invited members join with pre-assigned role; role can be changed by owner
- Invite codes are single-use, expire after 7 days
- File hashes are computed server-side on upload
- Export includes full version history of all entries in scope

---

## TODO
- [ ] Document all entry type fields
- [ ] Define version diff format
- [ ] Specify export format (PDF structure, JSON schema, manifest format)
- [ ] Document invite code generation rules
