# Scope: Elite Interview Prep Platform

Structured interview mastery platform. Learners master one topic at a time with MDX curriculum, playgrounds, Q&A, and optional account sync.

**Build approach:** Tracer Bullet (ship thin vertical slices per ROADMAP phase, then deepen).
**Weight profile:** Content tracks are medium; auth and progress are full.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Foundation (Next.js, Velite, learn shell) | Phase 0 | existing |
| 2 | JavaScript MVP (10 topics) | Phase 1 | existing |
| 3 | Interactive playground (Sandpack, challenges) | Phase 2 | existing |
| 4 | Full JavaScript track (40 topics, mastery) | Phase 3 | existing |
| 5 | Auth + Postgres progress sync | Phase 4 | existing |
| 6 | React track (17 topics, JSX playground) | Phase 5 | existing |
| 7 | Landing page + SEO | Phase 6 | existing |
| 8 | Workflow skills + agent context | Phase 7 | done |
| 9 | Codebase hardening (tests, env, docs sync) | Phase 7 | in-progress |
| 10 | Next.js curriculum track | Phase 8 | planned |
| 11 | Node.js curriculum track | Phase 8 | planned |
| 12 | Mock interview mode | Deferred | planned |

## Phase 7: Workflow and quality

### 8. Workflow skills + agent context · done
Install JS Mastery skills, bootstrap `.workflow/`, gap fill AGENTS.md, enroll scope.
**Done when:** nine workflow skills in `.agents/skills/`, scope file exists, AGENTS.md reflects current phase and workflow paths.
- [x] Install skills: `npx skills add jsmastery-pro/skills`
- [x] Create `.workflow/` artifact paths
- [x] Gap fill AGENTS.md and CLAUDE.md pointer
- [x] Brownfield scope enrollment (this file)

### 9. Codebase hardening · in-progress
Tests for mastery/progress rules, safer env loading for CI, AGENTS.md and CONTEXT in sync.
**Done when:** vitest runs green on core progress logic; `yarn build` and `yarn tsc` pass; AGENTS.md shows Phase 6 complete.
- [x] Design it (spec): `.workflow/specs/0001-codebase-hardening.md`
- [ ] Build it: `/develop codebase hardening`
   - [x] Vitest + tests for `mastery.ts` and progress types
   - [x] Lazy env parse (no throw at import during static analysis)
   - [x] AGENTS.md current phase + workflow skill table
- [ ] Verify it: `/check verify codebase hardening`
- [ ] Test it: `/test codebase hardening`

Spec 0001 · code in `src/lib/progress/`, `src/lib/env.ts`

## Phase 8: More tracks

### 10. Next.js curriculum track · planned
Full MDX track reusing JS/React infrastructure.
**Done when:** published topics live with same learn UX as React track.
- [ ] Design it (spec): `/architect nextjs track`

### 11. Node.js curriculum track · planned
Runtime and libuv depth for backend interviews.
**Done when:** first published slice of Node topics with mastery gates.
- [ ] Design it (spec): `/architect nodejs track`

## Deferred

- **Mock interview mode**: timed Q&A with follow ups · needs a decision · full weight
- **Spaced repetition**: resurface weak Q&A on a schedule · needs a decision
- **Google OAuth**: enable when credentials ready · lean

## Legend

See [JS Mastery scope template](https://github.com/jsmastery-pro/skills) for feature lifecycle and weight meanings.
