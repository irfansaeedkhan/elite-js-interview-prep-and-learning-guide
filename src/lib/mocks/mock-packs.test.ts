import { describe, expect, it } from 'vitest';
import { MOCK_PACKS, getMockPack } from './mock-packs';
import type { CodingQuestion, HiddenTest, TestResult } from './mock-session';

/**
 * Execute a solution string against a task's hidden tests in this
 * process. The solution's `export function` declarations are stripped
 * to plain declarations and collected into a `solution` namespace,
 * mirroring what the Sandpack runner does with its module import.
 * Test code runs with `solution` in scope and throws on failure.
 */
function runSolutionAgainstTests(solutionCode: string, tests: HiddenTest[]): TestResult[] {
  const names = [...solutionCode.matchAll(/export\s+function\s+(\w+)/g)].map((m) => m[1]);
  const body = tests
    .map(
      (t, i) => `try {
  ${t.code}
  results.push({ index: ${i + 1}, label: ${JSON.stringify(t.label)}, passed: true });
} catch (e) {
  results.push({ index: ${i + 1}, label: ${JSON.stringify(t.label)}, passed: false, message: e.message });
}`,
    )
    .join('\n');
  const script = `${solutionCode.replace(/export\s+/g, '')}\nconst solution = { ${names.join(', ')} };\nconst results = [];\n${body}\nreturn results;`;
  return new Function(script)() as TestResult[];
}

/** Reference solutions: correct implementations of each coding task. */
const REFERENCES: Record<string, string> = {
  'flatten-depth': `export function flattenWithDepth(array, depth) {
  if (depth <= 0) return array.slice();
  const out = [];
  for (const item of array) {
    if (Array.isArray(item)) out.push(...flattenWithDepth(item, depth - 1));
    else out.push(item);
  }
  return out;
}`,
  'memoize-ttl': `export function memoizeWithTTL(fn, ttlMs) {
  const cache = new Map();
  const memoized = (...args) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && ttlMs > 0 && now - hit.at < ttlMs) return hit.value;
    const value = fn(...args);
    if (ttlMs > 0) cache.set(key, { value, at: now });
    return value;
  };
  memoized.clear = () => cache.clear();
  return memoized;
}`,
  'tiny-store': `export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); },
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}`,
  'event-emitter': `export function createEmitter() {
  const listeners = new Map();
  const get = (event) => { if (!listeners.has(event)) listeners.set(event, new Set()); return listeners.get(event); };
  return {
    on: (event, fn) => { get(event).add(fn); },
    off: (event, fn) => { get(event).delete(fn); },
    once: (event, fn) => { const wrapper = (...args) => { get(event).delete(wrapper); fn(...args); }; get(event).add(wrapper); },
    emit: (event, ...args) => { [...get(event)].forEach((fn) => fn(...args)); },
  };
}`,
};

function codingQuestions(): CodingQuestion[] {
  return MOCK_PACKS.flatMap((pack) =>
    pack.questions.filter((q): q is CodingQuestion => q.kind === 'coding'),
  );
}

describe('pack integrity', () => {
  it('has unique pack ids and unique question ids within each pack', () => {
    expect(new Set(MOCK_PACKS.map((p) => p.id)).size).toBe(MOCK_PACKS.length);
    for (const pack of MOCK_PACKS) {
      const ids = pack.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('every coding task has prompt, starter, at least one hidden test, and follow-ups', () => {
    for (const task of codingQuestions()) {
      expect(task.prompt.trim().length).toBeGreaterThan(0);
      expect(task.starterCode.trim().length).toBeGreaterThan(0);
      expect(task.tests.length).toBeGreaterThanOrEqual(1);
      expect(task.followUps.length).toBeGreaterThanOrEqual(1);
      for (const test of task.tests) {
        expect(test.label.trim().length).toBeGreaterThan(0);
        expect(test.code).toContain('solution.');
      }
    }
  });

  it('every spoken question has a question and follow-ups', () => {
    for (const pack of MOCK_PACKS) {
      for (const q of pack.questions.filter((x) => x.kind === 'spoken')) {
        if (q.kind !== 'spoken') continue;
        expect(q.question.trim().length).toBeGreaterThan(0);
        expect(q.followUps.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('getMockPack resolves known packs and undefined otherwise', () => {
    expect(getMockPack('javascript-foundations')?.title).toBe('JavaScript foundations');
    expect(getMockPack('missing')).toBeUndefined();
  });
});

describe('hidden-test discrimination', () => {
  it('every reference solution passes every hidden test', () => {
    for (const task of codingQuestions()) {
      const reference = REFERENCES[task.id];
      expect(reference, `missing reference for ${task.id}`).toBeTruthy();
      const results = runSolutionAgainstTests(reference, task.tests);
      expect(results).toHaveLength(task.tests.length);
      const failed = results.filter((r) => !r.passed);
      expect(failed).toEqual([]);
    }
  });

  it('every starter fails at least one hidden test (starters are incomplete)', () => {
    for (const task of codingQuestions()) {
      const results = runSolutionAgainstTests(task.starterCode, task.tests);
      expect(
        results.some((r) => !r.passed),
        `${task.id} starter passes all hidden tests, so the tests do not discriminate`,
      ).toBe(true);
    }
  });
});
