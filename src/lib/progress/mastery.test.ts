import { describe, expect, it } from 'vitest';
import {
  canAccessTopic,
  countKnowAnswers,
  getTopicProgressPercent,
  getTrackMasteryPercent,
  isTopicMastered,
  resolvePrerequisiteTopic,
} from '@/lib/progress/mastery';
import type { TopicProgressMap } from '@/lib/progress/types';

describe('countKnowAnswers', () => {
  it('counts know results only', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/hoisting': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'review', q3: 'know' },
      },
    };
    expect(countKnowAnswers('javascript/foundation/hoisting', progress)).toBe(2);
  });
});

describe('isTopicMastered', () => {
  it('returns true when enough know answers and no challenge required', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/hoisting': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
      },
    };
    expect(isTopicMastered('javascript/foundation/hoisting', progress)).toBe(true);
  });

  it('returns false when challenge required but not passed', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/closures': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
        challengePassed: false,
      },
    };
    expect(isTopicMastered('javascript/foundation/closures', progress)).toBe(false);
  });

  it('returns true when challenge passed and QA met', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/closures': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
        challengePassed: true,
      },
    };
    expect(isTopicMastered('javascript/foundation/closures', progress)).toBe(true);
  });
});

describe('canAccessTopic', () => {
  it('allows topics with no prerequisites', () => {
    expect(canAccessTopic('javascript/foundation/hoisting', {})).toBe(true);
  });

  it('blocks when prerequisites are not mastered', () => {
    expect(canAccessTopic('javascript/foundation/closures', {})).toBe(false);
  });

  it('allows when prerequisites are mastered', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/hoisting': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
      },
    };
    expect(canAccessTopic('javascript/foundation/closures', progress)).toBe(true);
  });
});

describe('resolvePrerequisiteTopic', () => {
  it('resolves same track slug', () => {
    const topic = resolvePrerequisiteTopic('javascript', 'hoisting');
    expect(topic?.path).toBe('javascript/foundation/hoisting');
  });

  it('resolves cross track slug for React prerequisites', () => {
    const topic = resolvePrerequisiteTopic('react', 'closures');
    expect(topic?.path).toBe('javascript/foundation/closures');
  });
});

describe('getTopicProgressPercent', () => {
  it('returns partial percent when QA incomplete', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/hoisting': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know' },
      },
    };
    expect(getTopicProgressPercent('javascript/foundation/hoisting', progress)).toBe(75);
  });
});

describe('getTrackMasteryPercent', () => {
  it('returns 0 when no topics mastered', () => {
    expect(getTrackMasteryPercent('javascript', {})).toBe(0);
  });

  it('returns 50 when half of published JS topics mastered', () => {
    const progress: TopicProgressMap = {
      'javascript/foundation/hoisting': {
        visitedAt: '2026-01-01',
        qaResults: { q1: 'know', q2: 'know' },
      },
    };
    expect(getTrackMasteryPercent('javascript', progress)).toBe(50);
  });
});
