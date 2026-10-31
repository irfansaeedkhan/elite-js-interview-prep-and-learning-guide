/**
 * Timed mock sessions: pure model (spec 0003).
 *
 * Everything in this module is a pure function over plain data so it
 * is unit-testable without a database or a browser. No component and
 * no route may compute scores, deadlines, or timeout outcomes on its
 * own: they call into here. The server remains authoritative for
 * timeout (see mock-service), but the rules are defined once, here.
 */

export type MockStatus = 'in_progress' | 'submitted' | 'timed_out';

export type RubricDimension =
  | 'correctness'
  | 'completeness'
  | 'depth'
  | 'trade-offs'
  | 'communication';

export const RUBRIC_DIMENSIONS: Array<{
  id: RubricDimension;
  label: string;
  guidance: string;
}> = [
  { id: 'correctness', label: 'Correctness', guidance: 'The answer works / is factually right.' },
  { id: 'completeness', label: 'Completeness', guidance: 'Edge cases and the whole question are covered.' },
  { id: 'depth', label: 'Depth', guidance: 'Mechanism and reasoning, not just the surface answer.' },
  { id: 'trade-offs', label: 'Trade-offs', guidance: 'Alternatives and their costs are named.' },
  { id: 'communication', label: 'Communication', guidance: 'Structured, clear, easy to follow.' },
];

export type RubricScore = 0 | 1 | 2;
export type RubricScores = Partial<Record<RubricDimension, RubricScore>>;

export interface HiddenTest {
  label: string;
  /** Runs with `solution` in scope: the module namespace of the learner's code. */
  code: string;
}

export interface CodingQuestion {
  kind: 'coding';
  id: string;
  title: string;
  prompt: string;
  /** Module-style starter: it must export the functions the tests import. */
  starterCode: string;
  tests: HiddenTest[];
  followUps: string[];
}

export interface SpokenQuestion {
  kind: 'spoken';
  id: string;
  title: string;
  question: string;
  followUps: string[];
  /** What a strong answer covers; shown to the learner, not a grade. */
  guidance: string;
}

export type MockQuestion = CodingQuestion | SpokenQuestion;

export interface MockPack {
  id: string;
  title: string;
  description: string;
  defaultDurationMinutes: number;
  questions: MockQuestion[];
}

export interface RecordingMeta {
  durationSeconds: number;
  recordedAt: string;
  consentAt: string;
}

export interface TestResult {
  index: number;
  label: string;
  passed: boolean;
  message?: string;
}

export interface MockAnswer {
  code?: string;
  text?: string;
  recording?: RecordingMeta;
  rubric?: RubricScores;
  note?: string;
  tests?: TestResult[];
  testsRunAt?: string;
}

export type MockAnswers = Record<string, MockAnswer>;

export const ALLOWED_DURATIONS_MINUTES = [15, 30, 45] as const;

/** Validate a mock start request. Returns an error message or null. */
export function validateStart(
  packId: string,
  durationMinutes: number,
  knownPackIds: string[],
): string | null {
  if (!packId.trim()) return 'A question pack is required.';
  if (!knownPackIds.includes(packId)) return 'Unknown question pack.';
  if (!ALLOWED_DURATIONS_MINUTES.includes(durationMinutes as (typeof ALLOWED_DURATIONS_MINUTES)[number])) {
    return 'Duration must be 15, 30, or 45 minutes.';
  }
  return null;
}

export function isTerminalStatus(status: MockStatus): boolean {
  return status === 'submitted' || status === 'timed_out';
}

/** Milliseconds left until the deadline, floored at 0. */
export function remainingMs(deadlineAt: Date | string, now: Date): number {
  const deadline = typeof deadlineAt === 'string' ? new Date(deadlineAt) : deadlineAt;
  return Math.max(0, deadline.getTime() - now.getTime());
}

export function isExpired(deadlineAt: Date | string, now: Date): boolean {
  return remainingMs(deadlineAt, now) === 0;
}

/** MM:SS, zero-padded, from a millisecond duration. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parse Sandpack console lines into per-test results. Lines that do
 * not match the shared ✓/✗ format are ignored (bundler noise, the
 * learner's own logs). Results are returned in test order.
 */
export function parseTestLogs(logs: Array<{ data: string } | string>): TestResult[] {
  const results: TestResult[] = [];
  for (const entry of logs) {
    const line = typeof entry === 'string' ? entry : entry.data;
    const pass = line.match(/^✓ Test (\d+): (.+)$/);
    if (pass) {
      results.push({ index: Number(pass[1]), label: pass[2], passed: true });
      continue;
    }
    const fail = line.match(/^✗ Test (\d+): (.+?) — (.+)$/);
    if (fail) {
      results.push({ index: Number(fail[1]), label: fail[2], passed: false, message: fail[3] });
    }
  }
  results.sort((a, b) => a.index - b.index);
  return results;
}

export function gradeCodingAnswer(results: TestResult[]): {
  passed: number;
  total: number;
  failedLabels: string[];
} {
  return {
    passed: results.filter((r) => r.passed).length,
    total: results.length,
    failedLabels: results.filter((r) => !r.passed).map((r) => r.label),
  };
}

export type RubricBand = 'Not scored' | 'Needs work' | 'Solid' | 'Strong';

/**
 * Score the rubric over saved answers. Only questions that carry at
 * least one rubric score count toward that dimension's maximum, and
 * only toward the overall maximum. Unanswered and unscored questions
 * lower nothing; they are listed in review, not punished.
 */
export function scoreRubric(
  answers: MockAnswers,
  questions: MockQuestion[],
): {
  perDimension: Record<RubricDimension, { scored: number; max: number }>;
  total: number;
  max: number;
  average: number;
  band: RubricBand;
} {
  const perDimension = Object.fromEntries(
    RUBRIC_DIMENSIONS.map((d) => [d.id, { scored: 0, max: 0 }]),
  ) as Record<RubricDimension, { scored: number; max: number }>;

  for (const question of questions) {
    const rubric = answers[question.id]?.rubric;
    if (!rubric) continue;
    for (const dimension of RUBRIC_DIMENSIONS) {
      const value = rubric[dimension.id];
      if (value === undefined) continue;
      perDimension[dimension.id].scored += value;
      perDimension[dimension.id].max += 2;
    }
  }

  const total = RUBRIC_DIMENSIONS.reduce((sum, d) => sum + perDimension[d.id].scored, 0);
  const max = RUBRIC_DIMENSIONS.reduce((sum, d) => sum + perDimension[d.id].max, 0);
  const average = max === 0 ? 0 : total / (max / 2);
  const band: RubricBand =
    max === 0 ? 'Not scored' : average < 0.8 ? 'Needs work' : average < 1.5 ? 'Solid' : 'Strong';
  return { perDimension, total, max, average, band };
}

/**
 * Build the hidden test-runner file (/index.js) for a coding task.
 * The learner's file (/solution.js) is never shown this content: the
 * editor shows only solution.js. Labels are escaped the same way the
 * topic challenge harness escapes them.
 */
export function buildHiddenRunner(tests: HiddenTest[]): string {
  const testBlock = tests
    .map(
      (t, i) => `try {
  ${t.code}
  console.log('✓ Test ${i + 1}: ${t.label.replace(/'/g, "\\'")}');
} catch (e) {
  console.error('✗ Test ${i + 1}: ${t.label.replace(/'/g, "\\'")} —', e.message);
}`,
    )
    .join('\n\n');
  return `import * as solution from './solution.js';\n\n${testBlock}\n`;
}

/** The consent gate: recording may start only with explicit consent. */
export function canStartRecording(consent: boolean): boolean {
  return consent === true;
}

/** Validate one saved answer. Returns an error message or null. */
export function validateAnswer(question: MockQuestion, answer: MockAnswer): string | null {
  if (question.kind === 'coding') {
    if (!answer.code?.trim()) return 'Code is required for a coding answer.';
  } else {
    if (!answer.text?.trim() && !answer.recording) {
      return 'A spoken answer needs typed text, a recording, or both.';
    }
  }
  if (answer.rubric) {
    for (const dimension of RUBRIC_DIMENSIONS) {
      const value = answer.rubric[dimension.id];
      if (value !== undefined && value !== 0 && value !== 1 && value !== 2) {
        return `Rubric score for ${dimension.label} must be 0, 1, or 2.`;
      }
    }
  }
  if (answer.tests) {
    if (question.kind !== 'coding') return 'Test results belong to coding answers only.';
    for (const result of answer.tests) {
      if (result.index < 1 || result.index > question.tests.length) {
        return 'Test result index is out of range for this task.';
      }
    }
  }
  return null;
}
