# Nookbud

Shared care records for families raising a child across homes. Nx monorepo — web (Next.js) and API (NestJS) are scaffolded; mobile (Expo) comes next.

- **Roadmap & backlog:** [ROADMAP-2026.md](ROADMAP-2026.md) — single source of truth for priorities
- **Restart steps:** [TODO.md](TODO.md) — immediate next steps, including what to restore from `../nookbud_copy` (the old codebase)
- **Brand:** [BRAND.md](BRAND.md) · **Product concept:** [CO-PARENT.md](CO-PARENT.md) · **Research:** `docs/`

## Tech Stack

- **Runtime:** Node 24 LTS (see `.nvmrc`)
- **Package manager:** pnpm (version pinned in `package.json` → `packageManager`; use `corepack pnpm` if pnpm isn't installed)
- **Build system:** Nx 24 with TypeScript project references and pnpm workspaces
- **Web:** Next.js 16 (App Router) + React 19 in `apps/web`, hosted on Vercel; plain `next.config.js` (no `withNx`)
- **API:** NestJS 11 in `apps/api` (webpack build)
- **Tooling:** TypeScript 6, ESLint 9 (flat config), Vitest 5 (web), Jest 30 (api), Prettier
- **Planned:** Expo (mobile), Supabase (Postgres + Auth + RLS)
- **Version holds:** NestJS 12, TypeScript 7, ESLint 10 and webpack-dev-server 6 wait on Nx / typescript-eslint / eslint-plugin-react support

## Layout

```
apps/       # deployable apps: web (Next.js), api (NestJS); mobile (Expo) planned
packages/   # shared libraries (types, validation, design tokens, api client)
docs/       # discovery and research (reference only)
assets/     # brand logos, icons and illustrations
```

## Common Commands

```sh
pnpm install                     # install dependencies
pnpm nx show projects            # list projects
pnpm nx run-many -t lint test build typecheck
pnpm nx serve web                # Next.js dev server (http://localhost:3000)
pnpm nx serve api                # NestJS dev server (http://localhost:3001)
pnpm nx format:check             # prettier check (CI runs this)
pnpm nx add @nx/next             # add a framework plugin before generating an app
```

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
