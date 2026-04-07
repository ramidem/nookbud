# Nookbud — Core Decision Logic

> **Status:** 📝 TODO — Define before implementation
> **Depends on:** Product requirements, PRD

---

## Overview
Nookbud's core logic governs: record integrity, acknowledgment state machine, role-based permissions, and export generation.

---

## Record Integrity
- All entries are immutable after creation
- Edits create new versions (version-diffed history)
- Files are SHA-256 hashed at upload; hash stored server-side
- Timestamps are server-set, not client-set

## Acknowledgment State Machine
```
Pending → Acknowledged
       → Disputed (requires dispute note)
       → Expired (if no response after X days)
```

## Role-Based Permissions
| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| Create entry | ✅ | ✅ | ❌ |
| Edit entry | ✅ | ✅ | ❌ |
| Acknowledge entry | ✅ | ✅ | ❌ |
| Dispute entry | ✅ | ✅ | ❌ |
| Export report | ✅ | ✅ | ✅ |
| Invite members | ✅ | ❌ | ❌ |
| Delete Space | ✅ | ❌ | ❌ |

---

## TODO
- [ ] Define all entry types and their fields
- [ ] Define acknowledgment expiry rules
- [ ] Define export format (PDF + JSON + attachments + hash manifest)
- [ ] Write test cases for each permission rule
