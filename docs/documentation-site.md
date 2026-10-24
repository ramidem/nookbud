# The documentation site

`/documentation` is the public documentation for people who will use Nookbud. Its pages are Markdown files in `apps/web/documentation`, and the web app turns them into the site.

## Public means public

Everything in `apps/web/documentation` is served to anyone and can be found by search engines. So it is written for a parent, a grandparent or a guardian, not for the team:

- Plain words. Say what Nookbud does and how to use it.
- Say plainly what is not available yet. Never describe a feature as live if it is not.
- No internal material: the spec, requirements, roadmap, engineering notes, legal notes, pricing research or anything about how Nookbud is built.

Internal docs live in `docs/`, which is never served. Two tests enforce the line: one fails if a spec, requirements, roadmap, database or to-do page appears in the public folder, and public pages may only link to other public pages or to the site itself.

## Add a page

Create a `.md` file in `apps/web/documentation` (subfolders work). Start it with frontmatter:

```yaml
---
title: Spaces and members
section: Concepts
order: 10
description: "One sentence about what the page answers."
---
```

| Field | What it does |
| --- | --- |
| `title` | The name in the sidebar, the browser tab and the previous and next links |
| `section` | The sidebar group. Leave it out for a top-level page |
| `order` | Position in the sidebar, lowest first. A section sits where its lowest page sits |
| `description` | The page summary used in the page metadata. Required by the tests |

The page appears on its own. Its address is the file path in lowercase without `.md`: `getting-started.md` is `/documentation/getting-started`, and `index.md` is the home page.

## Links

Link between pages with relative `.md` links, for example `[spaces](concepts/spaces-and-members.md#invitations)`. Link to the rest of the site with a path such as `/`. The site turns both into addresses.

## What the site gives you

- A sidebar built from the frontmatter, and an "On this page" list built from the `##` and `###` headings.
- Previous and next links, in sidebar order.
- Heading anchors you can copy: hover a heading and click the `#`.
- GitHub-style tables and task lists, and highlighted code blocks.
- Light and dark mode, following the system, with the same tokens as the rest of the app.

## Rules

- **The tests check every link.** `specs/documentation.spec.ts` fails if a page has no title or description, if two pages share an address, or if a link or `#anchor` points at something that does not exist. It runs the same link check on the internal docs in this folder.
- Every page is generated at build time, so the site needs no server.
- Keep one `#` heading per page, the same as the title.
- The pages and the code are `apps/web/documentation` and `apps/web/src/documentation`, with the routes in `apps/web/src/app/documentation`.

## Not done yet

- There is no search.
- The pages describe how Nookbud is designed to work. Update them as each feature goes live, and remove the "not open yet" notes at launch.
