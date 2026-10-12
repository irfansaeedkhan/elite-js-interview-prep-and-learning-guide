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
