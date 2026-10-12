# Spec 0001: Codebase hardening

**Feature:** Codebase hardening (scope #9)
**Status:** approved
**Owner:** develop

## Problem

The app shipped Phases 0 through 6 without automated tests. `AGENTS.md` still described Phase 0. `src/lib/env.ts` parses and throws at import time, which can break tooling that loads modules without full env. Core mastery and progress rules have no regression safety net.

## Goals

1. Add Vitest with minimal config aligned to Next.js + TypeScript path aliases.
2. Unit test pure functions in `src/lib/progress/mastery.ts` (prerequisite resolution, mastery percent, access gates).
3. Make env validation lazy so only runtime API/auth paths require full env.
4. Sync `AGENTS.md` with CONTEXT.md phase status and document workflow skills.

## Non goals

- E2E browser tests (defer to a later slice).
- Refactoring learn layout SSR (separate SEO spec).
- New UI.

## Acceptance criteria

- **AC-1:** `yarn test` runs Vitest and exits 0.
- **AC-2:** At least 8 tests cover `isTopicMastered`, `canAccessTopic`, `getTrackMasteryPercent`, `resolvePrerequisiteTopic` behavior.
- **AC-3:** Importing `@/lib/env` in a test file without `DATABASE_URL` does not throw until `getEnv()` is called.
- **AC-4:** `yarn tsc --noEmit` passes.
- **AC-5:** AGENTS.md lists Phase 6 complete, workflow artifact paths, and JS Mastery skills.

## Build plan

1. Add `vitest` dev dependency and `test` script.
2. Add `vitest.config.ts` with `@/` alias.
3. Create `src/lib/progress/mastery.test.ts` with focused unit cases on progress maps.
4. Refactor `env.ts` to export `getEnv()` with lazy parse; keep `env` proxy for existing imports.
5. Update AGENTS.md (gap fill sections only).
6. Add `test-preferences.json` for `/test` skill.

## Risks

- Velite `#site/content` import in mastery tests may need mocking. Prefer testing pure helpers with injected maps over full Velite coupling.
