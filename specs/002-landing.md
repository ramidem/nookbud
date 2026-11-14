# 002 — Landing

Date: 14 Nov 2026. One slice of the child's-week story. No other slice.

`/temp-landing2` is the landing to keep. It is the Mix layout (`VariationTwo`). Delete the other temp landings. The home page at `/` stays. It is not a temp layout. Rewrite its two-homes lines. Do not delete it.

## Words

- Product sentence: Nookbud keeps one shared place for a child's well-being: the schedule, the tasks, and the money spent on the child. Parents, grandparents, and guardians keep it together. A parent abroad sees the same week. A lawyer can be invited to read it.
- Hero paragraph, for the home page: The week in one place. Where the child needs to be, what an adult still has to do, and what was paid for them. The people you invite see the same week, including a parent who is abroad.
- Home headline stays: "Everything in one place, for them."
- Do not say wishlist or gifts. Do not promise a gift list. There is no wish list in the app yet.
- Do not lead with separation, custody, divorce, handoff, two homes, one childhood, across homes, or both homes.

## Keep `/temp-landing2`

1. Keep `apps/web/src/app/temp-landing2/page.tsx` and `apps/web/src/temp-landing/VariationTwo.tsx`.
2. Replace every two-homes sentence in `VariationTwo.tsx` with the child's week: school, health, and the things the child needs. Where the page shows a sample week or sample events, use a school pickup, a dentist visit, and football boots. No handoff. No split between two homes.
3. The level-1 heading that now says "One record for both homes" becomes "One record for the kids."
4. Remove the layout switcher (`LayoutLinks`, the First / Split / Mix links) from the kept page. Nothing on `/temp-landing2` may link to `/temp-landing` or `/temp-landing1`.
5. The logo on that page points at `/temp-landing2`.
6. Keep the waitlist link (`mailto:hello@nookbud.com`). Keep the sample-quote label that says the quotes are not reviews, if it is still on the page.

## Delete the other temp landings

Delete these, and any component imported only by them:

- `apps/web/src/app/temp-landing/`
- `apps/web/src/app/temp-landing1/`
- `apps/web/src/temp-landing/TempLanding.tsx`
- `apps/web/src/temp-landing/VariationOne.tsx`

Keep `TempFrame.tsx` and `bits.tsx` if `/temp-landing2` still imports them. Delete `LayoutLinks` from `bits.tsx` once nothing calls it. Change the logo's default href from `/temp-landing` to `/temp-landing2`.

Do not delete images in `apps/web/public/temp-landing/`. The kept page still uses them.

## Home page at `/`

Do not delete `apps/web/src/app/page.tsx` or `apps/web/src/landing/`.

1. `apps/web/src/landing/Hero.tsx`: keep the headline. Replace the paragraph that says "across homes" with the hero paragraph above.
2. `apps/web/src/landing/Records.tsx`: "One record for both homes." becomes "One record for the kids." The calendar blurb says school, health, and the things the child needs. It does not say handoffs or both homes.
3. `apps/web/src/landing/WeekCard.tsx`: days are not painted as home A, home B, or a handoff split. The three sample rows are a school pickup, the dentist row, and the football-boots row. No row says "Handoff".
4. Leave `apps/web/src/landing/config.ts` in place. Other files import `WAITLIST_HREF` from it.

## Tests

- `apps/web/specs/temp-landing.spec.tsx` covers only `/temp-landing2` and `VariationTwo`. It still checks the page is public and the waitlist mailto is present. It expects the new heading "One record for the kids." It does not import the deleted components.
- `apps/web/specs/index.spec.tsx` still renders the home page. Update it only if the render breaks.
- Do not delete a test to hide an old phrase. Do not edit `home.spec.tsx`, `sidebar.spec.tsx`, or `accessibility.spec.tsx`. Those use "Handoff" as a record title a person typed.

## Do not

- Do not edit `apps/web/src/app/layout.tsx`, sign-up, welcome, `README.md`, `CLAUDE.md`, or `apps/web/documentation/`.
- Do not change routes, schema, or the signed-in app.
- Do not push, open a pull request, tag, or merge.

## Done when

`/temp-landing` and `/temp-landing1` are gone. `/temp-landing2` and `/` render. A search of `apps/web/src/landing` and `apps/web/src/temp-landing` finds none of: `Two homes`, `One childhood`, `across homes`, `both homes`, `Handoff`, `handoff`.

`pnpm nx test web -- specs/index.spec.tsx specs/temp-landing.spec.tsx` passes.
