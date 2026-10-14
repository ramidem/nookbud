# Coparent

Nx monorepo for a React Native mobile app (iOS, Android, Web).

> **Source of truth** for all React Native mobile app conventions.

@~/.claude/skills/react-native.md
@.claude/docs/components.md
@.claude/docs/styling.md
@.claude/docs/state.md
@.claude/docs/performance.md

## Tech Stack

- **Runtime**: Node v22.22.0 (see `.nvmrc`)
- **Package Manager**: Yarn
- **Build System**: Nx v21
- **Framework**: React Native 0.83 + React 19
- **Language**: TypeScript 5.8 (strict)
- **Styling**: Tailwind CSS via `twrnc`
- **State**: Jotai, Zustand, React Query
- **Navigation**: React Navigation (native-stack, bottom-tabs, material-top-tabs)
- **Storage**: MMKV
- **Forms**: React Hook Form + Zod
- **Deployment**: Fastlane (iOS)

### Dependency Management

`yarn.lock` is the source of truth for dependency versions. Coordinate with the mobile team before making major version upgrades (e.g., react-native, react-navigation major bumps).

---

## Common Commands

```sh
yarn ios                  # Run iOS app
yarn android              # Run Android app
yarn serve:mobile         # Start Metro bundler
yarn lint:mobile          # Lint mobile app
yarn lint:all             # Lint all projects
yarn pod-install          # Install CocoaPods deps
yarn check-env:mobile     # Verify env vars
yarn clean                # Clean generated outputs
```

## Git Workflow (coparent)

> ⚠️ This overrides global CLAUDE.md rules for this repo.

- Push **directly to main** — no branching, no PRs needed
- Pre-push branch gate is disabled (Med's preference, 2026-03-28)
- Pre-commit lint hook still runs — fix lint before committing

---

## Dev Workflow

React Native has two parts that need to run together: the **native app** (on a simulator/device) and **Metro** (the JS bundler/dev server). Metro alone does not launch a simulator.

### Starting the app

| Command             | What it does                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn ios`          | Builds the native iOS app, launches the Simulator, and starts Metro. Interactive — prompts you to pick a scheme and simulator/device.                                  |
| `yarn android`      | Builds the native Android app, launches on an emulator/device, and starts Metro. Interactive — prompts you to pick a build variant and device.                         |
| `yarn serve:mobile` | Starts Metro only. Use this to restart the JS bundler without rebuilding native code (e.g., if you closed the terminal but the simulator still has the app installed). |

### Typical flow

1. Run `**yarn ios`\*\* (or `yarn android`). The interactive picker will ask you to select a scheme/variant and a device.
2. The native app builds, installs on the simulator/device, and launches. Metro starts automatically.
3. Edit your TypeScript/JSX files — **hot reload** updates the app instantly.
4. If Metro crashes or you close its terminal, run `**yarn serve:mobile`\*\* to restart it without a full native rebuild.
5. You only need to re-run `yarn ios`/`yarn android` when you change native code (add a new RN package with native modules, modify `Info.plist`, change `build.gradle`, etc.).

### When to rebuild native

- After `yarn add` of a package with native code (e.g., `react-native-maps`)
- After running `yarn pod-install` (iOS)
- After modifying files in `ios/` or `android/` directories
- After changing environment variables that are baked into the native build

### Common gotchas

- `**nx run mobile` or `nx start mobile**` only starts Metro — no simulator. Use `yarn ios` or `yarn android` instead.
- **iOS Simulator not appearing?** Make sure you have Xcode and simulators installed (`xcode-select --install`, then open Xcode > Settings > Platforms to download simulators).
- **Android emulator not listed?** Create one in Android Studio > Device Manager first, or connect a physical device with USB debugging enabled.
- **Metro port conflict?** Metro runs on port 8081 by default. Kill any existing process on that port: `lsof -ti:8081 | xargs kill -9`.

---

## Project Structure

```
apps/mobile/src/
  app/            # App root, query client
  components/     # Atoms / Molecules / Organisms
  screens/        # Screen components
  routes/         # Navigation (public/private)
  stores/         # Zustand slices, Jotai atoms, MMKV
  hooks/          # Custom hooks
  utils/          # Axios, logging, routing helpers
  icons/          # SVG icons
  assets/         # Fonts (Inter, EB Garamond), images
  tailwind/       # Tailwind config exports
  config/         # App configuration
  types/          # Shared TypeScript types
  dimens/         # Layout dimensions
```

---

## Conventions

- **Path alias**: `@/` maps to `./src`
- **Linting**: ESLint (Airbnb TS base) + Prettier (single quotes, trailing commas, 100 char width)
- **Max constraints**: line length 125 (ESLint), print width 100 (Prettier), nesting depth 3, function params 3
- **Git hooks** (Husky): pre-commit runs `lint:all`, pre-push branch gate **disabled** — push directly to main

### File Naming

- Components: `component-name.component.tsx`
- Hooks: `useHookName.hook.tsx` or `useHookName.hook.ts`
- Utils: `utility-name.util.ts`
- Stores: `store-name.store.ts` or `.slice.ts`
- Screens: `screen-name.screen.tsx`
- Types: `entity.type.ts`
- Services: `service-name.service.ts`
- Tabs/Steps: `kebab-case.tab.tsx`
- Barrel exports: `index.ts`

---

## Build Verification

**Do NOT run `./build.sh` for mobile-only changes** — it runs typecheck, lint, build, and tests across all projects which is slow and unnecessary.

Instead, run only the ESLint check for mobile:

```bash
npx nx run mobile:lint
```

This covers both ESLint rules and Prettier formatting.

**When creating new components or screens**, review the code for hardcoded hex color values (e.g., `#2F2F2F`, `#C8BFB6`) **and Tailwind default palette classes** (e.g., `gray-*`, `blue-*`, `red-*`). Replace them with semantic color tokens from `tailwind.config.js` (e.g., `text-foreground`, `bg-surface`, `bg-neutral-200`). See the styling docs for the full token reference and mapping table. If no token exists, add one to `tailwind.config.js` before using it.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

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
