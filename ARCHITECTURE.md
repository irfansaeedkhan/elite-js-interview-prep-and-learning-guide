# Architecture — Elite Interview Prep Platform

Technical architecture, content model, folder structure, and UI layout.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | SEO, routing, RSC for content |
| Styling | Tailwind CSS v4 | Already in prototype |
| Components | shadcn/ui only | Consistent, accessible, themeable |
| Theme | next-themes | Dark + light — tokens in `globals.css` |
| Content | MDX + Velite | Author in markdown, type-safe collections |
| Client data | TanStack Query | Progress fetch, cache, invalidation |
| Forms | TanStack Form / react-hook-form | Q&A self-assessment, challenges |
| Code display | Shiki | Server-side syntax highlighting |
| Code execution | Sandpack | Browser sandbox, React-friendly |
| Auth (Phase 4) | Better Auth + Neon | Sessions, OAuth |
| ORM (Phase 4) | Drizzle | Type-safe Postgres |
| Deploy | Vercel | Serverless, preview deploys |

**Package manager:** yarn only.

---

## Folder structure

```
elite-interview-prep-platform/
├── content/                          # MDX curriculum (git-tracked)
│   └── tracks/
│       └── javascript/
│           ├── _meta.json            # Track metadata
│           └── data-types/
│               └── strings.mdx
├── public/
│   └── diagrams/                     # Static SVG/PNG exports
├── src/
│   ├── app/
│   │   ├── (marketing)/              # Landing (Phase 6)
│   │   │   └── page.tsx
│   │   ├── (learn)/
│   │   │   ├── layout.tsx            # 3-panel shell + theme toggle
│   │   │   └── [track]/
│   │   │       └── [[...slug]]/
│   │   │           └── page.tsx      # Dynamic topic page
│   │   ├── api/
│   │   │   └── progress/             # Phase 4
│   │   ├── layout.tsx                # Root + ThemeProvider
│   │   └── globals.css
│   ├── components/
│   │   ├── curriculum/               # TopicTabs, QuestionAccordion, etc.
│   │   ├── mdx/                      # MermaidDiagram, CodeExample, Callout
│   │   ├── playground/               # Sandpack wrapper (Phase 2)
│   │   ├── navigation/               # MainSidebar, SubSidebar, TopicNav
│   │   └── ui/                       # shadcn
│   ├── lib/
│   │   ├── curriculum/               # Loaders, slug resolution
│   │   ├── progress/                 # Mastery logic (service)
│   │   └── env.ts                    # Validated env vars (Phase 4)
│   ├── hooks/
│   │   └── use-topic-progress.ts
│   └── types/
│       └── curriculum.ts
├── CONTEXT.md
├── ROADMAP.md
├── CONTENT-STRATEGY.md
└── ...
```

---

## Content model (TypeScript)

```typescript
// src/types/curriculum.ts

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TopicStatus = 'locked' | 'available' | 'in_progress' | 'mastered';

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  language: 'javascript' | 'typescript' | 'jsx' | 'tsx';
  explanation: string;
  runnable?: boolean;
}

export interface DeepDiveSection {
  id: string;
  title: string;
  content: string;
  whyItMatters?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  followUps?: string[];
  tags?: string[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  tests: { input: string; expected: string }[];
  hints?: string[];
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  prerequisites?: string[];
  definition: string;
  keyTakeaways: string[];
  examples: CodeExample[];
  deepDive: DeepDiveSection[];
  interviewQuestions: InterviewQuestion[];
  codingChallenge?: CodingChallenge;
  masteryCriteria: {
    minQuestionsCorrect: number;
    requireChallenge?: boolean;
  };
}

export interface SubCategory {
  id: string;
  slug: string;
  title: string;
  topics: Topic[];
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  order: number;
  subCategories: SubCategory[];
}
```

Velite generates typed collections from MDX frontmatter matching this shape.

---

## UI layout (3-panel)

Ported from Figma prototype — scales to multiple tracks.

```
┌──────────────┬──────────────┬─────────────────────────────────────┐
│ Track picker │ Topic tree   │ Topic content                       │
│ (JS/React/   │ (collapsible │ ┌─────────────────────────────────┐ │
│  Next.js…)   │  sub-cats)   │ │ Breadcrumb + progress ring      │ │
│              │              │ ├─────────────────────────────────┤ │
│ + progress   │ ✓ mastered   │ │ Tabs: Overview | Examples |     │ │
│   overview   │ ○ current    │ │ Deep Dive | Q&A | Playground    │ │
│              │ 🔒 locked    │ ├─────────────────────────────────┤ │
│              │              │ │ MDX body + embedded diagrams      │ │
│              │              │ │ [Prev topic] [Mark mastered →]  │ │
└──────────────┴──────────────┴─────────────────────────────────────┘
```

### Topic tabs

| Tab | Content |
|---|---|
| Overview | Definition, key takeaways, quick stats |
| Examples | Code blocks + explanations (some runnable in Phase 2) |
| Deep Dive | Advanced sections, edge cases, interview angles |
| Interview Q&A | Accordion with difficulty badges, follow-ups |
| Playground | Sandpack + challenges (Phase 2) |

---

## Routing

| Route | Purpose |
|---|---|
| `/` | Landing (Phase 6) or redirect to `/learn/javascript` |
| `/learn/[track]` | Track home — first topic or overview |
| `/learn/[track]/[...slug]` | Topic page |
| `/api/progress` | User progress CRUD (Phase 4) |

Example: `/learn/javascript/data-types/primitive/strings`

---

## TanStack usage

| Library | When |
|---|---|
| TanStack Query | Fetch/sync progress, cache topic metadata |
| TanStack Form | Q&A self-assessment, challenge submission |
| TanStack Table | Admin question bank (later) |
| TanStack Virtual | Long sidebar lists (100+ topics) |

Do **not** use TanStack Router — Next.js App Router handles routing.

---

## Progress & mastery (service layer)

Logic lives in `src/lib/progress/` — not in components.

```typescript
// Pseudocode
function canAccessTopic(topic: Topic, progress: UserProgress): boolean {
  if (!topic.prerequisites?.length) return true;
  return topic.prerequisites.every(slug => progress.isMastered(slug));
}

function isTopicMastered(topic: Topic, scores: TopicScores): boolean {
  const { minQuestionsCorrect, requireChallenge } = topic.masteryCriteria;
  const qaPass = scores.correctCount >= minQuestionsCorrect;
  const challengePass = !requireChallenge || scores.challengePassed;
  return qaPass && challengePass;
}
```

**Phase 1:** localStorage via `useTopicProgress` hook.  
**Phase 4:** sync to Postgres via Better Auth session.

---

## Migration from prototype

| Prototype | Target |
|---|---|
| Vite + React SPA | Next.js 16 App Router |
| `src/app/data/jsTopics.ts` | `content/tracks/javascript/**/*.mdx` |
| `App.tsx` state | URL-driven selection + optional client state |
| Duplicate types in components | Single `src/types/curriculum.ts` |
| MUI in package.json | Remove |
| `src/app/components/ui/*` | `src/components/ui/*` |

Keep visual design unchanged during migration unless user requests UI work.

---

## Security notes (Phase 4+)

- `userId` on every progress query — no cross-user leaks
- No secrets in code — env vars validated in `src/lib/env.ts`
- Sandpack runs in iframe sandbox — no Node APIs in browser challenges
- See `../best-practices-flow/` for auth patterns
