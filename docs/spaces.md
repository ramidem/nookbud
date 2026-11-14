# Spaces

A space is the private place a family keeps its records in. This page covers spaces, their members, children and invitations (spec §5–7). The database side is in [database.md](database.md#spaces-members-children-and-invitations).

## What exists

| Path | What it does |
| --- | --- |
| `/home` | The glance for one space: whose day it is, the next few events, requests that need you, requests you are waiting on, and the latest records. Invitations waiting for your email, with Join. With no spaces, one sentence and a link to `/spaces` |
| `/spaces` | Your spaces, invitations waiting for your email, and "Create a space" |
| `/spaces/[id]` | Children, people, inviting, the owner's space settings, and leaving |
| `/invite/[token]` | The invitation link: sign in or create an account, then join |

- Server actions: `src/auth-actions/spaces.ts`. Data: `getSpaces()` from `@/data` (`src/data/providers/spaces.ts`).
- The nav's **Spaces** link opens `/spaces` (SPC-2): every space you belong to is listed there. A space card opens `/spaces/[id]` (people and children), not the calendar.
- **Home** is one space at a time. One space: no switcher. More than one: a switcher of space names; choosing one remembers it in the `nookbud-home-space` cookie. First visit with several spaces and no cookie: the space with a pending change request this person must answer, else the space with the soonest event, else the first space in the list. A pending request or an invitation in a space that is not on screen still shows, as the space name and a count that switches to that space.

## Rules

- **Roles** are `owner` and `member` (OQ2 as recommended). Owners rename, delete, add and change children, invite, remove, and change other people's roles. Members read. A space can have several owners and always has at least one: the last owner cannot leave (OQ4, SPC-6). Nobody changes their own role.
- **Every write is a database function** that checks the role itself (AZ-5): `create_space`, `rename_space`, `delete_space`, `add_child`, `update_child`, `remove_child`, `create_invitation`, `revoke_invitation`, `accept_invitation`, `accept_my_invitation`, `remove_member`, `set_member_role`, `leave_space`. The tables have no insert, update or delete grants. Hiding a button is never the check.
- **Reads go through RLS:** `private.is_member()` and `private.is_owner()` (security definer, so policies do not recurse). A deleted space is invisible to everyone.
- **Children** hold a name or nickname and an optional birth date, nothing more (PRIV-2). Every member reads them; owners write. This is a starting policy: OQ5 (child access) is open, and the policies can be tightened without a schema change.
- **People** (`space_people()`) shows each member's display name and role, and nothing else from their profile.
- **Invitations** (INV-1..8) are bound to a lowercase email, carry a role, expire after 7 days and work once. The link holds a 64-hex token; only its SHA-256 hash is stored, and nobody can read the hashes. Only the verified account with the invited email can accept. A new invitation to the same email withdraws the open one. An owner can send 20 a day per space (INV-6). Someone who signs up after being invited finds it on `/home` and `/spaces` through `my_invitations()`.
- **Deleting a space** is soft (SPC-5): `deleted_at` is set, every member loses access at once and open invitations are withdrawn. The rows stay until the retention rules (OQ6) say otherwise.
- **Leaving or being removed** ends access at once (AZ-4). What the person added stays (D7).
- **Audit:** every function writes an `audit_logs` entry with the space id: `space_created`, `space_renamed`, `space_deleted`, `invitation_sent`, `invitation_revoked`, `invitation_accepted`, `member_removed`, `member_left`, `role_changed`, `child_added`, `child_changed`, `child_removed`.
- A person can be in up to 20 spaces.

## Tests

`supabase/tests/database/008_spaces.sql` covers isolation between spaces, every role check, and the invitation rules (wrong email, reuse, expiry). `006` checks visitors against every table and function, including these. `apps/web/specs/home.spec.tsx` covers the glance, the switcher, and `/spaces`.

## Not done yet

- Invitations are links to copy and send. Emailing them waits on a sending address (R6, R51).
- Mobile and deep links into an invitation (INV-7, R33).
