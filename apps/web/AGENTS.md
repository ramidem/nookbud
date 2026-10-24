<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project docs

`documentation/` in this folder is the **public** documentation site (`/documentation`). It is written for the people who will use Nookbud. Never put internal material in it: specs, requirements, roadmap, engineering notes, legal notes. Those live in the repo's `docs/` folder.

Before changing something, read the engineering notes in `docs/` (start at `docs/README.md`). When you implement a requirement from `docs/requirements.md`, follow the workflow in the root `CLAUDE.md`.
