import { describe, expect, it } from 'vitest';
import { BADGES, evaluateBadges, type AchievementInput } from './achievements';

const ZERO: AchievementInput = {
  visitedTopicCount: 0,
  knownAnswerCount: 0,
  passedChallengeCount: 0,
  attemptCount: 0,
  longestStreak: 0,
  masteredTopicCount: 0,
  points: 0,
  goalWeeks: 0,
};

function earnedIds(input: AchievementInput): Set<string> {
  return new Set(evaluateBadges(input).filter((badge) => badge.earned).map((badge) => badge.id));
}

describe('BADGES', () => {
  it('defines 16 badges with unique ids', () => {
    expect(BADGES).toHaveLength(16);
    expect(new Set(BADGES.map((badge) => badge.id)).size).toBe(16);
  });
});

describe('evaluateBadges thresholds', () => {
  const cases: Array<{
    badgeId: string;
    field: keyof AchievementInput;
    below: number;
    at: number;
  }> = [
    { badgeId: 'first-visit', field: 'visitedTopicCount', below: 0, at: 1 },
    { badgeId: 'first-answer', field: 'knownAnswerCount', below: 0, at: 1 },
    { badgeId: 'first-challenge', field: 'passedChallengeCount', below: 0, at: 1 },
    { badgeId: 'first-attempt', field: 'attemptCount', below: 0, at: 1 },
    { badgeId: 'streak-7', field: 'longestStreak', below: 6, at: 7 },
    { badgeId: 'streak-30', field: 'longestStreak', below: 29, at: 30 },
    { badgeId: 'streak-100', field: 'longestStreak', below: 99, at: 100 },
    { badgeId: 'mastered-5', field: 'masteredTopicCount', below: 4, at: 5 },
    { badgeId: 'mastered-10', field: 'masteredTopicCount', below: 9, at: 10 },
    { badgeId: 'mastered-25', field: 'masteredTopicCount', below: 24, at: 25 },
    { badgeId: 'attempts-50', field: 'attemptCount', below: 49, at: 50 },
    { badgeId: 'attempts-100', field: 'attemptCount', below: 99, at: 100 },
    { badgeId: 'attempts-500', field: 'attemptCount', below: 499, at: 500 },
    { badgeId: 'points-100', field: 'points', below: 99, at: 100 },
    { badgeId: 'points-500', field: 'points', below: 499, at: 500 },
    { badgeId: 'steady-weeks-4', field: 'goalWeeks', below: 3, at: 4 },
  ];

  it.each(cases)('$badgeId is not earned below its threshold', ({ badgeId, field, below }) => {
    expect(earnedIds({ ...ZERO, [field]: below }).has(badgeId)).toBe(false);
  });

  it.each(cases)('$badgeId is earned exactly at its threshold', ({ badgeId, field, at }) => {
    expect(earnedIds({ ...ZERO, [field]: at }).has(badgeId)).toBe(true);
  });

  it('earns nothing from an empty record', () => {
    expect(earnedIds(ZERO).size).toBe(0);
  });

  it('never un-earns a badge when every input grows', () => {
    const small: AchievementInput = {
      visitedTopicCount: 1,
      knownAnswerCount: 1,
      passedChallengeCount: 1,
      attemptCount: 60,
      longestStreak: 8,
      masteredTopicCount: 6,
      points: 120,
      goalWeeks: 2,
    };
    const large: AchievementInput = {
      visitedTopicCount: 40,
      knownAnswerCount: 80,
      passedChallengeCount: 30,
      attemptCount: 600,
      longestStreak: 120,
      masteredTopicCount: 30,
      points: 900,
      goalWeeks: 10,
    };
    const smallEarned = earnedIds(small);
    const largeEarned = earnedIds(large);
    for (const id of smallEarned) {
      expect(largeEarned.has(id)).toBe(true);
    }
    expect(largeEarned.size).toBeGreaterThan(smallEarned.size);
  });
});
