# 003 — Docs copy

Date: 14 Nov 2026. One slice of the child's-week story. No other slice.

The repo still introduces Nookbud as care across two homes. This slice changes the sentences a person or a teammate reads. It does not change the app screens. Those are other slices.

## Words

Product sentence:

Nookbud keeps one shared place for a child's well-being: the schedule, the tasks, and the money spent on the child. Parents, grandparents, and guardians keep it together. A parent abroad sees the same week. A lawyer can be invited to read it.

Do not say wishlist or gifts. Do not promise a gift list. Do not lead with separation, custody, divorce, handoff, two homes, one childhood, across homes, or both homes.

## Requirements

1. `README.md` and `CLAUDE.md`: replace the first-line product sentence with the product sentence above. Leave the stack, the run steps, and the rest of each file.
2. `apps/web/documentation/index.md` opens with the product sentence.
3. `apps/web/documentation/concepts/calendar.md`: tell people to add school, health, and other events. Do not use "handoff" as the example.
4. `apps/web/documentation/concepts/records.md`: the event example is a school day or an appointment, not a handoff.
5. `apps/web/documentation/legal/terms.md`: change only the sentence that says "raising a child across homes". Replacement: "Nookbud is a shared record for adults looking after a child. It keeps the schedule, the tasks, and the money spent on the child in a space that only the people you invite can see." Do not edit the rest of the terms.
6. If `apps/web/specs/documentation.spec.ts` or `apps/web/specs/legal.spec.ts` asserts an old sentence, update the assertion. Do not delete a test to hide it.
7. Do not rewrite `docs/discovery/` or `docs/research/`. They are old reference.

## Do not

- Do not edit `apps/web/src/`, except a documentation or legal spec if requirement 6 applies.
- Do not change schema, routes, or the landing pages.
- Do not push, open a pull request, tag, or merge.

## Done when

A search of `README.md`, `CLAUDE.md`, and `apps/web/documentation` finds none of: `Two homes`, `One childhood`, `across homes`, `both homes`.

`pnpm nx test web -- specs/documentation.spec.ts specs/legal.spec.ts` passes.
