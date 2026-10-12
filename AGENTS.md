# Elite Interview Prep Platform — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->

## Next.js version note

This is NOT the Next.js you know. Next.js 16 has breaking changes — read guides in `node_modules/next/dist/docs/` before writing code.

<!-- END:nextjs-agent-rules -->

---

## Before any task — read these first

| Doc                                                | When                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [CONTEXT.md](./CONTEXT.md)                         | **Start here in a new Cursor session** — phase status and doc index |
| [ROADMAP.md](./ROADMAP.md)                         | Launch priorities, phase order                                      |
| [ARCHITECTURE.md](./ARCHITECTURE.md)               | Tech stack, folder structure, content model                         |
| [CONTENT-STRATEGY.md](./CONTENT-STRATEGY.md)       | MDX authoring, diagrams, content workflow                           |
| [BRAND.md](./BRAND.md)                             | Positioning, pillars, copy direction                                |
| [PROJECT-CONVENTIONS.md](./PROJECT-CONVENTIONS.md) | Architecture, naming, API patterns                                  |
| [DESIGN-ETHICS.md](./DESIGN-ETHICS.md)             | UI principles — calm, premium aesthetic                             |
| [DEPLOY.md](./DEPLOY.md)                           | Vercel + Neon deploy (Phase 4+)                                     |
| [.workflow/README.md](./.workflow/README.md)       | JS Mastery workflow artifact paths                                  |
| [.workflow/scope/scope.md](./.workflow/scope/scope.md) | Living product scope (what to build next)                       |

---

## Engineering workflow (JS Mastery)

Installed from [jsmastery-pro/skills](https://github.com/jsmastery-pro/skills). State lives in files under `.workflow/`, not chat.

```
idea → /scope → /audit → /architect → /develop → /check verify → /test → /check review → /document → /sync
```

| Skill | When to run |
|---|---|
| `scope` | Plan next slice or reconcile after shipping (`/scope` with no args) |
| `audit` | Bootstrap or gap fill AGENTS.md on brownfield |
| `architect` | Load bearing decision needs a spec in `.workflow/specs/` |
| `develop` | Build from spec |
| `check` | `/check verify` after build, `/check review` before PR |
| `test` | Write tests for uncommitted changes |
| `document` | PR body, changelog from diff |
| `sync` | Reconcile AGENTS.md and scope after merge |
| `debug` | Root cause any failure |

---

## Skills — load before working in that area

All skills live in `.agents/skills/`. **Read the relevant skill before implementing.**

| Skill                                 | Trigger                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `better-auth-best-practices`          | Auth config, Drizzle adapter, plugins (Phase 4)                                                                                                                                                  |
| `better-auth-security-best-practices` | Rate limits, CSRF, cookies, production hardening                                                                                                                                                 |
| `create-auth-skill`                   | Scaffolding login/signup/OAuth from scratch                                                                                                                                                      |
| `email-and-password-best-practices`   | Sign-up, password reset, email verification                                                                                                                                                      |
| `oauth`                               | Google OAuth, redirect URI setup                                                                                                                                                                 |
| `commit-staged`                       | Conventional commit messages from staged changes                                                                                                                                                 |
| `gh-draft-pr`                         | Draft PR with repo template                                                                                                                                                                      |
| `portless`                            | Named local dev URLs if needed                                                                                                                                                                   |
| `interview-definition-writing`        | MDX topic definitions, Q&A answers — spoken interview voice                                                                                                                                      |
| `copywriting`                         | Clear persuasive copy — landing page (Phase 6) - also for defination and explanation of topics with examples, examples, self-presentation tone (`coreyhaines31/marketingskills`, global install) |
| `scope` / `audit` / `architect` / `develop` / `check` / `test` / `document` / `sync` / `debug` | JS Mastery engineering workflow — see `.workflow/README.md` |

---

## Reference codebase (patterns, not copy-paste)

`../best-practices-flow/` — production-grade patterns for Phase 4+:

- `apps/backend/src/lib/auth.ts` — Better Auth server config
- `apps/backend/src/middleware/require-auth.ts` — session guard
- `apps/backend/src/lib/api-error.ts` — typed API errors
- `apps/frontend/src/lib/auth-client.ts` — React auth client

Adapt to this single-repo Next.js layout (see PROJECT-CONVENTIONS.md).

---

## Hard rules

1. **yarn only** — never npm
2. **No UI changes** unless user asks — logic/backend/content pipeline OK without asking
3. **shadcn strictly** — no MUI or other UI libraries
4. **DESIGN-ETHICS.md** — calm aesthetic for any UI/landing work
5. **Business logic in services** — never in controllers or components
6. **userId on every query** — no cross-user data leaks (Phase 4+)
7. **No secrets in code** — env vars only, validated in `src/lib/env.ts`
8. **No git commits** unless user explicitly asks
9. **Minimize scope** — smallest correct diff
10. **Content in MDX** — not giant TypeScript data files

---

## Current phase

**Phase 6 complete.** Landing + SEO shipped. **Phase 7 in progress:** workflow skills, tests, codebase hardening.

See [CONTEXT.md](./CONTEXT.md) and [.workflow/scope/scope.md](./.workflow/scope/scope.md) for status.

**Commands:** `yarn dev` · `yarn build` · `yarn test` · `yarn db:push` · `docker compose up -d`
