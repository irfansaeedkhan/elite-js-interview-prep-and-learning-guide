# Optimize code

Plan for making topic navigation fast, keeping reading and practice open to everyone, and moving the app to Next.js 16.

Do this in the order below. Each step should stay small enough to ship on its own.

---

## Product rule

Login is optional. It is only for people who want a saved history of what they covered and what they practiced.

| Visitor | Can do | Must not require an account |
|---|---|---|
| Guest | Read every topic. Run examples. Use the playground. Attempt coding challenges and output predictions. | Article HTML, tabs, and practice UI stay public. |
| Signed in | Everything a guest can do, plus saved coverage, mastery, points, streaks, resume, and practice history across devices. | Progress UI appears after the article is already on screen. |

Rules:

1. Never hide a topic, tab, or playground behind auth.
2. Never block the article on `/api/auth/get-session` or `/api/progress`.
3. Guest practice runs in the browser only. Nothing is written to Postgres.
4. Signed-in practice is stored per `userId`. Every progress query stays scoped to that user.
5. The "Got it", mastery rings, points, and streaks stay hidden until there is a session. A short "Sign in to save progress" line is enough. Do not disable the playground for guests.
6. Today the coding challenge "Mark challenge attempted" button is disabled when logged out. Change that: guests can run and mark an attempt in the page session; only the save to the API is skipped.

### Practice history (signed in only)

Add this when the page-speed work above is in place. Do not build it before the payload shrinks.

Suggested tables (Drizzle, same Postgres):

- `topic_progress` already stores visit, Q&A scores, challenge pass, mastery, time spent.
- New `practice_attempts`: `id`, `userId`, `topicPath`, `kind` (`challenge` | `prediction` | `qa`), `promptId`, `passed` boolean, `createdAt`.

Coverage ("how much they have covered") stays a read model over `topic_progress`: topics visited, percent mastered, last topic. Practice history is the list of attempts, newest first, on the topic and later on a profile page.

Guests do not get this list. Refreshing the page clears an unsaved attempt. Say that in the challenge panel in one sentence.

---

## Why pages feel slow

The app is already Next.js 15. Another framework will not fix this. The learn route opts out of what Next.js is fast at.

Measured on `yarn dev` (cold compile, then warm):

- First compile of `/learn/[track]/[[...slug]]`: about 30s, about 6,400 modules.
- First topic responses: 6–35s.
- Later topic responses: about 80–170ms on the server.
- First `GET /api/auth/get-session`: about 10s while Postgres woke up.

Server time after compile is already fine. The click still feels slow because:

1. `src/components/navigation/learn-layout.tsx` is a client component and loads the article with `ssr: false`. The reader sees "Loading topic…" until JavaScript runs.
2. The page passes `getTopicsForTrack()` into that client tree. Every topic object includes the full MDX `content` string. One click serializes the whole track.
3. `src/components/mdx/mdx-components.tsx` statically imports Mermaid, Sandpack, and the coding challenge. `CodeExample` imports Shiki and highlights in the browser on every topic.
4. `src/components/mdx/mdx-content.tsx` runs `new Function(code)` in the browser instead of sending HTML.
5. Auth and progress run on the way to the article. Guests should not wait for either.

Dev compile cost is separate from production. After the bundle shrinks, both get faster. Judge the work with `yarn build && yarn start`, not only `yarn dev`.

---

## Step 1 — Server-render the article

Goal: the definition is in the HTML response. No "Loading topic…" gate.

- Remove `ssr: false` and the dynamic import wrapper in `learn-layout.tsx`.
- Split the tree:
  - Server: page, article header, MDX body, prev/next links that do not need progress.
  - Client islands: tab state if it must be interactive beyond URL search params, mastery panel, progress rings, "Got it" buttons, playground.
- Topic tabs already use `?tab=`. Prefer that as the source of truth so a tab is a normal navigation, not a client-only state reset.
- Keep `TopicProvider` only around components that read interview questions. Do not wrap the whole page if the server can pass the question into the block.

Done when: view source on a topic shows the definition text, with JavaScript disabled the article is still readable, and a guest never hits an auth wall.

## Step 2 — Shrink what crosses to the client

Goal: the sidebar does not receive MDX source.

- Add a `TopicNavItem` type: `slug`, `title`, `path`, `permalink`, `order`, `subCategory`, `status`. No `content`, no `interviewQuestions`.
- `getTopicsForTrack()` can stay for the server page. Pass `toNavItems(topics)` into `LearnShell` and `SubSidebar`.
- Pass the full topic only into the article for the current URL.
- `generateMetadata` already loads one topic. Do not also serialize the track into the client for the same request.

Done when: the RSC payload for a topic page is one article plus a short nav list. Compare before and after in the Next.js dev overlay or by logging payload size.

## Step 3 — Load heavy libraries only when used

Goal: a definition page does not download the playground.

- In `mdx-components.tsx`, load these with `next/dynamic` and `ssr: false` only inside the component that renders them:
  - `MermaidDiagram` (mermaid)
  - `SandpackPlayground` / `ReactPlayground`
  - `CodingChallenge`
  - `EventLoopExplorer` if it pulls mermaid or a large graph
- Move Shiki off the client. Highlight in Velite at build time, or highlight on the server inside `CodeExample` and send HTML. Delete the `useEffect` + `codeToHtml` path.
- Do not add `transpilePackages` for mermaid and Sandpack on the server graph once they are dynamic client-only imports. Revisit `next.config.ts` after the split.

Done when: the learn route's module count on first compile drops sharply, and a topic with no playground does not request Sandpack chunks.

## Step 4 — Keep the shell mounted

Goal: the sidebars do not remount on every topic click.

- Move the track shell to `src/app/learn/[track]/layout.tsx`.
- Leave only the current article in `src/app/learn/[track]/[[...slug]]/page.tsx`.
- The layout fetches nav items once per track. The page fetches one topic.
- `next/link` already prefetches in production. After step 2, that prefetch is cheap. Do not prefetch today's full MDX payload.

Done when: clicking the next topic swaps the article and the tracks sidebar does not flash.

## Step 5 — Auth and progress after paint

Goal: reading never waits on the database.

- Render topic HTML with no `await getSession()` in the page.
- `useSession` and the progress query stay in the client islands (sidebar rings, mastery panel, auth button).
- If the session request is slow, the article is already visible.
- `useTopicVisitTracking` may PATCH in the background only when `enabled` is true. Do not block render on that mutation.
- Warm Postgres in dev with Docker already running. A 10s first session call is a cold database, not React. Production should use Neon's pooled `DATABASE_URL` so serverless does not open a new connection per click.

Done when: a guest topic navigation makes no request to `/api/auth/*` or `/api/progress` before the article paints. A signed-in user may call them after paint.

## Step 6 — Practice history for signed-in users

Build the system described in the product rule.

- Guests: playground and challenge UI work. Attempts live in component state.
- Signed in: `POST` an attempt only after a run, through `src/lib/progress/progress-service.ts`, always filtered by `session.user.id`.
- Show "Saved to your history" only when the request succeeds.
- A later profile or topic panel lists attempts. That panel is a client island. It is absent for guests.

Done when: two browsers, one guest and one account, can both run a challenge. Only the account sees the attempt after refresh.

---

## More optimizations worth doing in the same pass

- **One client boundary per island.** `learn-shell.tsx`, `main-sidebar.tsx`, and `sub-sidebar.tsx` can stay client because they use state. The article must not be inside that boundary, or the MDX string is still shipped.
- **Stop re-evaluating MDX.** Prefer Velite's compiled output rendered on the server. `new Function` on every visit skips the server cache and costs parse time.
- **URL tabs.** Overview, examples, in-depth, Q&A, and playground are already query params. Keep inactive tab content out of the first paint if a tab pulls Sandpack. The playground tab can be the only place Sandpack mounts.
- **Stable Sandpack `files` object.** Already memoized. Keep that. A new object each render resets the editor.
- **Do not subscribe the whole page to session.** `useSession` in the article header re-renders the MDX tree when auth resolves. Keep it in `UserAuthNav` and the mastery panel.
- **Progress query.** `staleTime` is 30s. Raise it for the sidebar snapshot and update from the mutation response (`setQueryData` is already there). Avoid refetching the full map on every topic click.
- **Images and fonts.** No extra font downloads. Do not add a large OG image to the learn document. `opengraph-image.tsx` is enough for the home page.
- **Bundle check.** After steps 1–3, run a bundle analyzer once (`@next/bundle-analyzer`) and confirm mermaid and `@codesandbox/sandpack-react` are in async chunks.
- **Production check.** `yarn build && yarn start`, then click five topics. Record server time. Dev numbers include compile and are not the launch target.
- **Database.** Index `topic_progress (user_id, topic_path)` already exists. Practice attempts need the same `(user_id, topic_path, created_at)` index.
- **Static generation.** `generateStaticParams` already lists topics. After the article is a server component, production can serve those pages as static HTML. Do not mark the learn page `force-dynamic` because of auth.

---

## Step 7 — Migrate to Next.js 16

Do this after steps 1–5, not before. A framework upgrade on top of a 6,400-module client page makes the upgrade harder to judge.

Current stack: Next.js 15.5, React 19, Velite, Yarn. App Router is already in use. `params` on the learn page are already a `Promise`, which Next.js 16 requires.

### Before upgrading

- Read `node_modules/next/dist/docs/` after the upgrade, and the official upgrade guide. Next.js 16 is not a drop-in of older habits.
- Node 20.9 or newer.
- Commit a green `yarn test` and `yarn build` on 15 first, so failures belong to the upgrade.

### Upgrade

```bash
yarn add next@16 react@19 react-dom@19
yarn add -D @types/react@19 @types/react-dom@19
```

Use the Next.js codemod if the guide still ships one (`npx @next/codemod upgrade`). Yarn only. No npm install.

Then:

- `yarn build` and fix every type error before touching features.
- Re-read any renamed request APIs. `cookies()`, `headers()`, `params`, and `searchParams` are async. This repo already awaits `params` on the learn page. Search for other pages and route handlers.
- If the guide renames `middleware.ts` to `proxy.ts`, follow that. This repo has no middleware file today.
- Turbopack is the default dev and build bundler in 16. Remove custom webpack config if one appears. Keep `transpilePackages` only if a library still fails under Turbopack.
- Turn on Cache Components only for the public article, and only after measuring. A public topic page is a good `"use cache"` candidate. Do not cache `/api/progress` or any response that depends on the session.
- React Compiler: optional, after the islands are split. It will not fix a huge client bundle.
- `yarn lint`: if `next lint` is removed in 16, switch the script to the ESLint CLI the upgrade guide names. Do not leave a broken script.
- Confirm `yarn dev`, `yarn build`, `yarn test` on Windows.

### After upgrading

- Click guest topic to topic. Article HTML first, no auth wait.
- Sign in. Progress rings fill in after paint. A challenge attempt survives refresh.
- `yarn build` output should show the learn routes as static or cached, not dynamic because of cookies.

---

## Suggested order

| Order | Work | Exit |
|---|---|---|
| 1 | Server-render the article | Definition in HTML, guests included |
| 2 | Nav items without MDX `content` | Small payload per click |
| 3 | Dynamic Mermaid, Sandpack, Shiki on server | Learn compile is no longer thousands of modules |
| 4 | Track layout holds the shell | Sidebar does not remount |
| 5 | Auth and progress after paint | No session wait before read |
| 6 | Practice history for accounts only | Guest practice works, account history persists |
| 7 | Next.js 16 | Build, test, and the same click path stay green |

## Out of scope for this pass

- New visual design, colors, or borders.
- Gating topics, AI interview, or mock interview behind login.
- Rewriting curriculum MDX.
- Replacing Velite or Better Auth.
