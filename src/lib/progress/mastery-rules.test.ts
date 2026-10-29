import { describe, expect, it } from 'vitest';
import {
  canAccessTopic,
  getAdjacentFromIndex,
  getTopicProgressPercent,
  getTrackMasteryPercent,
  getUnmetPrerequisites,
  isTopicMastered,
  type TopicIndexEntry,
} from '@/lib/progress/mastery-rules';
import type { TopicProgressMap } from '@/lib/progress/types';

const index: TopicIndexEntry[] = [
  {
    path: 'javascript/foundation/scope',
    permalink: '/learn/javascript/foundation/scope',
    slug: 'scope',
    track: 'javascript',
    subCategory: 'foundation',
    categoryOrder: 2,
    title: 'Scope',
    order: 1,
    status: 'published',
    prerequisites: [],
    masteryCriteria: { minQuestionsCorrect: 1 },
  },
  {
    path: 'javascript/foundation/closures',
    permalink: '/learn/javascript/foundation/closures',
    slug: 'closures',
    track: 'javascript',
    subCategory: 'foundation',
    categoryOrder: 2,
    title: 'Closures',
    order: 2,
    status: 'published',
    prerequisites: ['scope'],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: true },
  },
  {
    path: 'react/components/jsx',
    permalink: '/learn/react/components/jsx',
    slug: 'jsx',
    track: 'react',
    subCategory: 'components',
    categoryOrder: 1,
    title: 'JSX',
    order: 1,
    status: 'preview',
    prerequisites: ['closures'],
    masteryCriteria: { minQuestionsCorrect: 1 },
  },
];

describe('mastery rules', () => {
  it('requires the challenge when the topic says so', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/closures': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
        challengePassed: false,
      },
    };
    expect(isTopicMastered(index, 'javascript/foundation/closures', progress)).toBe(false);
    expect(getTopicProgressPercent(index, 'javascript/foundation/closures', progress)).toBe(50);
  });

  it('blocks a topic until its prerequisite is mastered', () => {
    const progress: TopicProgressMap = {};
    expect(canAccessTopic(index, 'javascript/foundation/closures', progress)).toBe(false);
    expect(getUnmetPrerequisites(index, 'javascript/foundation/closures', progress).map((t) => t.slug)).toEqual([
      'scope',
    ]);
  });

  it('resolves a prerequisite from another track by slug', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/closures': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
        challengePassed: true,
      },
    };
    expect(canAccessTopic(index, 'react/components/jsx', progress)).toBe(true);
  });

  it('ignores preview topics in the track percent', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/scope': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know' },
      },
    };
    expect(getTrackMasteryPercent(index, 'javascript', progress)).toBe(50);
    expect(getTrackMasteryPercent(index, 'react', progress)).toBe(0);
  });

  it('walks published order for previous and next', () => {
    const adjacent = getAdjacentFromIndex(index, 'javascript', 'javascript/foundation/scope');
    expect(adjacent.prev).toBeNull();
    expect(adjacent.next?.slug).toBe('closures');
  });
});

describe('footer navigation follows sidebar order', () => {
  const navIndex: TopicIndexEntry[] = [
    {
      path: 'javascript/foundation/prototypes',
      permalink: '/learn/javascript/foundation/prototypes',
      slug: 'prototypes',
      track: 'javascript',
      title: 'Prototypes',
      subCategory: 'foundation',
      categoryOrder: 2,
      order: 8,
      status: 'published',
      prerequisites: [],
      masteryCriteria: { minQuestionsCorrect: 1 },
    },
    {
      path: 'javascript/execution/event-loop',
      permalink: '/learn/javascript/execution/event-loop',
      slug: 'event-loop',
      track: 'javascript',
      title: 'Event Loop',
      subCategory: 'execution',
      categoryOrder: 3,
      order: 9,
      status: 'published',
      prerequisites: [],
      masteryCriteria: { minQuestionsCorrect: 1 },
    },
    {
      path: 'javascript/execution/promises',
      permalink: '/learn/javascript/execution/promises',
      slug: 'promises',
      track: 'javascript',
      title: 'Promises',
      subCategory: 'execution',
      categoryOrder: 3,
      order: 10,
      status: 'published',
      prerequisites: [],
      masteryCriteria: { minQuestionsCorrect: 1 },
    },
    {
      path: 'javascript/data-types/null-and-undefined',
      permalink: '/learn/javascript/data-types/null-and-undefined',
      slug: 'null-and-undefined',
      track: 'javascript',
      title: 'Null and Undefined',
      subCategory: 'data-types',
      categoryOrder: 1,
      order: 11,
      status: 'published',
      prerequisites: [],
      masteryCriteria: { minQuestionsCorrect: 1 },
    },
    {
      path: 'javascript/execution/callbacks',
      permalink: '/learn/javascript/execution/callbacks',
      slug: 'callbacks',
      track: 'javascript',
      title: 'Callbacks',
      subCategory: 'execution',
      categoryOrder: 3,
      order: 24,
      status: 'published',
      prerequisites: [],
      masteryCriteria: { minQuestionsCorrect: 1 },
    },
  ];

  it('puts Execution topics adjacent in sidebar order, not global order', () => {
    const { prev, next } = getAdjacentFromIndex(navIndex, 'javascript', 'javascript/execution/event-loop');
    expect(prev?.slug).toBe('prototypes');
    expect(next?.slug).toBe('promises');
    const after = getAdjacentFromIndex(navIndex, 'javascript', 'javascript/execution/promises');
    expect(after.next?.slug).toBe('callbacks');
  });
});
