# State Management & Data

## State Management

- **Zustand** for global client state (persistent via MMKV)
- **Jotai** for derived/computed atoms
- **React Query** (`@tanstack/react-query`) for server state
- Use Zod schemas for API response validation

### Zustand Imperative Access

Use `useStore.getState()` to read or write store values **outside of React's render cycle** — inside callbacks, event handlers, or utility functions where you don't want to trigger a re-render:

```typescript
// Read a value imperatively (no re-render subscription)
const value = useLocalStorageStore.getState().hasRequestedNotificationPermission;

// Call a setter imperatively
const setter = useLocalStorageStore.getState().setHasRequestedNotificationPermission;
setter(true);
```

- Use this pattern inside functions, event handlers, and effects where subscribing to the store is unnecessary
- **Do NOT use `getState()` in render** — use the hook form `useStore((s) => s.field)` when the component needs to re-render on changes
- **Always use selectors with Zustand hooks** — never return the whole store object. Select only the fields you need to avoid unnecessary re-renders:

```typescript
// Correct — component only re-renders when `name` changes
const name = useUserStore((s) => s.name);

// Wrong — component re-renders on ANY store change
const { name } = useUserStore();
```

---

## React Query Hooks Convention

- **Never use `useQuery()` or `useMutation()` directly in components or screens** — always create a dedicated hook
- **Queries** go in `src/hooks/queries/` — one file per query (e.g., `useGetUserProfile.hook.ts`)
- **Mutations** go in `src/hooks/mutations/` — one file per mutation (e.g., `useRequestOtp.hook.ts`)
- **Query keys** must be defined as constants in the hook file — never use inline strings
- **Be intentional with `staleTime` and `gcTime`** — set them per query based on how frequently the data changes, don't rely on global defaults

```typescript
// src/hooks/queries/useGetSomething.hook.ts
import { useQuery } from '@tanstack/react-query';

const QUERY_KEY = ['something'] as const;
const FIVE_MINUTES = 5 * 60 * 1000;

export function useGetSomething() {
  return useQuery({
    gcTime: FIVE_MINUTES,
    queryFn: fetchSomething,
    queryKey: QUERY_KEY,
    staleTime: FIVE_MINUTES,
  });
}
```

```typescript
// src/hooks/mutations/useDoSomething.hook.ts
import { useMutation } from '@tanstack/react-query';

export function useDoSomething() {
  return useMutation({
    mutationFn: doSomething,
  });
}
```

```typescript
// Usage in a screen — import the hook, never useQuery/useMutation directly
import { useGetSomething } from '@/hooks/queries/useGetSomething.hook';
import { useDoSomething } from '@/hooks/mutations/useDoSomething.hook';
```
