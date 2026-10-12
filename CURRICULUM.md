# Curriculum Map

Recommended learning order and how tracks relate to each other.

---

## Track order (left sidebar)

| Order | Track | When to start | Focus |
|---|---|---|---|
| 1 | **JavaScript** | First | Language fundamentals, async, prototypes |
| 2 | **React** | After JS | Components, hooks, reconciliation, performance |
| 3 | **React Ecosystem** | After React core | Libraries used with React in production |
| 4 | **Next.js** | After React | App Router, RSC, caching, deployment |
| 5 | **Node.js** | After JS (parallel with React ok) | Runtime, libuv, streams, modules |
| 6 | **Express** | After Node | Middleware, routing, REST patterns |
| 7 | **Hono** | After Node | Lightweight edge/server frameworks |
| 8 | **MongoDB** | After Node | Document model, indexes, aggregation |
| 9 | **PostgreSQL** | After Node | SQL, relations, transactions, indexes |
| 10 | **NestJS** | After Node + TS | Modules, DI, guards, enterprise patterns |

---

## JavaScript track — full map (40 topics)

Topics are ordered **globally** by the `order` frontmatter field (prev/next navigation).  
Subcategories group the sidebar only.

| Subcategory | Topics (in learning order) |
|---|---|
| **Data Types** | Strings → Numbers → Objects → Arrays → Null & Undefined → Type Coercion → Equality → Symbols → BigInt |
| **Foundation** | Hoisting → Closures → The this Keyword → Prototypes → Scope → var/let/const → Functions → Destructuring → Spread & Rest → ES Modules → Classes → Error Handling |
| **Execution** | Event Loop → Promises → Callbacks → async/await → Timers → Generators |
| **Patterns** | Array Methods → Functional Patterns → Debounce & Throttle → Memoization |
| **Browser APIs** | DOM Events → Fetch API → Web Storage → Event Delegation |
| **Advanced** | Garbage Collection → WeakMap & WeakSet → Proxy & Reflect → Iterators → Optional Chaining |

### Mastery (Phase 3)

Each topic defines `masteryCriteria` in frontmatter:

- **minQuestionsCorrect** — mark enough Q&A as “Got it” on the Interview Q&A tab
- **requireChallenge** — optional coding challenge pass (closures, arrays, objects, prototypes)

**Prerequisites** use topic `slug` values (e.g. `promises` requires `event-loop`).  
**Soft nudge** (default): sidebar shows locks and next-topic hint until mastered.  
**Hard lock** (optional): set `localStorage` key `elite-learn-settings` to `{"hardLock":true}`.

---

## Preview topics

Tracks beyond JavaScript and React ship with one **preview** topic each (`status: preview` in frontmatter). Full MDX content fills in per ROADMAP phase.

---

## React track — full map (17 topics)

| Subcategory | Topics (in learning order) |
|---|---|
| **Core** | Components & JSX → Props & State → Rendering & Virtual DOM → Lists & Keys → Lifting State → Composition |
| **Hooks** | useState & useEffect → useRef/useMemo/useCallback → useContext → useReducer → Custom Hooks |
| **Patterns** | Controlled vs Uncontrolled → Error Boundaries → Refs & Portals |
| **Performance** | React.memo → Reconciliation → Concurrent React |

Prerequisites can reference **JavaScript** topic slugs (e.g. `closures`) — mastery checks resolve across tracks.

---

## Prerequisites (soft / hard)

| Track | Recommended before |
|---|---|
| React | JavaScript MVP (closures, this, prototypes, promises) |
| React Ecosystem | React core |
| Next.js | React + React Ecosystem basics |
| Node.js | JavaScript execution + async |
| Express / Hono | Node.js |
| MongoDB / PostgreSQL | Node.js + basic SQL/NoSQL concepts |
| NestJS | Node.js + TypeScript + Express-level HTTP knowledge |

Hard locking is configurable per learner via `elite-learn-settings` in localStorage.
