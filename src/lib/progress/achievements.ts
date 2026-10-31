// Achievement badge definitions and evaluation (gap 8: heatmap + badges).
//
// Every badge is earned from data the platform already records: topic
// progress rows, practice attempts, and user stats. No badge requires data
// the platform does not already record. Evaluation is pure: given a
// snapshot of those inputs, it says which badges qualify. Awarding (the
// durable, append-only record) lives in the progress service, which persists
// newly qualifying badges into the user_badges table; once a row exists,
// the badge stays earned even if the live inputs later fall below the
// threshold, so a missed day never erases a record.

export type BadgeCategory = 'first' | 'streak' | 'mastery' | 'practice' | 'points' | 'consistency';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
}

export interface AchievementInput {
  visitedTopicCount: number;
  knownAnswerCount: number;
  passedChallengeCount: number;
  attemptCount: number;
  longestStreak: number;
  masteredTopicCount: number;
  points: number;
  goalWeeks: number;
}

export interface BadgeState extends BadgeDefinition {
  earned: boolean;
}

interface BadgeRule extends BadgeDefinition {
  qualifies: (input: AchievementInput) => boolean;
}

const RULES: BadgeRule[] = [
  {
    id: 'first-visit',
    name: 'First step',
    description: 'Visited your first topic.',
    category: 'first',
    qualifies: (input) => input.visitedTopicCount >= 1,
  },
  {
    id: 'first-answer',
    name: 'First Got it',
    description: 'Marked a first interview answer as Got it.',
    category: 'first',
    qualifies: (input) => input.knownAnswerCount >= 1,
  },
  {
    id: 'first-challenge',
    name: 'First challenge passed',
    description: 'Passed your first coding challenge.',
    category: 'first',
    qualifies: (input) => input.passedChallengeCount >= 1,
  },
  {
    id: 'first-attempt',
    name: 'First practice attempt',
    description: 'Made your first practice attempt.',
    category: 'first',
    qualifies: (input) => input.attemptCount >= 1,
  },
  {
    id: 'streak-7',
    name: '7-day streak',
    description: 'Reached a 7-day learning streak.',
    category: 'streak',
    qualifies: (input) => input.longestStreak >= 7,
  },
  {
    id: 'streak-30',
    name: '30-day streak',
    description: 'Reached a 30-day learning streak.',
    category: 'streak',
    qualifies: (input) => input.longestStreak >= 30,
  },
  {
    id: 'streak-100',
    name: '100-day streak',
    description: 'Reached a 100-day learning streak.',
    category: 'streak',
    qualifies: (input) => input.longestStreak >= 100,
  },
  {
    id: 'mastered-5',
    name: '5 topics mastered',
    description: 'Mastered 5 topics.',
    category: 'mastery',
    qualifies: (input) => input.masteredTopicCount >= 5,
  },
  {
    id: 'mastered-10',
    name: '10 topics mastered',
    description: 'Mastered 10 topics.',
    category: 'mastery',
    qualifies: (input) => input.masteredTopicCount >= 10,
  },
  {
    id: 'mastered-25',
    name: '25 topics mastered',
    description: 'Mastered 25 topics.',
    category: 'mastery',
    qualifies: (input) => input.masteredTopicCount >= 25,
  },
  {
    id: 'attempts-50',
    name: '50 practice attempts',
    description: 'Made 50 practice attempts.',
    category: 'practice',
    qualifies: (input) => input.attemptCount >= 50,
  },
  {
    id: 'attempts-100',
    name: '100 practice attempts',
    description: 'Made 100 practice attempts.',
    category: 'practice',
    qualifies: (input) => input.attemptCount >= 100,
  },
  {
    id: 'attempts-500',
    name: '500 practice attempts',
    description: 'Made 500 practice attempts.',
    category: 'practice',
    qualifies: (input) => input.attemptCount >= 500,
  },
  {
    id: 'points-100',
    name: '100 points',
    description: 'Earned 100 points.',
    category: 'points',
    qualifies: (input) => input.points >= 100,
  },
  {
    id: 'points-500',
    name: '500 points',
    description: 'Earned 500 points.',
    category: 'points',
    qualifies: (input) => input.points >= 500,
  },
  {
    id: 'steady-weeks-4',
    name: '4 steady weeks',
    description: 'Hit your weekly goal in 4 different weeks.',
    category: 'consistency',
    qualifies: (input) => input.goalWeeks >= 4,
  },
];

export const BADGES: BadgeDefinition[] = RULES.map(({ id, name, description, category }) => ({
  id,
  name,
  description,
  category,
}));

/** Evaluate every badge against a snapshot of the user's recorded data. */
export function evaluateBadges(input: AchievementInput): BadgeState[] {
  return RULES.map((rule) => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    category: rule.category,
    earned: rule.qualifies(input),
  }));
}
