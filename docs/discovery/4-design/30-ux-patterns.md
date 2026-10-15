# Nookbud — UX Patterns

> **Date:** 2026-04-07
> **Status:** ✅ Documented (Phases 1–3 implemented; Phase 3.5+ pending)

---

## Core UX Principles

### 1. Care-first, not conflict-first
Every screen should feel like: "Here's today. Here's what's next." Not: "Build your legal case."
The app is warm and organized. Legal readiness is a byproduct of good record-keeping, never the pitch.

### 2. Clarity over completeness
Show what matters now. Every screen answers: *what do I need to know right now?*
Progressive disclosure for complexity (version history, export options, member management).

### 3. Child is always the center
Design decisions orient around the child — their schedule, their records, their world.
Members (parents, guardians) are the operating context; the child is the subject.

### 4. Trust through transparency
Timestamps, version indicators, acknowledgment state — always visible when relevant.
Users should feel: "this record is real, unalterable, and mine."

### 5. Inclusive, non-judgmental tone
No assumptions about why the family is split. No "Parent A / Parent B." No divorce-coded language.
Onboarding asks "Who shares responsibility for a child with you?" — not "Who is your co-parent?"

---

## Navigation Model

### Main Tabs (Phase 1–3)
```
[Timeline] [Children] [Spaces] [Export] [Settings]
```
- **Timeline** — Main feed of care entries; active Space context shown at top
- **Children** — All children across all user's Spaces
- **Spaces** — Space list, switcher, Space detail, member management
- **Export** — Generate verified care report (PDF or Evidence Bundle)
- **Settings** — Account, notifications, data, privacy

### Space Switcher
- Accessible from top of Timeline screen
- Shows all Spaces user belongs to with emoji + name + role badge
- "All Spaces" toggle at top of Timeline for merged view
- Active Space is persisted between sessions

---

## Screen Inventory

### P0 — Core Loop

| Screen | Purpose | Notes |
|--------|---------|-------|
| Timeline | Main feed of care entries for active Space | Space switcher at top; All Spaces toggle |
| Entry Detail | View a single entry with version history + ack status | |
| Add Entry | Log expense, event, agreement, communication, milestone | Type selector → type-specific form |
| Acknowledge | Respond to a pending acknowledgment request | Acknowledge / Dispute (with note) |
| Export | Select Space, date range, format → generate report | PDF or Evidence Bundle |
| Space List | All Spaces the user belongs to | Role badge per Space |
| Space Detail | Members, children, entry count, management actions | Owner gets management controls |

### P1 — Account + Membership

| Screen | Purpose |
|--------|---------|
| Onboarding | Create first Space + first child; inclusive framing |
| Invite | Generate invite code or shareable link; select role |
| Accept Invite | Enter code → join Space with assigned role |
| Member Management | View/change roles, remove members (owner only) |
| Settings | Account, notifications, currency, data export, privacy |
| Sign In / Sign Up | Firebase Auth (email + Google sign-in) |

### P2 — Phase 3.5+

| Screen | Purpose | Phase |
|--------|---------|-------|
| Tasks | Task list per Space; assign to members | 3.5 |
| Resources | Reference documents per Space (custody orders, medical, etc.) | 4 |

---

## Key Interaction Patterns

### Entry Creation Flow
```
Add Entry → Select Type → Fill Form → (Optional: select child, set requires_ack) → Save
```
- Type defaults to last used type
- Child selection shown if Space has multiple children
- `requires_ack` toggle is opt-in; default off

### Acknowledgment Flow
```
Notification / timeline indicator → "1 pending" → Ack screen → [Acknowledge] or [Dispute (+ note)]
```
- Dispute requires a note — cannot be empty
- After action: entry shows "Acknowledged by [name] on [date]" or "Disputed"

### Space Switching
```
Timeline top bar → Space name (tappable) → Space picker sheet → Select Space
```
- Instant switch; timeline re-renders for new Space
- "All Spaces" at top of picker shows merged timeline

### Export Flow
```
Export tab → Select Space (or All) → Date range picker → Format (PDF / Bundle) → Generate → Share sheet
```
- Estimated file size shown before generation
- Generated files cached for 24h to avoid regeneration

---

## Empty States

| Screen | Empty State Message |
|--------|-------------------|
| Timeline (no entries) | "Nothing logged yet. Add your first care record." + Add button |
| Timeline (no Space) | "Create a Space to start logging care records." + Create button |
| Children (none) | "Add a child to your Space to start tracking records for them." |
| Spaces (none) | Shown only if user deleted all Spaces — prompt to create one |
| Export (no entries in range) | "No entries found for this date range." |

---

## Tone & Copy Guidelines

- **Avoid:** "co-parent," "divorce," "custody dispute," "the other parent"
- **Use:** "your Space," "care records," "members," "[name]'s role"
- **Date format:** "April 7, 2026 at 2:14 PM" — no ambiguous short formats (3/4/26)
- **Confirmation dialogs:** Always explain consequence ("This entry will be marked disputed and [name] will be notified.")
- **Success toasts:** Warm, brief — "Entry saved." not "Entry successfully created and recorded."

---

**Sources:** BRAND.md, prd.md (Phases 1–3, onboarding spec S3-07), BRIEF.md
