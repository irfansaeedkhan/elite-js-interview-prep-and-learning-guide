#!/usr/bin/env node
/**
 * Seeds Phase 3 JavaScript topics (orders 11–40).
 * Run: node scripts/seed-js-phase3.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/tracks/javascript');

const categories = [
  { dir: 'patterns', title: 'Patterns', order: 4 },
  { dir: 'browser', title: 'Browser APIs', order: 5 },
  { dir: 'advanced', title: 'Advanced', order: 6 },
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
  ['data-types', 'null-and-undefined', 'Null & Undefined', 11, 'easy', 20, ['strings'], 'null vs undefined, typeof quirks, and default parameters.'],
  ['data-types', 'type-coercion', 'Type Coercion', 12, 'medium', 25, ['strings', 'numbers'], 'Implicit and explicit coercion — what +, ==, and Boolean() really do.'],
  ['data-types', 'equality', 'Equality (== vs ===)', 13, 'medium', 25, ['type-coercion'], 'Loose vs strict equality and when interviewers expect ===.'],
  ['data-types', 'symbols', 'Symbols', 14, 'medium', 25, ['objects'], 'Unique property keys and well-known symbols like Symbol.iterator.'],
  ['data-types', 'bigint', 'BigInt', 15, 'easy', 20, ['numbers'], 'Arbitrary-precision integers beyond Number.MAX_SAFE_INTEGER.'],
  ['foundation', 'scope', 'Scope & Lexical Environment', 16, 'medium', 30, ['hoisting'], 'Global, function, and block scope — where variables live.'],
  ['foundation', 'var-let-const', 'var, let, and const', 17, 'easy', 25, ['scope', 'hoisting'], 'Block scoping, temporal dead zone, and const immutability.'],
  ['foundation', 'functions', 'Functions Deep Dive', 18, 'medium', 30, ['hoisting'], 'Declarations, expressions, arrows, IIFEs, and default/rest params.'],
  ['foundation', 'destructuring', 'Destructuring', 19, 'easy', 25, ['objects', 'arrays'], 'Unpack arrays and objects into variables — defaults and nested patterns.'],
  ['foundation', 'spread-rest', 'Spread & Rest', 20, 'easy', 25, ['destructuring'], '... in arrays, objects, and function parameters.'],
  ['foundation', 'es-modules', 'ES Modules', 21, 'medium', 30, ['functions'], 'import/export, live bindings, and dynamic import().'],
  ['foundation', 'classes', 'Classes', 22, 'medium', 35, ['prototypes'], 'class syntax, extends, super, static, and private fields.'],
  ['foundation', 'error-handling', 'Error Handling', 23, 'medium', 25, ['functions'], 'try/catch/finally, Error types, and throwing vs rejecting.'],
  ['execution', 'callbacks', 'Callbacks', 24, 'medium', 30, ['functions'], 'Callback pattern, error-first callbacks, and callback hell.'],
  ['execution', 'async-await', 'async/await', 25, 'hard', 35, ['promises'], 'async functions, await, sequential vs parallel, and error handling.'],
  ['execution', 'timers', 'Timers (setTimeout / setInterval)', 26, 'medium', 25, ['event-loop'], 'Macrotasks, delays, and clearing timers.'],
  ['execution', 'generators', 'Generators', 27, 'hard', 35, ['promises'], 'function*, yield, and iterable protocols.'],
  ['patterns', 'array-methods', 'Array Methods', 28, 'medium', 30, ['arrays'], 'map, filter, reduce, find, some, every — when to use each.'],
  ['patterns', 'functional-patterns', 'Functional Patterns', 29, 'hard', 35, ['closures', 'array-methods'], 'Pure functions, immutability, compose, and pipe.'],
  ['patterns', 'debounce-throttle', 'Debounce & Throttle', 30, 'hard', 35, ['closures', 'timers'], 'Rate-limiting handlers for scroll, resize, and search.'],
  ['patterns', 'memoization', 'Memoization', 31, 'medium', 30, ['closures'], 'Cache function results with a closure-backed Map.'],
  ['browser', 'dom-events', 'DOM Events', 32, 'medium', 30, ['event-loop'], 'Event phases, addEventListener, and preventDefault.'],
  ['browser', 'fetch-api', 'Fetch API', 33, 'medium', 30, ['promises'], 'fetch, Response, JSON parsing, and basic error handling.'],
  ['browser', 'web-storage', 'Web Storage', 34, 'easy', 20, ['objects'], 'localStorage vs sessionStorage — sync, string-only, same-origin.'],
  ['browser', 'event-delegation', 'Event Delegation', 35, 'medium', 25, ['dom-events'], 'One listener on a parent for many dynamic children.'],
  ['advanced', 'garbage-collection', 'Garbage Collection', 36, 'hard', 35, ['closures'], 'Reachability, mark-and-sweep, and common leak patterns.'],
  ['advanced', 'weakmap-weakset', 'WeakMap & WeakSet', 37, 'hard', 30, ['garbage-collection'], 'Weak references and metadata without preventing GC.'],
  ['advanced', 'proxy-reflect', 'Proxy & Reflect', 38, 'hard', 35, ['objects'], 'Interception traps and reactive-style patterns.'],
  ['advanced', 'iterators', 'Iterators & for...of', 39, 'medium', 30, ['generators'], 'Iterable protocol, custom iterators, and spread with iterables.'],
  ['advanced', 'optional-chaining', 'Optional Chaining & ??', 40, 'easy', 20, ['objects'], '?. and nullish coalescing vs || for defaults.'],
];

function slugPrefix(sub, slug) {
  const short = slug.replace(/-/g, '').slice(0, 4);
  return `${sub.slice(0, 3)}-${short}`.replace(/[^a-z0-9-]/g, '');
}

function buildMdx(subCategory, slug, title, order, difficulty, minutes, prerequisites, definition) {
  const idBase = slug.replace(/-/g, '').slice(0, 6);
  const q1 = `${idBase}-1`;
  const q2 = `${idBase}-2`;
  const q3 = `${idBase}-3`;
  const q4 = `${idBase}-4`;
  const prereqYaml = prerequisites.length
    ? `prerequisites:\n${prerequisites.map((p) => `  - ${p}`).join('\n')}\n`
    : '';

  return `---
title: ${title}
slug: ${slug}
track: javascript
subCategory: ${subCategory}
order: ${order}
estimatedMinutes: ${minutes}
${prereqYaml}keyTakeaways:
  - Core concepts for ${title} interviews
  - Know the definition and one concrete example
  - Watch for common traps senior interviewers probe
  - Tie answers back to real debugging experience
masteryCriteria:
  minQuestionsCorrect: 3
  requireChallenge: false
difficulty: ${difficulty}
interviewQuestions:
  - id: ${q1}
    question: What is ${title} in JavaScript?
    answer: ${definition}
    difficulty: easy
    followUps:
      - When would you reach for this in production code?
      - What breaks if you misuse it?
  - id: ${q2}
    question: What is a common interview trap around ${title}?
    answer: Interviewers often pair ${title} with edge cases — state the rule, then walk through a short example.
    difficulty: medium
    followUps:
      - Can you show the fix in code?
  - id: ${q3}
    question: How does ${title} relate to other JS concepts you know?
    answer: It connects to topics earlier in this track — mention scope, types, async, or the DOM where relevant.
    difficulty: medium
    followUps:
      - Which topic would you review first if you got this wrong?
  - id: ${q4}
    question: How would you explain ${title} to a junior developer?
    answer: Use plain language, one analogy, and one line of code — avoid spec jargon until they ask.
    difficulty: easy
    followUps:
      - What follow-up question would you ask them to check understanding?
---

<TopicTabs>

<TopicTab value="overview">

<TopicDefinition>

${definition}

In interviews, lead with a clear one-liner, then add one example. Senior rounds go deeper on edge cases and trade-offs — have a short code snippet ready.

</TopicDefinition>

<TopicQuickStats />

<KeyTakeaways />

</TopicTab>

<TopicTab value="examples">

<CodeExample title="Quick example" language="javascript">
{\`// ${title} — add your own variation in the playground
console.log('Review the in-depth tab and Q&A for this topic');\`}
</CodeExample>

<Callout type="tip">
Re-read the key takeaways, then try explaining ${title} out loud in under 30 seconds.
</Callout>

</TopicTab>

<TopicTab value="indepth">

### What to focus on

- Definition and mental model
- One gotcha interviewers love
- How it connects to prerequisites in this track

### Senior follow-ups

Be ready to compare alternatives and describe when **not** to use this feature.

</TopicTab>

<TopicTab value="questions">

<FlashcardDeck ids={['${q1}', '${q2}', '${q3}', '${q4}']} />

<InterviewQuestionBlock id="${q1}" />
<InterviewQuestionBlock id="${q2}" />
<InterviewQuestionBlock id="${q3}" />
<InterviewQuestionBlock id="${q4}" />

</TopicTab>

<TopicTab value="playground">

<TopicPlayground />

</TopicTab>

</TopicTabs>
`;
}

for (const [sub, slug, title, order, diff, min, prereqs, def] of topics) {
  const dir = path.join(ROOT, sub);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, buildMdx(sub, slug, title, order, diff, min, prereqs, def));
    console.log('created', file);
  } else {
    console.log('skip (exists)', file);
  }
}

console.log('Done seeding Phase 3 topics.');
