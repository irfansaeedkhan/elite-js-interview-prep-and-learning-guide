# Project Conventions

Architecture patterns, naming, and code organization for the Elite Interview Prep Platform.

Adapted from `../best-practices-flow/` — adjusted for this single-repo Next.js layout.

---

## Principles

1. **Business logic in services** — never in route handlers or React components
2. **Minimize scope** — smallest correct diff
3. **shadcn/ui only** — no MUI, Chakra, or other component libraries
4. **yarn only** — never npm or pnpm
5. **No UI changes** unless user explicitly requests
6. **Type safety** — strict TypeScript, Zod for env and API input

---

## Folder responsibilities

| Path | Responsibility |
|---|---|
| `content/` | MDX curriculum — no app logic |
| `src/app/` | Routes, layouts, page shells only |
| `src/components/ui/` | shadcn primitives — don't add business logic |
| `src/components/curriculum/` | Topic UI — tabs, accordions, progress ring |
| `src/components/mdx/` | MDX shortcodes — Mermaid, Figure, Callout |
| `src/components/navigation/` | Sidebars, breadcrumbs |
| `src/lib/curriculum/` | Load topics, resolve slugs, build nav tree |
| `src/lib/progress/` | Mastery rules, progress read/write |
| `src/hooks/` | Thin React hooks wrapping lib functions |
| `src/types/` | Shared TypeScript interfaces |

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files (components) | kebab-case | `topic-tabs.tsx` |
| Files (utils/lib) | kebab-case | `resolve-slug.ts` |
| React components | PascalCase export | `TopicTabs` |
| Hooks | `use-` prefix | `use-topic-progress.ts` |
| Types/interfaces | PascalCase | `Topic`, `Track` |
| Slugs | kebab-case | `event-loop`, `what-is-js` |
| API routes | plural nouns | `/api/progress` |

---

## Component rules

- **Server Components by default** — add `'use client'` only when needed (interactivity, hooks, theme)
- **No data fetching in components** — pages call lib/services; client uses TanStack Query
- **Colocate** topic-specific UI in `components/curriculum/`, not in `app/`
- **MDX components** must work in both server and client contexts where possible

---

## Content loading

```typescript
// src/lib/curriculum/get-topic.ts
import { allTopics } from 'contentlayer/generated'; // or Velite equivalent

export function getTopic(track: string, slug: string[]): Topic | null {
  const path = slug.join('/');
  return allTopics.find(t => t.track === track && t.path === path) ?? null;
}
```

Pages are thin:

```typescript
// app/(learn)/[track]/[[...slug]]/page.tsx
export default async function TopicPage({ params }) {
  const topic = getTopic(params.track, params.slug ?? []);
  if (!topic) notFound();
  return <TopicPageShell topic={topic} />;
}
```

---

## Progress service (Phase 1 local, Phase 4 DB)

```typescript
// src/lib/progress/topic-progress.service.ts

export const topicProgressService = {
  getVisited(slug: string): boolean { /* ... */ },
  markVisited(slug: string): void { /* ... */ },
  getQuestionScores(slug: string): Record<string, boolean> { /* ... */ },
  isMastered(topic: Topic, scores: Scores): boolean { /* ... */ },
};
```

Components call hooks; hooks call service:

```typescript
// src/hooks/use-topic-progress.ts
'use client';
export function useTopicProgress(slug: string) {
  // wraps topicProgressService + localStorage or API
}
```

---

## API patterns (Phase 4+)

Follow reference from `../best-practices-flow/`:

```
src/app/api/progress/route.ts     → thin handler
src/lib/progress/progress.service.ts → business logic
src/db/schema/progress.schema.ts  → Drizzle schema
```

- Validate session via Better Auth middleware
- Every query scoped by `userId`
- Typed errors via shared `ApiError` pattern

---

## Environment variables (Phase 4+)

Validated in `src/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
});
```

Never commit secrets. Never read `process.env` directly outside `env.ts`.

---

## Imports

Use path alias `@/` for `src/`:

```typescript
import { TopicTabs } from '@/components/curriculum/topic-tabs';
import { getTopic } from '@/lib/curriculum/get-topic';
import type { Topic } from '@/types/curriculum';
```

---

## Styling

- Tailwind utility classes only — no CSS modules unless necessary
- Use shadcn CSS variables from `globals.css` — don't hardcode colors
- Dark mode via `class` strategy on `<html>` (next-themes)
- Follow DESIGN-ETHICS.md for spacing, radius, calm aesthetic

---

## Git & commits

- Conventional commits when user asks to commit
- Content changes: `content(javascript): add closures topic`
- Features: `feat(curriculum): add mastery progress ring`

---

## Reference codebase

`../best-practices-flow/` — use for:

- `apps/backend/src/lib/auth.ts` — Better Auth config
- `apps/backend/src/middleware/require-auth.ts` — session guard
- `apps/backend/src/lib/api-error.ts` — typed API errors
- `apps/frontend/src/lib/auth-client.ts` — client auth

Do not copy-paste blindly — adapt to Next.js single-repo layout.
