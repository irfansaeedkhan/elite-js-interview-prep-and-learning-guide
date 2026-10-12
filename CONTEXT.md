# Elite Interview Prep Platform — Context

> **Start here in every new Cursor session.** This file is the single source of truth for where the project stands and which docs to read.

---

## What we're building

An **elite-level interview prep platform** that fills gaps in existing tools (GreatFrontEnd, LeetCode discuss, scattered blog posts). Learners master one topic completely — definition, examples, deep dive, interview Q&A — before moving to the next.

**Starting track:** JavaScript → React → Next.js → Node.js → Express → Hono → NestJS → (more later)

**Core differentiator:** Topic mastery gates — not fragments, but full understanding with optional coding challenges and progress tracking.

---

## Current phase

| Phase | Status | Focus |
|---|---|---|
| **0 — Foundation** | ✅ Complete | Next.js, Velite, theme toggle, learn shell, event-loop preview |
| **1 — JS MVP** | ✅ Complete | 10 core topics, Shiki highlighting, prev/next nav, local progress |
| **2 — Playground** | ✅ Complete | Sandpack, output prediction, flashcards, coding challenges on all 10 JS topics |
| **3 — Full JS track** | ✅ Complete | 40 topics, mastery gates, progress UI, follow-up prompts |
| **4 — Auth + sync** | ✅ Complete | Better Auth, Docker Postgres, progress API, gamification (logged-in only) |
| **5 — React track** | ✅ Complete | 17 React topics, JSX Sandpack, cross-track progress, active track nav |
| **6 — Landing + SEO** | ✅ Complete | Marketing landing, per-topic metadata, FAQ/AEO, OG, sitemap |
| **7 — Workflow + quality** | 🔄 In progress | JS Mastery skills, Vitest, scope in `.workflow/` |
| 8+ — More tracks | ⬜ Not started | Next.js, Node, Express, Hono, NestJS |

See [ROADMAP.md](./ROADMAP.md) for full phase details.

---

## Prototype status (Figma → code)

A Vite + React prototype exists with:

- **3-panel layout:** Main category sidebar → topic tree → content tabs
- **Topic tabs:** Overview | Examples | In-Depth | Interview Q&A
- **Sample data:** `src/app/data/jsTopics.ts` (Foundation, Data Types, History)
- **UI:** shadcn/ui components + dark/light CSS tokens (`globals.css`)
- **Source:** [Figma design](https://www.figma.com/design/pL6kcivBLitSG6VzgKdtub/Interview-Revision-App)

**Next migration step:** Move to Next.js 16 App Router, MDX content, shareable URLs per topic.

---

## Doc index

| Doc | Purpose |
|---|---|
| [CONTEXT.md](./CONTEXT.md) | **This file** — phase status, doc index |
| [ROADMAP.md](./ROADMAP.md) | Phased delivery plan, feature priorities |
| [BRAND.md](./BRAND.md) | Positioning, pillars, copy direction |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, folder structure, content model, UI layout |
| [CONTENT-STRATEGY.md](./CONTENT-STRATEGY.md) | MDX authoring, diagrams, media, content workflow |
| [CURRICULUM.md](./CURRICULUM.md) | Track order, React Ecosystem hierarchy, prerequisites |
| [PROJECT-CONVENTIONS.md](./PROJECT-CONVENTIONS.md) | Code patterns, naming, API rules |
| [DESIGN-ETHICS.md](./DESIGN-ETHICS.md) | UI principles (calm, premium aesthetic) |
| [DEPLOY.md](./DEPLOY.md) | Vercel + Neon deploy (adapt when auth ships) |
| [AGENTS.md](./AGENTS.md) | Cursor agent instructions |

---

## Tech stack (locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui only (no MUI) |
| Theme | next-themes (dark + light) |
| Content | MDX + Velite (see CONTENT-STRATEGY.md) |
| Client state / data | TanStack Query where needed |
| Forms | TanStack Form or react-hook-form |
| Code display | Shiki |
| Code execution | Sandpack (Phase 2) |
| Auth (Phase 4) | Better Auth + Neon Postgres |
| Deploy | Vercel |
| Package manager | **yarn only** |

---

## Hard rules (from AGENTS.md)

1. **yarn only** — never npm
2. **No UI changes** unless explicitly requested — logic/backend OK without asking
3. **shadcn strictly** — no other component libraries
4. **Business logic in services** — not in components or route handlers
5. **Minimize scope** — smallest correct diff
6. **No git commits** unless user explicitly asks

---

## Open decisions

| Decision | Status | Recommendation |
|---|---|---|
| Product name | TBD | Pick before final BRAND.md polish |
| Content storage | Decided → MDX in git | See CONTENT-STRATEGY.md |
| Code playground | Decided → Sandpack | Phase 2 |
| Progress before auth | Decided → localStorage | Phase 1, sync in Phase 4 |
| Mastery gate strictness | TBD | Soft nudge first, hard lock optional later |

---

## Reference codebases

| Repo | Use for |
|---|---|
| `../best-practices-flow/` | Auth, API errors, Drizzle patterns (Phase 4+) |
| Current prototype (`src/app/`) | UI layout, shadcn components, topic structure |

---

## Legacy docs note

Some files (`DEPLOY.md`, parts of `AGENTS.md`) were copied from the DayMirror/Chronos project. They will be updated as this product matures. Brand and roadmap docs are now written for **interview prep**, not time tracking.
