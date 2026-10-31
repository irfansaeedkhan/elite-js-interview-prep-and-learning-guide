import { describe, expect, it } from 'vitest';
import {
  getReadinessBand,
  getReadinessReport,
  getReadinessSummary,
  getStudyNext,
  getWeakestTopics,
} from '@/lib/progress/readiness';
import type { TopicIndexEntry } from '@/lib/progress/mastery-rules';
import type { TopicProgressMap } from '@/lib/progress/types';

function entry(overrides: Partial<TopicIndexEntry> & { path: string }): TopicIndexEntry {
  return {
    permalink: `/learn/${overrides.path}`,
    slug: overrides.path.split('/').pop() ?? overrides.path,
    track: 'javascript',
    subCategory: '',
    categoryOrder: 999,
    title: overrides.path,
    order: 1,
    status: 'published',
    prerequisites: [],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: false },
    ...overrides,
  };
}

// A: no prereqs. B: needs A + challenge. C: needs B + challenge.
// D: react, needs B. E: no prereqs. P: preview, must be excluded.
const index: TopicIndexEntry[] = [
  entry({ path: 'javascript/a', slug: 'a', title: 'A', order: 1 }),
  entry({
    path: 'javascript/b',
    slug: 'b',
    title: 'B',
    order: 2,
    prerequisites: ['a'],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: true },
  }),
  entry({
    path: 'javascript/c',
    slug: 'c',
    title: 'C',
    order: 3,
    prerequisites: ['b'],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: true },
  }),
  entry({
    path: 'react/d',
    slug: 'd',
    title: 'D',
    track: 'react',
    order: 1,
    prerequisites: ['b'],
    masteryCriteria: { minQuestionsCorrect: 1, requireChallenge: false },
  }),
  entry({ path: 'javascript/e', slug: 'e', title: 'E', order: 5 }),
  entry({
    path: 'javascript/f',
    slug: 'f',
    title: 'F',
    order: 6,
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: true },
  }),
  entry({ path: 'javascript/p', slug: 'p', title: 'P', order: 7, status: 'preview' }),
];

function progressFor(pairs: Array<[string, Partial<TopicProgressMap[string]>]>): TopicProgressMap {
  const map: TopicProgressMap = {};
  for (const [path, partial] of pairs) {
    map[path] = { visitedAt: '2026-10-28T00:00:00.000Z', ...partial };
  }
  return map;
}

describe('readiness model (spec 0002 worked example)', () => {
  const worked = progressFor([
    ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
    ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'review' } }],
  ]);

  it('weakest is only the attempted, unmastered, accessible topic', () => {
    const weakest = getWeakestTopics(index, worked);
    expect(weakest.map((row) => row.path)).toEqual(['javascript/b']);
    expect(weakest[0].percent).toBe(25);
    expect(weakest[0].reviewCount).toBe(1);
  });

  it('readiness is the mean over published topics, preview excluded', () => {
    const { readiness, readinessBand, perTrack } = getReadinessSummary(index, worked);
    // A 100, B 25, C 0 (locked), D 0 (locked), E 0, F 0 (unvisited): mean 21.
    expect(readiness).toBe(21);
    expect(readinessBand).toBe('Early coverage');
    expect(perTrack).toEqual([
      { track: 'javascript', readiness: 25, mastered: 1, total: 5 },
      { track: 'react', readiness: 0, mastered: 0, total: 1 },
    ]);
  });

  it('study next is the weak topic with a factual reason', () => {
    const next = getStudyNext(index, worked);
    expect(next?.path).toBe('javascript/b');
    expect(next?.reason).toBe('Lowest mastery at 25% · 1 marked for review');
  });

  it('mastering B moves study next to C and empties weakest', () => {
    const after = progressFor([
      ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'know' }, challengePassed: true }],
    ]);
    expect(getWeakestTopics(index, after)).toEqual([]);
    const next = getStudyNext(index, after);
    expect(next?.path).toBe('javascript/c');
    expect(next?.reason).toBe('Not started yet — prerequisites met');
    expect(getReadinessSummary(index, after).readiness).toBe(33);
  });
});

describe('readiness edges', () => {
  it('empty progress: readiness 0, weakest empty, study next is the first open topic', () => {
    const report = getReadinessReport(index, {});
    expect(report.readiness).toBe(0);
    expect(report.weakest).toEqual([]);
    expect(report.studyNext?.path).toBe('javascript/a');
  });

  it('unattempted topics contribute 0, never the primitive 50% floor', () => {
    // Without the attempted gate, A and D (no challenge required) would
    // each score 50% from the shared primitive and inflate readiness.
    expect(getReadinessSummary(index, {}).readiness).toBe(0);
  });

  it('all mastered: readiness 100, weakest empty, study next null', () => {
    const all = progressFor([
      ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'know' }, challengePassed: true }],
      ['javascript/c', { qaResults: { 'c-1': 'know', 'c-2': 'know' }, challengePassed: true }],
      ['react/d', { qaResults: { 'd-1': 'know' } }],
      ['javascript/e', { qaResults: { 'e-1': 'know', 'e-2': 'know' } }],
      ['javascript/f', { qaResults: { 'f-1': 'know', 'f-2': 'know' }, challengePassed: true }],
    ]);
    const report = getReadinessReport(index, all);
    expect(report.readiness).toBe(100);
    expect(report.readinessBand).toBe('Near-complete coverage');
    expect(report.weakest).toEqual([]);
    expect(report.studyNext).toBeNull();
  });

  it('weakest orders by percent, then review marks, and is never padded', () => {
    const progress = progressFor([
      ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
      // B: 25% (1 know, 1 review, challenge missing). E: 75% (1 of 2 know).
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'review' } }],
      ['javascript/e', { qaResults: { 'e-1': 'know' } }],
    ]);
    const weakest = getWeakestTopics(index, progress);
    expect(weakest.map((row) => row.path)).toEqual(['javascript/b', 'javascript/e']);
    expect(weakest).toHaveLength(2);
  });

  it('review marks break percent ties in weakest order', () => {
    // B and F both sit at 25% (1 know of 2, challenge missing). B has a
    // review mark, F has none, so B ranks first despite the tie.
    const progress = progressFor([
      ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'review' } }],
      ['javascript/f', { qaResults: { 'f-1': 'know' } }],
    ]);
    const weakest = getWeakestTopics(index, progress);
    expect(weakest.map((row) => row.path)).toEqual(['javascript/b', 'javascript/f']);
    expect(weakest[0].percent).toBe(25);
    expect(weakest[1].percent).toBe(25);
    expect(weakest[0].reviewCount).toBe(1);
    expect(weakest[1].reviewCount).toBe(0);
  });

  it('locked topics never appear in weakest or study next', () => {
    const progress = progressFor([
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'review' } }],
    ]);
    // B is attempted but its own prerequisite A is unmastered, so B is
    // locked and must NOT be recommended; A is the open topic.
    expect(getWeakestTopics(index, progress)).toEqual([]);
    expect(getStudyNext(index, progress)?.path).toBe('javascript/a');
  });

  it('stale progress paths are ignored', () => {
    const progress = progressFor([['nonexistent/path', { qaResults: { 'x-1': 'know' } }]]);
    expect(getReadinessSummary(index, progress).readiness).toBe(0);
    expect(getStudyNext(index, progress)?.path).toBe('javascript/a');
  });

  it('attempted topics rank before unvisited ones for study next', () => {
    const progress = progressFor([
      ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'know' }, challengePassed: true }],
      // E attempted at 75%; C unvisited but accessible. Attempted wins.
      ['javascript/e', { qaResults: { 'e-1': 'know' } }],
    ]);
    expect(getStudyNext(index, progress)?.path).toBe('javascript/e');
  });

  it('bands split at 40, 70, 90', () => {
    expect(getReadinessBand(0)).toBe('Early coverage');
    expect(getReadinessBand(39)).toBe('Early coverage');
    expect(getReadinessBand(40)).toBe('Growing coverage');
    expect(getReadinessBand(69)).toBe('Growing coverage');
    expect(getReadinessBand(70)).toBe('Strong coverage');
    expect(getReadinessBand(89)).toBe('Strong coverage');
    expect(getReadinessBand(90)).toBe('Near-complete coverage');
    expect(getReadinessBand(100)).toBe('Near-complete coverage');
  });

  it('weakest honors the limit', () => {
    const progress = progressFor([
      ['javascript/a', { qaResults: { 'a-1': 'know', 'a-2': 'know' } }],
      ['javascript/b', { qaResults: { 'b-1': 'know', 'b-2': 'review' } }],
      ['javascript/e', { qaResults: { 'e-1': 'know' } }],
    ]);
    expect(getWeakestTopics(index, progress, 1)).toHaveLength(1);
    expect(getWeakestTopics(index, progress, 1)[0].path).toBe('javascript/b');
  });
});
