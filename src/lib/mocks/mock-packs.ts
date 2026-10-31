/**
 * Mock question packs (spec 0003). Small typed modules, not MDX:
 * MDX challenges render their tests visibly in the editor, so they
 * cannot supply hidden tests. These tasks are original session
 * config, not copies of topic exercises.
 *
 * Coding tasks are module-style: the starter must export the
 * functions the hidden tests import from './solution.js'.
 */

import type { MockPack } from './mock-session';

export const MOCK_PACKS: MockPack[] = [
  {
    id: 'javascript-foundations',
    title: 'JavaScript foundations',
    description: 'Core language mechanics under time pressure: nesting, caching, closures, and debugging.',
    defaultDurationMinutes: 30,
    questions: [
      {
        kind: 'coding',
        id: 'flatten-depth',
        title: 'Flatten with depth',
        prompt:
          'Implement flattenWithDepth(array, depth). It returns a new array with nesting flattened up to depth levels. Depth 0 (or less) returns a shallow copy of the input. Non-array values pass through unchanged. Export the function.',
        starterCode:
          'export function flattenWithDepth(array, depth) {\n  // TODO: return a new array with nesting flattened up to depth levels.\n  return [];\n}\n',
        tests: [
          {
            label: 'flattens one level at depth 1',
            code: "const got = solution.flattenWithDepth([1, [2, [3]]], 1); if (JSON.stringify(got) !== JSON.stringify([1, 2, [3]])) throw new Error('expected [1, 2, [3]], got ' + JSON.stringify(got));",
          },
          {
            label: 'flattens two levels at depth 2',
            code: "const got = solution.flattenWithDepth([1, [2, [3]]], 2); if (JSON.stringify(got) !== JSON.stringify([1, 2, 3])) throw new Error('expected [1, 2, 3], got ' + JSON.stringify(got));",
          },
          {
            label: 'depth 0 returns a shallow copy',
            code: "const input = [1, [2]]; const got = solution.flattenWithDepth(input, 0); if (got === input) throw new Error('must return a new array'); if (JSON.stringify(got) !== JSON.stringify(input)) throw new Error('copy must keep the same contents');",
          },
          {
            label: 'leaves non-array values alone',
            code: "const got = solution.flattenWithDepth([1, 'a', null, [2]], 1); if (JSON.stringify(got) !== JSON.stringify([1, 'a', null, 2])) throw new Error('expected [1, \"a\", null, 2], got ' + JSON.stringify(got));",
          },
        ],
        followUps: [
          'What would change if depth were Infinity?',
          'How would you flatten without recursion?',
        ],
      },
      {
        kind: 'coding',
        id: 'memoize-ttl',
        title: 'Memoize with TTL',
        prompt:
          'Implement memoizeWithTTL(fn, ttlMs). It returns a memoized function: repeated calls with the same arguments reuse the cached result while the entry is fresh (younger than ttlMs). A ttlMs of 0 or less means no caching at all. The returned function also has a .clear() method that empties the cache. Cache keys come from the arguments. Export the function.',
        starterCode:
          'export function memoizeWithTTL(fn, ttlMs) {\n  // TODO: return a memoized function with a .clear() method.\n  return (...args) => fn(...args);\n}\n',
        tests: [
          {
            label: 'repeats with the same arguments hit the cache',
            code: "let calls = 0; const fn = (x) => { calls++; return x * 2; }; const m = solution.memoizeWithTTL(fn, 1000); m(5); m(5); if (calls !== 1) throw new Error('expected 1 call, got ' + calls);",
          },
          {
            label: 'different arguments recompute',
            code: "let calls = 0; const fn = (x) => { calls++; return x * 2; }; const m = solution.memoizeWithTTL(fn, 1000); m(5); m(6); if (calls !== 2) throw new Error('expected 2 calls, got ' + calls);",
          },
          {
            label: 'ttlMs of 0 never caches',
            code: "let calls = 0; const fn = (x) => { calls++; return x; }; const m = solution.memoizeWithTTL(fn, 0); m(5); m(5); if (calls !== 2) throw new Error('expected 2 calls, got ' + calls);",
          },
          {
            label: 'clear() empties the cache',
            code: "let calls = 0; const fn = (x) => { calls++; return x; }; const m = solution.memoizeWithTTL(fn, 1000); m(5); m.clear(); m(5); if (calls !== 2) throw new Error('expected 2 calls, got ' + calls);",
          },
        ],
        followUps: [
          'What breaks if an argument is an object?',
          'How would you bound the cache size?',
        ],
      },
      {
        kind: 'spoken',
        id: 'closures-bug',
        title: 'Closures and a bug they caused',
        question:
          'Explain what a closure is, then describe a real bug closures caused (or could cause) in a loop or an async callback, and how you fixed it.',
        followUps: [
          'How would you fix the loop bug without changing the loop structure?',
          'Where can closures hurt memory?',
        ],
        guidance:
          'A strong answer: defines the mechanism (function plus captured environment), names a concrete symptom (stale loop variable, stale state in an effect), and gives the fix plus why it works.',
      },
      {
        kind: 'spoken',
        id: 'slow-page',
        title: 'Debugging a slow page',
        question:
          'A page gets slower the longer the user scrolls. Walk through how you find the cause.',
        followUps: [
          'What would you measure first, and with what tool?',
          'How do you tell a rendering problem from a data problem?',
        ],
        guidance:
          'A strong answer: starts from measurement (not guesses), separates render cost, listener leaks, and unbounded list growth, and names the fix for the cause found.',
      },
    ],
  },
  {
    id: 'react-essentials',
    title: 'React essentials',
    description: 'State, events, and rendering decisions, answered the way a real round asks them.',
    defaultDurationMinutes: 30,
    questions: [
      {
        kind: 'coding',
        id: 'tiny-store',
        title: 'Tiny store with subscribe',
        prompt:
          'Implement createStore(initialState). It returns an object with getState(), setState(patch), and subscribe(listener). getState returns the current state. setState merges the patch into the state (shallow merge) and notifies all listeners. subscribe registers a listener and returns an unsubscribe function. Export the function.',
        starterCode:
          'export function createStore(initialState) {\n  // TODO: return { getState, setState, subscribe }.\n  return { getState: () => initialState, setState: () => {}, subscribe: () => () => {} };\n}\n',
        tests: [
          {
            label: 'getState returns the initial state',
            code: "const store = solution.createStore({ a: 1 }); if (JSON.stringify(store.getState()) !== JSON.stringify({ a: 1 })) throw new Error('expected { a: 1 }');",
          },
          {
            label: 'setState merges and updates getState',
            code: "const store = solution.createStore({ a: 1 }); store.setState({ b: 2 }); if (JSON.stringify(store.getState()) !== JSON.stringify({ a: 1, b: 2 })) throw new Error('expected { a: 1, b: 2 }');",
          },
          {
            label: 'subscribers are notified on setState',
            code: "const store = solution.createStore({ a: 1 }); let calls = 0; store.subscribe(() => { calls++; }); store.setState({ a: 2 }); if (calls !== 1) throw new Error('expected 1 notification, got ' + calls);",
          },
          {
            label: 'unsubscribe stops notifications',
            code: "const store = solution.createStore({ a: 1 }); let calls = 0; const off = store.subscribe(() => { calls++; }); off(); store.setState({ a: 2 }); if (calls !== 0) throw new Error('expected 0 notifications, got ' + calls);",
          },
        ],
        followUps: [
          'How would you add a selector so listeners only fire on relevant changes?',
          'Why return a new state object instead of mutating?',
        ],
      },
      {
        kind: 'coding',
        id: 'event-emitter',
        title: 'Event emitter with once',
        prompt:
          'Implement createEmitter(). It returns an object with on(event, listener), off(event, listener), once(event, listener), and emit(event, ...args). on registers a listener, off removes it, once registers a listener that fires exactly once and then removes itself, and emit calls the listeners for that event with the given arguments. Export the function.',
        starterCode:
          'export function createEmitter() {\n  // TODO: return { on, off, once, emit }.\n  return { on: () => {}, off: () => {}, once: () => {}, emit: () => {} };\n}\n',
        tests: [
          {
            label: 'on and emit call the listener with arguments',
            code: "const e = solution.createEmitter(); let seen = null; e.on('data', (v) => { seen = v; }); e.emit('data', 42); if (seen !== 42) throw new Error('expected listener to receive 42');",
          },
          {
            label: 'off removes the listener',
            code: "const e = solution.createEmitter(); let calls = 0; const fn = () => { calls++; }; e.on('tick', fn); e.off('tick', fn); e.emit('tick'); if (calls !== 0) throw new Error('expected 0 calls, got ' + calls);",
          },
          {
            label: 'once fires exactly once',
            code: "const e = solution.createEmitter(); let calls = 0; e.once('go', () => { calls++; }); e.emit('go'); e.emit('go'); if (calls !== 1) throw new Error('expected 1 call, got ' + calls);",
          },
          {
            label: 'listeners for other events are not called',
            code: "const e = solution.createEmitter(); let calls = 0; e.on('a', () => { calls++; }); e.emit('b'); if (calls !== 0) throw new Error('expected 0 calls, got ' + calls);",
          },
        ],
        followUps: [
          'How would you handle a listener that throws during emit?',
          'How would you type this emitter in TypeScript?',
        ],
      },
      {
        kind: 'spoken',
        id: 'rerender',
        title: 'How React decides what to re-render',
        question:
          'How does React decide what to re-render, and what re-renders when a parent\'s state changes?',
        followUps: [
          'What role do keys play in that decision?',
          'When does memo help, and when does it hurt?',
        ],
        guidance:
          'A strong answer: render phase vs commit, props/state/context triggers, reconciliation by element type and key, and memo as a bailout with its own cost.',
      },
      {
        kind: 'spoken',
        id: 'controlled',
        title: 'Controlled vs uncontrolled components',
        question:
          'Controlled vs uncontrolled components: what is the difference, and when would you choose each?',
        followUps: [
          'How do you handle a form with dozens of fields without re-rendering on every keystroke?',
          'What goes wrong mixing controlled and uncontrolled on one input?',
        ],
        guidance:
          'A strong answer: source of truth for the value, the re-render cost of controlled inputs, and a concrete choice with its trade-off.',
      },
    ],
  },
];

export function getMockPack(packId: string): MockPack | undefined {
  return MOCK_PACKS.find((pack) => pack.id === packId);
}

export function getMockPackIds(): string[] {
  return MOCK_PACKS.map((pack) => pack.id);
}
