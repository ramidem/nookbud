# 001 — Chrome copy

Date: 14 Nov 2026. One slice of the child's-week story. No other slice.

The site still says "Two homes. One childhood." This slice changes only the browser title and the two account screens. The landing pages and the docs are other slices. Do not edit them.

## Words

Use these. Do not invent a second tagline.

- Browser title: `Nookbud — For the kids.`
- Description, including Open Graph and Twitter: Nookbud keeps one shared place for a child's well-being: the schedule, the tasks, and the money spent on the child. Parents, grandparents, and guardians keep it together. A parent abroad sees the same week. A lawyer can be invited to read it.
- Sign-up line: `For the kids. Start with your email.`
- Welcome heading: `For the kids.`

Do not say wishlist, gifts, two homes, one childhood, across homes, or both homes. Do not lead with separation, custody, divorce, or handoff.

## Requirements

1. `apps/web/src/app/layout.tsx`: the title and the description use the words above. Open Graph and Twitter use the same title and description.
2. `apps/web/src/app/(account)/sign-up/page.tsx`: the line under the heading is the sign-up line.
3. `apps/web/src/app/(app)/welcome/page.tsx`: the heading is "For the kids." The six optional answers stay (partner, ex-partner, grandparent, guardian, another family member, sole caregiver), and both questions can still be skipped. Do not add or remove an answer.
4. If a test asserts the old title or the old sign-up or welcome line, update the assertion. Do not delete a test to hide the old line.

## Do not

- Do not edit `apps/web/src/landing/`, `apps/web/src/temp-landing/`, `apps/web/src/app/page.tsx`, `apps/web/src/app/temp-landing/`, `apps/web/src/app/temp-landing1/`, `apps/web/src/app/temp-landing2/`, `README.md`, `CLAUDE.md`, or `apps/web/documentation/`.
- Do not change `shares_with` or any migration.
- Do not push, open a pull request, tag, or merge.

## Done when

Those three files show the new words, the welcome answers are unchanged, and `pnpm nx test web -- specs/profile.spec.ts` passes. A search of the three files finds none of: `Two homes`, `One childhood`, `across homes`, `both homes`.
