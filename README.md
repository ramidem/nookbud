# Nookbud

Shared care records for families raising a child across homes.

## Stack

Nx and pnpm monorepo. Next.js web, NestJS API, Supabase (Postgres). Expo mobile is planned.

## Run

Needs Node 24 (`.nvmrc`) and pnpm.

```sh
pnpm install
pnpm nx serve web   # http://localhost:3000
pnpm nx serve api   # http://localhost:3001
```

Before committing: `pnpm nx format:check` and `pnpm nx run-many -t lint test build typecheck`.

## Docs

- [specs/spec.md](specs/spec.md): requirements
- [specs/requirements.md](specs/requirements.md): what to build, in order
- [ROADMAP-2026.md](ROADMAP-2026.md): backlog and launch gates
- [TODO.md](TODO.md): next steps
- [BRAND.md](BRAND.md): brand
