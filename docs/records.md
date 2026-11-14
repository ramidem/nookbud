# Records and the calendar

Records (spec §9–10) and the shared calendar (§12, roadmap B2). A calendar event is one type of record, so it shares the same history.

## What exists

| Path | What it does |
| --- | --- |
| `/home` | Glance for one space: whose day it is (via `whoseDay()`), events from today through the next 7 days (five at most), pending change requests, and the five newest records |
| `/spaces/[id]/calendar` | Month view: whose day each day is, events, add an event, change requests, and the parenting schedule (owners) |
| `/spaces/[id]/records` | The timeline, newest first, filtered by type or `?type=removed`, and "Add a record" |
| `/spaces/[id]/records/[entry]` | One record: its facts, the outcome (events), correcting and removing (author only), and its full history with what changed |

- Server actions: `src/auth-actions/records.ts` and `schedule.ts`. Data: `getRecords()` and `getSchedules()` from `@/data`.
- Shared screen pieces are in `src/records/`: the form for every type (`EntryForm.tsx`), labels, the per-field diff (`diff.ts`) and `spaceContext()`.
- Times: `src/profile/time.ts` converts between UTC and the viewer's zone (their profile's, or UTC with a note asking them to set one). `whoseDay()` in `src/profile/schedule.ts` works out the schedule.

## Records (R54, R55)

- **Types:** `note`, `agreement` (`agreed_on`), `expense` (`amount`, `currency`, `spent_on`, `paid_by`) and `event` (`starts_at`, `ends_at`, `all_day`, `location`, `assigned_to`, `outcome`, `outcome_note`). All have `title`, optional `body` and optional `child_id`. `private.clean_content()` keeps only these fields and checks them; anything else is dropped.
- **Server time and author (REC-4):** `entries.created_at` and `created_by` are set by `add_entry()`. Nothing the browser sends can change them.
- **Append-only history (AUD-1):** `entries` keeps who and when plus a copy of the latest title and times for sorting; `entry_versions` keeps every version (`created`, `edited`, `outcome`, `removed`) with who, when and an optional reason. A trigger refuses any update or delete of a version, for every role including the database owner. The one allowed change is the account-deletion cascade clearing `changed_by` (D7).
- **Only the author corrects or removes** (`edit_entry`, `remove_entry`). Owners cannot rewrite other people's records.
- **Soft delete (AUD-2):** `remove_entry()` sets `removed_at` and adds a `removed` version. The record leaves the timeline and shows under "Removed".
- **Names:** `space_names()` gives the names of the people in the space; anyone else shows as "Former member".

## The calendar (R56–R58)

- **Events** are records of type `event`. The calendar reads them with `RecordStore.events()` for the month's range, and shows each on every day it covers, in the viewer's zone.
- **Outcome (CAL-1):** `set_event_outcome()` is allowed for the author and the person responsible. It adds an `outcome` version.
- **Parenting schedule (R57):** `schedules` holds one pattern per space (1–28 user ids or nulls) and a start date; `schedule_versions` keeps every version. Only owners call `set_schedule()`, and every day must belong to someone in the space. Presets: a week each, every other day, 2-2-3 (`presetPattern()`).
- **Change requests (R58):** `request_change()` (any member, up to 90 days, 10 waiting per person), `respond_to_change()` (anyone in the space except the person who asked, once), `withdraw_change()` (the person who asked, while waiting). The latest approved request covering a day decides it, before the pattern.
- **Audit:** `schedule_changed`, `change_requested`, `change_approved`, `change_declined`, `change_withdrawn` go to `audit_logs`.

## Tests

- `supabase/tests/database/009_records_and_schedule.sql`: author and time from the server, unknown fields dropped, outsiders refused, edits as versions, nobody else editing, history that cannot be rewritten, soft delete, events and outcomes, owner-only schedule, and the request rules.
- `apps/web/specs/time.spec.ts`: time zones, daylight saving and `whoseDay()`.

## Not done yet

- Acknowledgments and disputes (§11, P2), files (§13) and export (§14).
- On a phone the month grid scrolls sideways; an agenda list for small screens would read better (R59).
- Notifications for requests and upcoming events (roadmap B2).
