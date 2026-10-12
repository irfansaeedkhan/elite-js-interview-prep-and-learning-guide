# Workflow artifacts (JS Mastery)

This project uses the [JS Mastery Engineering Workflow](https://github.com/jsmastery-pro/skills) skills installed in `.agents/skills/`.

State lives in files, not chat sessions. Run skills with `/scope`, `/audit`, `/architect`, `/develop`, `/check`, `/test`, `/document`, `/sync`, `/debug`.

## Paths

| Artifact | Path | Owner skill |
|---|---|---|
| Scope | `.workflow/scope/` | scope |
| Specs | `.workflow/specs/` | architect |
| Review findings | `.workflow/reviews/` | check |
| Context | `AGENTS.md` (+ `CLAUDE.md` pointer) | audit, sync |
| Design direction | `design.md` | develop |
| Tests | `src/**/*.test.ts` | test |
| Human docs | `CHANGELOG.md`, `.workflow/releases/` | document |

We use `.workflow/` instead of `docs/` so workflow files never mix with curriculum or a future docs site.

## Brownfield order

1. `/audit` — gap fill AGENTS.md (done on install)
2. `/scope` — enroll shipped work, queue next slice
3. `/architect <feature>` — write spec before load bearing changes
4. `/develop` → `/check verify` → `/test` → `/check review` → `/document` → `/sync`

## Installed workflow skills

`architect`, `audit`, `check`, `debug`, `develop`, `document`, `scope`, `sync`, `test`
