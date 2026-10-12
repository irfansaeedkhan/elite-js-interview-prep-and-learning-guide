#!/usr/bin/env node
/**
 * Seeds Phase 5 React track topics.
 * Run: node scripts/seed-react-phase5.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/tracks/react');

const categories = [
  { dir: 'hooks', title: 'Hooks', order: 2 },
  { dir: 'patterns', title: 'Patterns', order: 3 },
  { dir: 'performance', title: 'Performance', order: 4 },
];

for (const cat of categories) {
  const dir = path.join(ROOT, cat.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'category.json'),
    JSON.stringify({ title: cat.title, slug: cat.dir, order: cat.order }, null, 2) + '\n',
  );
}

const topics = [
  [
    'core',
    'props-and-state',
    'Props & State',
    2,
    'easy',
    30,
    ['components-and-jsx'],
    'Props are read-only inputs from parents; state is internal data a component owns and updates with setState or hooks.',
  ],
  [
    'core',
    'rendering-basics',
    'Rendering & the Virtual DOM',
    3,
    'medium',
    35,
    ['props-and-state'],
    'React builds a virtual tree, diffs it against the previous render, and commits the minimal DOM updates.',
  ],
  [
    'core',
    'lists-and-keys',
    'Lists & Keys',
    4,
    'medium',
    30,
    ['rendering-basics'],
    'Keys help React identify list items across renders — stable ids beat array index when order changes.',
  ],
  [
    'core',
    'lifting-state',
    'Lifting State Up',
    5,
    'medium',
    30,
    ['lists-and-keys'],
    'When siblings need shared data, move state to their closest common ancestor and pass callbacks down.',
  ],
  [
    'core',
    'composition',
    'Composition Patterns',
    6,
    'medium',
    35,
    ['lifting-state'],
    'Prefer composition (children, render props, slots) over inheritance — React components are functions, not class hierarchies.',
  ],
  [
    'hooks',
    'use-state-use-effect',
    'useState & useEffect',
    7,
    'medium',
    40,
    ['composition'],
    'useState adds local state; useEffect runs side effects after render with a dependency array controlling re-runs.',
  ],
  [
    'hooks',
    'use-ref-memo-callback',
    'useRef, useMemo & useCallback',
    8,
    'hard',
    40,
    ['use-state-use-effect'],
    'useRef holds mutable values without re-render; useMemo/useCallback cache values and functions between renders.',
  ],
  [
    'hooks',
    'use-context',
    'useContext',
    9,
    'medium',
    30,
    ['use-ref-memo-callback'],
    'Context passes data through the tree without prop drilling — pair with useContext and memoize provider values.',
  ],
  [
    'hooks',
    'use-reducer',
    'useReducer',
    10,
    'medium',
    35,
    ['use-context'],
    'useReducer models complex state transitions with a reducer function — similar to Redux locally.',
  ],
  [
    'hooks',
    'custom-hooks',
    'Custom Hooks',
    11,
    'hard',
    35,
    ['use-reducer'],
    'Extract reusable stateful logic into functions named useSomething — they can compose other hooks.',
  ],
  [
    'patterns',
    'controlled-uncontrolled',
    'Controlled vs Uncontrolled',
    12,
    'medium',
    30,
    ['custom-hooks'],
    'Controlled inputs mirror React state; uncontrolled inputs use refs/DOM as source of truth.',
  ],
  [
    'patterns',
    'error-boundaries',
    'Error Boundaries',
    13,
    'medium',
    30,
    ['controlled-uncontrolled'],
    'Class components (or libraries) with getDerivedStateFromError catch render errors in child trees.',
  ],
  [
    'patterns',
    'refs-and-portals',
    'Refs & Portals',
    14,
    'medium',
    30,
    ['error-boundaries'],
    'Refs reach DOM nodes or component instances; portals render children into another DOM subtree.',
  ],
  [
    'performance',
    'react-memo',
    'React.memo & Optimization',
    15,
    'hard',
    35,
    ['refs-and-portals'],
    'React.memo skips re-render when props are shallow-equal; pair with stable callbacks from useCallback.',
  ],
  [
    'performance',
    'reconciliation',
    'Reconciliation Deep Dive',
    16,
    'hard',
    40,
    ['react-memo'],
    'React compares element type and key — changing type unmounts; keys preserve identity in lists.',
  ],
  [
    'performance',
    'concurrent-react',
    'Concurrent React',
    17,
    'hard',
    35,
    ['reconciliation'],
    'Concurrent features (Transitions, Suspense) let React interrupt low-priority updates for responsive UI.',
  ],
];

function buildMdx(subCategory, slug, title, order, difficulty, minutes, prerequisites, definition) {
  const idBase = slug.replace(/-/g, '').slice(0, 6);
  const q1 = `${idBase}-1`;
  const q2 = `${idBase}-2`;
  const q3 = `${idBase}-3`;
  const q4 = `${idBase}-4`;
  const prereqYaml = prerequisites.length
    ? `prerequisites:\n${prerequisites.map((p) => `  - ${p}`).join('\n')}\n`
    : '';
  const useReactPlayground = ['use-state-use-effect', 'lifting-state', 'lists-and-keys'].includes(slug);
  const playgroundBlock = useReactPlayground
    ? `<ReactPlayground
  title="Try it"
  code={\`import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}\`}
/>`
    : `<CodingChallenge
  title="Explain ${title} in code"
  prompt="Write a minimal example that demonstrates the core idea of ${title}."
  hint="Keep it small — one component or hook is enough."
  starterCode={\`// ${title} example
console.log('Implement a minimal demo');\`}
  tests={[
    { label: 'runs without error', code: 'console.assert(true);' },
  ]}
/>`;

  return `---
title: ${title}
slug: ${slug}
track: react
subCategory: ${subCategory}
order: ${order}
estimatedMinutes: ${minutes}
${prereqYaml}keyTakeaways:
  - ${definition.split('.')[0]}
  - Know one interview-ready example
  - State common pitfalls senior interviewers probe
  - Connect ${title} to real component design trade-offs
masteryCriteria:
  minQuestionsCorrect: 3
  requireChallenge: false
difficulty: ${difficulty}
interviewQuestions:
  - id: ${q1}
    question: What is ${title} in React?
    answer: ${definition}
    difficulty: easy
    followUps:
      - When would you use this in a production app?
      - What breaks if you misuse it?
  - id: ${q2}
    question: What is a common interview trap around ${title}?
    answer: Interviewers probe edge cases — state the rule, then walk through a short JSX example.
    difficulty: medium
    followUps:
      - How would you debug a bug related to this?
  - id: ${q3}
    question: How does ${title} relate to other React concepts?
    answer: It builds on earlier topics in this track — tie your answer to props, state, hooks, or rendering.
    difficulty: medium
    followUps:
      - Which topic would you review if you got this wrong?
  - id: ${q4}
    question: How would you explain ${title} to a junior developer?
    answer: Plain language, one analogy, and a tiny component — avoid jargon until they ask.
    difficulty: easy
    followUps:
      - What follow-up would you ask to check understanding?
---

<TopicTabs>

<TopicTab value="overview">

<TopicDefinition>

${definition}

In React interviews, start with a one-sentence definition, then show a minimal component. Senior rounds go deeper on re-renders, hooks rules, and performance trade-offs.

</TopicDefinition>

<TopicQuickStats />

<KeyTakeaways />

</TopicTab>

<TopicTab value="examples">

<CodeExample title="Quick example" language="javascript">
{\`// ${title} — see playground tab for a runnable version
function Example() {
  return null;
}\`}
</CodeExample>

<Callout type="tip">
Explain ${title} out loud in under 30 seconds, then open the Q&amp;A tab.
</Callout>

</TopicTab>

<TopicTab value="indepth">

<Callout type="interview">
Pair your answer with **when not to use** this pattern — interviewers reward judgment, not memorization.
</Callout>

</TopicTab>

<TopicTab value="questions">

<FlashcardDeck ids={['${q1}', '${q2}', '${q3}', '${q4}']} />

<InterviewQuestionBlock id="${q1}" />
<InterviewQuestionBlock id="${q2}" />
<InterviewQuestionBlock id="${q3}" />
<InterviewQuestionBlock id="${q4}" />

</TopicTab>

<TopicTab value="playground">

<TopicPlayground>

${playgroundBlock}

</TopicPlayground>

</TopicTab>

</TopicTabs>
`;
}

for (const row of topics) {
  const [sub, slug, title, order, diff, mins, prereqs, def] = row;
  const file = path.join(ROOT, sub, `${slug}.mdx`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buildMdx(sub, slug, title, order, diff, mins, prereqs, def));
  console.log('wrote', path.relative(process.cwd(), file));
}

console.log('Done — run yarn velite to rebuild content.');
