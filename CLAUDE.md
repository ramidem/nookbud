# Nookbud

Shared care records for families raising a child across homes. Nx monorepo — web (Next.js) and API (NestJS) are scaffolded; mobile (Expo) comes next.

- **Internal docs:** [docs/](docs/README.md), never served. The [spec](docs/spec.md) (what the product must do), the [requirements](docs/requirements.md) (the build queue, in order), the [roadmap](docs/roadmap-2026.md) and engineering notes such as [the database](docs/database.md). Say **space**, never workspace
- **Public documentation:** `apps/web/documentation`, served at `/documentation`. Written for the people who will use Nookbud. Nothing internal goes in it
- **Brand and design system:** the `/design` page in `apps/web`
- **Stale reference:** `docs/discovery`, `docs/research`, `docs/strategy` and [docs/old-codebase.md](docs/old-codebase.md). Mine it, do not maintain it. See Reference docs below

## Tech Stack

- **Runtime:** Node 24 LTS (see `.nvmrc`)
- **Package manager:** pnpm (version pinned in `package.json` → `packageManager`; use `corepack pnpm` if pnpm isn't installed)
- **Build system:** Nx 24 with TypeScript project references and pnpm workspaces
- **Web:** Next.js 16 (App Router) + React 19 in `apps/web`, hosted on Vercel; plain `next.config.js` (no `withNx`). `/` is the landing page (`src/landing/`), `/design` the design-system page, `/documentation` the public documentation site (`src/app/documentation/`). Styling: Tailwind 4 (utilities only, no global reset) mapped to the tokens in `src/app/design/_data/tokens.json`
- **API:** NestJS 11 in `apps/api` (webpack build)
- **Tooling:** TypeScript 6, ESLint 9 (flat config), Vitest 5 (web), Jest 30 (api), Prettier
- **Planned:** Expo (mobile), Supabase (Postgres + Auth + RLS)
- **Version holds:** NestJS 12, TypeScript 7, ESLint 10 and webpack-dev-server 6 wait on Nx / typescript-eslint / eslint-plugin-react support

## Layout

```
apps/       # deployable apps: web (Next.js), api (NestJS); mobile (Expo) planned
apps/web/documentation/  # public documentation for users, served at /documentation
packages/   # shared libraries (types, validation, design tokens, api client)
supabase/   # Supabase project: migrations, seed, functions, database tests
docs/       # internal docs (spec, requirements, roadmap, engineering notes), never served; plus stale discovery, research and strategy reference
assets/     # brand logos, icons and illustrations
```

## Common Commands

```sh
pnpm install                     # install dependencies
pnpm nx show projects            # list projects
pnpm nx run-many -t lint test build typecheck
pnpm nx serve web                # Next.js dev server (http://localhost:3000)
pnpm nx serve api                # NestJS dev server (http://localhost:3001)
pnpm nx run supabase:db-reset    # rebuild the local database from migrations (needs Docker)
pnpm nx format:check             # prettier check (CI runs this)
pnpm nx add @nx/next             # add a framework plugin before generating an app
```

## Working through requirements

[docs/requirements.md](docs/requirements.md) is the build queue, in order. For each item:

1. Take the first unchecked item whose blockers are clear. Read the spec IDs on its `Spec:` line in [docs/spec.md](docs/spec.md).
2. Implement it to its acceptance criteria, with tests.
3. **Delete the item's lines from `docs/requirements.md`.** Do not renumber the others.
4. **Write it up for engineers in `docs/`**: add or update a page (for example `docs/database.md`) and list it in `docs/README.md`. Say what exists, how to use it, the rules that must hold, and what is not done yet.
5. If it changes what a user can do, or what we promise them, **update the public documentation** in `apps/web/documentation/`.
6. If part of it could not be finished, add that part to `docs/requirements.md` as a new item (the next free `R` number, placed where it belongs in the order). Do not leave it in the docs as if it works.

Read `docs/` before changing anything it covers.

## Public documentation

`apps/web/documentation/` is a real documentation site for the people who will use Nookbud. It is public. Write for a parent, a grandparent or a guardian: plain words, what Nookbud does and how to use it. Say plainly what is not available yet, and never describe a feature as live that is not.

**Never put internal material there**: the spec, requirements, roadmap, engineering notes, legal notes, pricing research or anything about how it is built. Those belong in `docs/`. A test fails if an internal page is added or linked from the public pages.

Pages are Markdown with frontmatter (`title`, `section`, `order`, `description`) and appear on their own. [docs/documentation-site.md](docs/documentation-site.md) explains how the site works.

## Secrets

Secrets stay on the server and out of git. Public values are `NEXT_PUBLIC_*`; everything else is a secret. Read secrets only through `getServerEnv()` in `apps/web/src/env/server.ts` (it is `server-only`), never `process.env` directly, and never give a secret a `NEXT_PUBLIC_` name. Never put a value in a committed file: `.env*` is ignored except `.env.example`. `apps/api` reads no secrets yet; if it needs one, give it its own validated env module. [docs/secrets.md](docs/secrets.md) has the full rules and how to add one. CI fails on a leak.

## Reference docs

`docs/discovery`, `docs/research` and `docs/strategy` are the old discovery, research and strategy material. They are stale and being retired, one area at a time. When you write or extend a spec area, pull what you need out of them into `docs/spec.md`, delete the lines you moved, and delete a file once nothing useful is left. Do not copy whole documents.

## Git Workflow

- Push **directly to main** — no branching, no PRs needed
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:` …), one concern per commit
- Run format check, lint, typecheck and tests before committing

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
