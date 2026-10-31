import { describe, expect, it } from 'vitest';
import {
  buildHiddenRunner,
  canStartRecording,
  formatCountdown,
  gradeCodingAnswer,
  isExpired,
  isTerminalStatus,
  parseTestLogs,
  remainingMs,
  scoreRubric,
  validateAnswer,
  validateStart,
  type MockAnswers,
  type MockQuestion,
} from './mock-session';

describe('validateStart', () => {
  it('accepts a known pack and an allowed duration', () => {
    expect(validateStart('javascript-foundations', 30, ['javascript-foundations'])).toBeNull();
  });

  it('rejects an unknown pack', () => {
    expect(validateStart('nope', 30, ['javascript-foundations'])).toBe('Unknown question pack.');
  });

  it('rejects a duration outside 15/30/45', () => {
    expect(validateStart('javascript-foundations', 20, ['javascript-foundations'])).toBe(
      'Duration must be 15, 30, or 45 minutes.',
    );
  });

  it('rejects an empty pack id', () => {
    expect(validateStart('  ', 30, ['javascript-foundations'])).toBe('A question pack is required.');
  });
});

describe('timer', () => {
  const deadline = new Date('2026-10-29T10:30:00.000Z');

  it('reports remaining time until the deadline', () => {
    expect(remainingMs(deadline, new Date('2026-10-29T10:00:00.000Z'))).toBe(30 * 60 * 1000);
  });

  it('floors at zero once the deadline has passed', () => {
    expect(remainingMs(deadline, new Date('2026-10-29T11:00:00.000Z'))).toBe(0);
  });

  it('is expired exactly at the deadline (boundary)', () => {
    expect(isExpired(deadline, new Date('2026-10-29T10:30:00.000Z'))).toBe(true);
    expect(isExpired(deadline, new Date('2026-10-29T10:29:59.999Z'))).toBe(false);
  });

  it('formats MM:SS zero-padded', () => {
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(5_000)).toBe('00:05');
    expect(formatCountdown(90_000)).toBe('01:30');
    expect(formatCountdown(45 * 60 * 1000)).toBe('45:00');
    expect(formatCountdown(-1_000)).toBe('00:00');
  });
});

describe('isTerminalStatus', () => {
  it('treats submitted and timed_out as terminal only', () => {
    expect(isTerminalStatus('in_progress')).toBe(false);
    expect(isTerminalStatus('submitted')).toBe(true);
    expect(isTerminalStatus('timed_out')).toBe(true);
  });
});

describe('parseTestLogs', () => {
  it('parses pass and fail lines and ignores noise', () => {
    const logs = [
      'bundler started',
      '✓ Test 1: flattens one level at depth 1',
      '✗ Test 2: flattens two levels at depth 2 — expected [1, 2, 3], got [1, 2, [3]]',
      'console.log from the learner',
    ];
    expect(parseTestLogs(logs)).toEqual([
      { index: 1, label: 'flattens one level at depth 1', passed: true },
      {
        index: 2,
        label: 'flattens two levels at depth 2',
        passed: false,
        message: 'expected [1, 2, 3], got [1, 2, [3]]',
      },
    ]);
  });

  it('sorts out-of-order lines by test index', () => {
    expect(
      parseTestLogs(['✓ Test 2: second', '✓ Test 1: first']).map((r) => r.index),
    ).toEqual([1, 2]);
  });

  it('ignores malformed test lines', () => {
    expect(parseTestLogs(['✓ Test: no number', '✗ Test 3 no dash'])).toEqual([]);
  });
});

describe('gradeCodingAnswer', () => {
  it('counts passes and names failures', () => {
    expect(
      gradeCodingAnswer([
        { index: 1, label: 'a', passed: true },
        { index: 2, label: 'b', passed: false },
        { index: 3, label: 'c', passed: false },
      ]),
    ).toEqual({ passed: 1, total: 3, failedLabels: ['b', 'c'] });
  });
});

describe('scoreRubric', () => {
  const questions: MockQuestion[] = [
    { kind: 'spoken', id: 'q1', title: 'Q1', question: 'Q1?', followUps: [], guidance: '' },
    { kind: 'spoken', id: 'q2', title: 'Q2', question: 'Q2?', followUps: [], guidance: '' },
    { kind: 'spoken', id: 'q3', title: 'Q3', question: 'Q3?', followUps: [], guidance: '' },
    { kind: 'spoken', id: 'q4', title: 'Q4', question: 'Q4?', followUps: [], guidance: '' },
  ];

  it('matches the spec worked example: 22/30, Solid', () => {
    const answers: MockAnswers = {
      q1: { rubric: { correctness: 2, completeness: 2, depth: 1, 'trade-offs': 1, communication: 2 } },
      q2: { rubric: { correctness: 1, completeness: 1, depth: 1, 'trade-offs': 0, communication: 1 } },
      q3: { rubric: { correctness: 2, completeness: 2, depth: 2, 'trade-offs': 2, communication: 2 } },
    };
    const summary = scoreRubric(answers, questions);
    expect(summary.total).toBe(22);
    expect(summary.max).toBe(30);
    expect(summary.perDimension.correctness).toEqual({ scored: 5, max: 6 });
    expect(summary.perDimension['trade-offs']).toEqual({ scored: 3, max: 6 });
    expect(summary.band).toBe('Solid');
  });

  it('ignores unanswered questions entirely', () => {
    const summary = scoreRubric({}, questions);
    expect(summary).toMatchObject({ total: 0, max: 0, band: 'Not scored' });
  });

  it('counts max only for dimensions actually scored', () => {
    const summary = scoreRubric({ q1: { rubric: { correctness: 2 } } }, questions);
    expect(summary.perDimension.correctness).toEqual({ scored: 2, max: 2 });
    expect(summary.perDimension.depth).toEqual({ scored: 0, max: 0 });
    expect(summary.max).toBe(2);
  });

  it('bands at the documented boundaries', () => {
    const low = scoreRubric(
      { q1: { rubric: { correctness: 0, completeness: 0, depth: 1, 'trade-offs': 0, communication: 0 } } },
      questions,
    );
    expect(low.band).toBe('Needs work');
    const high = scoreRubric(
      { q1: { rubric: { correctness: 2, completeness: 2, depth: 2, 'trade-offs': 2, communication: 2 } } },
      questions,
    );
    expect(high.band).toBe('Strong');
  });
});

describe('buildHiddenRunner', () => {
  it('imports the solution and wraps each test with its label', () => {
    const runner = buildHiddenRunner([
      { label: "it's a test", code: 'solution.f();' },
      { label: 'second', code: 'solution.g();' },
    ]);
    expect(runner).toContain("import * as solution from './solution.js';");
    expect(runner).toContain('✓ Test 1:');
    expect(runner).toContain("it\\'s a test");
    expect(runner).toContain('solution.f();');
    expect(runner).toContain('solution.g();');
  });
});

describe('canStartRecording', () => {
  it('requires explicit consent', () => {
    expect(canStartRecording(true)).toBe(true);
    expect(canStartRecording(false)).toBe(false);
  });
});

describe('validateAnswer', () => {
  const coding: MockQuestion = {
    kind: 'coding',
    id: 'c1',
    title: 'C1',
    prompt: 'P',
    starterCode: '',
    tests: [{ label: 't1', code: '' }],
    followUps: [],
  };
  const spoken: MockQuestion = {
    kind: 'spoken',
    id: 's1',
    title: 'S1',
    question: 'Q?',
    followUps: [],
    guidance: '',
  };

  it('requires code for coding answers', () => {
    expect(validateAnswer(coding, {})).toBe('Code is required for a coding answer.');
    expect(validateAnswer(coding, { code: '  ' })).toBe('Code is required for a coding answer.');
    expect(validateAnswer(coding, { code: 'export function f() {}' })).toBeNull();
  });

  it('requires text or a recording for spoken answers', () => {
    expect(validateAnswer(spoken, {})).toBe('A spoken answer needs typed text, a recording, or both.');
    expect(validateAnswer(spoken, { text: 'an answer' })).toBeNull();
    expect(
      validateAnswer(spoken, {
        recording: { durationSeconds: 12, recordedAt: '2026-10-29T00:00:00Z', consentAt: '2026-10-29T00:00:00Z' },
      }),
    ).toBeNull();
  });

  it('rejects rubric scores outside 0/1/2', () => {
    expect(
      validateAnswer(spoken, { text: 'x', rubric: { correctness: 3 as never } }),
    ).toBe('Rubric score for Correctness must be 0, 1, or 2.');
  });

  it('rejects test results on spoken answers and out-of-range indices', () => {
    expect(validateAnswer(spoken, { text: 'x', tests: [] })).toBe(
      'Test results belong to coding answers only.',
    );
    expect(
      validateAnswer(coding, { code: 'x', tests: [{ index: 2, label: 't2', passed: true }] }),
    ).toBe('Test result index is out of range for this task.');
  });
});
