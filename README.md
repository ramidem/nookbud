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

- [docs/](docs/README.md): internal docs for the team (spec, requirements, roadmap, engineering notes). Never served.
- [apps/web/documentation](apps/web/documentation/index.md): the public documentation, served at `/documentation` when the web app runs.
- `/design` in the web app: colors, type, spacing and voice.
