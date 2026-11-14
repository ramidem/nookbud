# Plan: home is a glance, spaces move to /spaces

Date: 14 Nov 2026. No app code in this change. The signed-in home was read from `apps/web/src/app/(app)/home/page.tsx`. The live page at `https://m1mbpro.tail512c80.ts.net:3443/home` returns 307 to `/sign-in`, so this pass did not see a real family's data.

## What is wrong now

`/home` is a directory of spaces. Each card shows the name and Owner or Member, and opens that space's calendar. Under the list is "Create a space". Invitations, when there are any, sit above the list.

That is the wrong first screen. A coparent opening the app needs to know the day, not pick a folder.

The side rail makes it worse. "This week" is three hardcoded rows: Mon Handoff, Wed School, Fri Appointment (`Sidebar.tsx`). They are not events.

There is no `/spaces` index. `/spaces/[id]` already exists (children, people, settings). The nav has Home and Settings only. `SPACES` in `routes.ts` is `/spaces` and is unused as a page.

## What a glance is for

Ten seconds, one space. The question is "what do I need to do, and what changed?" The month grid, the full timeline, and the space admin stay where they are.

Only data the app already stores. No balances, no "unsettled", no messages, no files. Expenses are records with an amount, a currency, a date and who paid. Change requests are pending, approved, declined or withdrawn, with a date range and a person.

In order:

1. **Whose day it is.** Today, the person's name, and the next day the pattern (or an approved request) gives the day to someone else. If there is no schedule, one line: "No schedule yet", and owners get a link to the calendar. This is the product. The calendar already computes it with `whoseDay()`.
2. **What is coming up.** Events from today through the next 7 days, five at most. Title, time (or all day), child if one is set, who it is assigned to, and done or missed if an outcome is set. Each row opens the record. Empty: "Nothing scheduled."
3. **What needs you.** Pending change requests you did not ask for, with the dates, who asked, and the reason, plus Answer on the calendar. Invitations waiting for your email, with Join. If both are empty, hide the block.
4. **What you are waiting on.** Your own pending change requests: dates, who the day would go to. Link to the calendar. Hide the block when there are none.
5. **What was just written.** The five newest records that are not removed: type (note, agreement, expense, event), title, who, when. An expense also shows the amount and who paid. Each row opens the record. This is the shared log, not a feed of everything.

Invitations stay actionable on home because an invite you have not answered is about you, not about a space you already have. The same invitations also show on `/spaces`, which is where joining a space belongs.

## More than one space

Home is one space at a time.

- One space: no switcher. Home is that space.
- More than one: a switcher with the space name. Opening a space remembers it (a cookie is enough). Next visit opens that space.
- First visit with several spaces and no cookie: open the space that has a pending request you must answer. If none, the space with the soonest event. If none, the first space in the list.
- A pending request or an invitation in a space you are not looking at still shows, as one line: the space name and a count, linking the switcher to that space. A waiting item must not hide behind the switcher.

## `/spaces`

Move today's home onto `/spaces`:

- The space cards. A card opens `/spaces/[id]`, the people and children page, not the calendar. The calendar and the records stay linked from that page, as they are now.
- Role under the name (Owner or Member).
- Create a space, including the empty state ("Create a space" when you have none).
- Invitations for you, with Join.

`/home` with no spaces is one sentence and a link to `/spaces`. It does not host the form.

## Nav

- Home → `/home`
- Spaces → `/spaces`
- Settings stays
- Remove the hardcoded "This week" block. Home replaces it. A fake week next to a real one is a lie.

## Docs to fix in the same build

`docs/spaces.md` says `/home` is the space list and that the nav's Spaces link is the switcher. After this, `/spaces` is the list and `/home` is the glance. `docs/auth.md` still describes `/home` as only the signed-in home.

## Not in this plan

Messaging, file uploads, a money balance, notifications, and "new since you last looked". The app does not store those. Acknowledgments and disputes are still unbuilt (`docs/records.md`).

## Done when

- `/spaces` shows the spaces, the create form, and invitations. `/home` does not.
- `/home` shows whose day, the next few events, requests that need you, requests you are waiting on, and the latest records, for one space.
- A second space's pending request is still visible.
- The side rail no longer lists Handoff, School, and Appointment.
- Signed out, `/home` still sends you to sign-in.
