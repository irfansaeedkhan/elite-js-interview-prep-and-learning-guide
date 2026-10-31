import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/db/db';
import {
  practiceAttempts,
  topicProgress,
  userBadges,
  userStats,
  type QaResultsJson,
} from '@/db/schema/progress.schema';
import {
  aggregateAttemptsByDay,
  buildHeatmapWeeks,
  countActiveDaysInWeekContaining,
  countGoalWeeks,
  heatmapWindowStart,
  HEATMAP_DAYS,
  WEEKLY_GOAL_DAYS,
} from '@/lib/progress/activity';
import { evaluateBadges, type AchievementInput } from '@/lib/progress/achievements';
import { isTopicMastered as checkTopicMastered, getTopicByPath } from '@/lib/progress/mastery';
import { reviewService } from '@/lib/progress/review-service';
import type { TopicProgressEntry, TopicProgressMap } from '@/lib/progress/types';

export interface UserStatsDto {
  points: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lastTopicPath: string | null;
}

export interface ProgressSnapshot {
  progress: TopicProgressMap;
  stats: UserStatsDto;
}

function toDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function rowToEntry(row: typeof topicProgress.$inferSelect): TopicProgressEntry {
  return {
    visitedAt: row.visitedAt.toISOString(),
    qaResults: row.qaResults ?? {},
    challengePassed: row.challengePassed === 1,
    masteredAt: row.masteredAt?.toISOString(),
    timeSpentSeconds: row.timeSpentSeconds,
  };
}

function computeMasteredAt(topicPath: string, entry: TopicProgressEntry): string | undefined {
  if (entry.masteredAt) return entry.masteredAt;
  if (checkTopicMastered(topicPath, { [topicPath]: entry })) {
    return new Date().toISOString();
  }
  return undefined;
}

async function findTopicProgress(userId: string, topicPath: string) {
  const rows = await db
    .select()
    .from(topicProgress)
    .where(and(eq(topicProgress.userId, userId), eq(topicProgress.topicPath, topicPath)))
    .limit(1);
  return rows[0];
}

async function findUserStats(userId: string) {
  const rows = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return rows[0];
}

async function ensureUserStats(userId: string) {
  const existing = await findUserStats(userId);
  if (existing) return existing;

  await db.insert(userStats).values({ userId }).onConflictDoNothing();
  return (await findUserStats(userId))!;
}

async function updateStreak(userId: string, today = toDateKey()) {
  const stats = await ensureUserStats(userId);

  let currentStreak = stats.currentStreak;
  let longestStreak = stats.longestStreak;

  if (stats.lastActiveDate === today) {
    // same day
  } else if (stats.lastActiveDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    currentStreak = stats.lastActiveDate === toDateKey(yesterday) ? currentStreak + 1 : 1;
  } else {
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  await db
    .update(userStats)
    .set({ currentStreak, longestStreak, lastActiveDate: today })
    .where(eq(userStats.userId, userId));
}

async function addPoints(userId: string, delta: number) {
  if (delta <= 0) return;
  const stats = await ensureUserStats(userId);
  await db
    .update(userStats)
    .set({ points: stats.points + delta })
    .where(eq(userStats.userId, userId));
}

/**
 * Rollout guard (gap 2): scheduling a graded prompt must never break QA
 * recording itself — for example if the review_items table has not been
 * created yet at deploy time. The failure is logged, not swallowed
 * silently, and the next grade retries the schedule.
 */
async function scheduleQaReview(
  userId: string,
  topicPath: string,
  questionId: string,
  result: 'know' | 'review',
) {
  try {
    await reviewService.recordReview(userId, {
      topicPath,
      promptId: questionId,
      kind: 'qa',
      grade: result,
    });
  } catch (error) {
    console.error('Failed to schedule review item', error);
  }
}

export const progressService = {
  async getSnapshot(userId: string): Promise<ProgressSnapshot> {
    await ensureUserStats(userId);

    const [rows, statsRow] = await Promise.all([
      db.select().from(topicProgress).where(eq(topicProgress.userId, userId)),
      findUserStats(userId),
    ]);

    const progress: TopicProgressMap = {};
    for (const row of rows) {
      progress[row.topicPath] = rowToEntry(row);
    }

    return {
      progress,
      stats: {
        points: statsRow?.points ?? 0,
        currentStreak: statsRow?.currentStreak ?? 0,
        longestStreak: statsRow?.longestStreak ?? 0,
        lastActiveDate: statsRow?.lastActiveDate ?? null,
        lastTopicPath: statsRow?.lastTopicPath ?? null,
      },
    };
  },

  async markVisited(userId: string, topicPath: string) {
    await updateStreak(userId);

    const existing = await findTopicProgress(userId, topicPath);
    if (existing) {
      await db.update(userStats).set({ lastTopicPath: topicPath }).where(eq(userStats.userId, userId));
      return rowToEntry(existing);
    }

    const [row] = await db
      .insert(topicProgress)
      .values({ userId, topicPath, visitedAt: new Date() })
      .returning();

    await db.update(userStats).set({ lastTopicPath: topicPath }).where(eq(userStats.userId, userId));
    return rowToEntry(row);
  },

  async recordQaResult(
    userId: string,
    topicPath: string,
    questionId: string,
    result: 'know' | 'review',
  ) {
    await updateStreak(userId);

    const existing = await findTopicProgress(userId, topicPath);
    const previousKnow = existing?.qaResults?.[questionId] === 'know';
    const qaResults: QaResultsJson = {
      ...(existing?.qaResults ?? {}),
      [questionId]: result,
    };

    const entry: TopicProgressEntry = {
      visitedAt: (existing?.visitedAt ?? new Date()).toISOString(),
      qaResults,
      challengePassed: existing?.challengePassed === 1,
      masteredAt: existing?.masteredAt?.toISOString(),
      timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    };

    const masteredAt = computeMasteredAt(topicPath, entry);
    if (masteredAt) entry.masteredAt = masteredAt;

    if (existing) {
      const [row] = await db
        .update(topicProgress)
        .set({
          qaResults,
          masteredAt: entry.masteredAt ? new Date(entry.masteredAt) : null,
        })
        .where(eq(topicProgress.id, existing.id))
        .returning();

      if (result === 'know' && !previousKnow) await addPoints(userId, 1);
      if (masteredAt && !existing.masteredAt) await addPoints(userId, 10);
      await scheduleQaReview(userId, topicPath, questionId, result);
      return rowToEntry(row);
    }

    const [row] = await db
      .insert(topicProgress)
      .values({
        userId,
        topicPath,
        visitedAt: new Date(),
        qaResults,
        masteredAt: entry.masteredAt ? new Date(entry.masteredAt) : null,
      })
      .returning();

    if (result === 'know') await addPoints(userId, 1);
    if (entry.masteredAt) await addPoints(userId, 10);
    await scheduleQaReview(userId, topicPath, questionId, result);
    return rowToEntry(row);
  },

  async recordChallengePassed(userId: string, topicPath: string) {
    await updateStreak(userId);

    const existing = await findTopicProgress(userId, topicPath);
    const entry: TopicProgressEntry = {
      visitedAt: (existing?.visitedAt ?? new Date()).toISOString(),
      qaResults: existing?.qaResults ?? {},
      challengePassed: true,
      masteredAt: existing?.masteredAt?.toISOString(),
      timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    };

    const masteredAt = computeMasteredAt(topicPath, entry);
    if (masteredAt) entry.masteredAt = masteredAt;

    if (existing) {
      const [row] = await db
        .update(topicProgress)
        .set({
          challengePassed: 1,
          masteredAt: entry.masteredAt ? new Date(entry.masteredAt) : null,
        })
        .where(eq(topicProgress.id, existing.id))
        .returning();

      if (masteredAt && !existing.masteredAt) await addPoints(userId, 10);
      return rowToEntry(row);
    }

    const [row] = await db
      .insert(topicProgress)
      .values({
        userId,
        topicPath,
        visitedAt: new Date(),
        challengePassed: 1,
        masteredAt: entry.masteredAt ? new Date(entry.masteredAt) : null,
      })
      .returning();

    if (entry.masteredAt) await addPoints(userId, 10);
    return rowToEntry(row);
  },

  async addTimeSpent(userId: string, topicPath: string, seconds: number) {
    if (seconds <= 0) return;

    const existing = await findTopicProgress(userId, topicPath);
    if (existing) {
      await db
        .update(topicProgress)
        .set({ timeSpentSeconds: existing.timeSpentSeconds + seconds })
        .where(eq(topicProgress.id, existing.id));
      return;
    }

    await db.insert(topicProgress).values({
      userId,
      topicPath,
      visitedAt: new Date(),
      timeSpentSeconds: seconds,
    });
  },

  async mergeLocalProgress(userId: string, localMap: TopicProgressMap) {
    for (const [topicPath, localEntry] of Object.entries(localMap)) {
      if (!getTopicByPath(topicPath)) continue;

      const existing = await findTopicProgress(userId, topicPath);
      const mergedQa: QaResultsJson = {
        ...(existing?.qaResults ?? {}),
        ...(localEntry.qaResults ?? {}),
      };

      const mergedEntry: TopicProgressEntry = {
        visitedAt: localEntry.visitedAt ?? existing?.visitedAt.toISOString() ?? new Date().toISOString(),
        qaResults: mergedQa,
        challengePassed: Boolean(existing?.challengePassed === 1 || localEntry.challengePassed),
        masteredAt: existing?.masteredAt?.toISOString() ?? localEntry.masteredAt,
        timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + (localEntry.timeSpentSeconds ?? 0),
      };

      const masteredAt = computeMasteredAt(topicPath, mergedEntry);
      if (masteredAt) mergedEntry.masteredAt = masteredAt;

      if (existing) {
        await db
          .update(topicProgress)
          .set({
            qaResults: mergedQa,
            challengePassed: mergedEntry.challengePassed ? 1 : 0,
            masteredAt: mergedEntry.masteredAt ? new Date(mergedEntry.masteredAt) : null,
            timeSpentSeconds: mergedEntry.timeSpentSeconds,
          })
          .where(eq(topicProgress.id, existing.id));
      } else {
        await db.insert(topicProgress).values({
          userId,
          topicPath,
          visitedAt: new Date(mergedEntry.visitedAt),
          qaResults: mergedQa,
          challengePassed: mergedEntry.challengePassed ? 1 : 0,
          masteredAt: mergedEntry.masteredAt ? new Date(mergedEntry.masteredAt) : null,
          timeSpentSeconds: mergedEntry.timeSpentSeconds ?? 0,
        });
      }
    }

    await updateStreak(userId);
    return this.getSnapshot(userId);
  },

  async recordPracticeAttempt(
    userId: string,
    input: { topicPath: string; kind: 'challenge' | 'prediction' | 'qa'; promptId: string; passed: boolean },
  ) {
    const [row] = await db
      .insert(practiceAttempts)
      .values({
        userId,
        topicPath: input.topicPath,
        kind: input.kind,
        promptId: input.promptId,
        passed: input.passed,
      })
      .returning();
    return row;
  },

  async listPracticeAttempts(userId: string, topicPath: string) {
    return db
      .select({
        id: practiceAttempts.id,
        topicPath: practiceAttempts.topicPath,
        kind: practiceAttempts.kind,
        promptId: practiceAttempts.promptId,
        passed: practiceAttempts.passed,
        createdAt: practiceAttempts.createdAt,
      })
      .from(practiceAttempts)
      .where(and(eq(practiceAttempts.userId, userId), eq(practiceAttempts.topicPath, topicPath)))
      .orderBy(desc(practiceAttempts.createdAt))
      .limit(20);
  },


  /**
   * Activity heatmap data for a signed-in user, from practice attempts only.
   * Every query is scoped to userId. Days are UTC calendar days; the window
   * is the last HEATMAP_DAYS days ending today.
   */
  async getActivityByDay(userId: string, days: number = HEATMAP_DAYS, today: Date = new Date()) {
    const windowStart = heatmapWindowStart(days, today);
    const rows = await db
      .select({ createdAt: practiceAttempts.createdAt })
      .from(practiceAttempts)
      .where(
        and(eq(practiceAttempts.userId, userId), gte(practiceAttempts.createdAt, windowStart)),
      );

    const dayCounts = aggregateAttemptsByDay(rows, days, today);
    const weeks = buildHeatmapWeeks(dayCounts);
    return {
      days: dayCounts,
      weeks,
      weeklyGoal: {
        targetDaysPerWeek: WEEKLY_GOAL_DAYS,
        currentWeekActiveDays: countActiveDaysInWeekContaining(weeks, toDateKey(today)),
        goalWeeks: countGoalWeeks(weeks),
      },
    };
  },

  /**
   * Achievement badges for a signed-in user. Qualification is evaluated live
   * from already-recorded data (topic progress, attempts, stats, goal
   * weeks); newly qualifying badges are persisted into user_badges, and the
   * returned earned flag follows the table, not the live evaluation. So a
   * badge, once earned, stays earned even if the live inputs later fall
   * below the threshold. Awarding is append-only: no update or delete path
   * exists. Every query is scoped to userId.
   */
  async getBadges(userId: string) {
    const [progressRows, attemptRows, statsRows, earnedRows] = await Promise.all([
      db.select().from(topicProgress).where(eq(topicProgress.userId, userId)),
      db
        .select({ id: practiceAttempts.id })
        .from(practiceAttempts)
        .where(eq(practiceAttempts.userId, userId)),
      db.select().from(userStats).where(eq(userStats.userId, userId)),
      db.select().from(userBadges).where(eq(userBadges.userId, userId)),
    ]);

    const activity = await this.getActivityByDay(userId);
    const stats = statsRows[0];
    const input: AchievementInput = {
      visitedTopicCount: progressRows.length,
      knownAnswerCount: progressRows.reduce(
        (total, row) =>
          total +
          Object.values(row.qaResults ?? {}).filter((result) => result === 'know').length,
        0,
      ),
      passedChallengeCount: progressRows.filter((row) => row.challengePassed === 1).length,
      attemptCount: attemptRows.length,
      longestStreak: stats?.longestStreak ?? 0,
      masteredTopicCount: progressRows.filter((row) => row.masteredAt !== null).length,
      points: stats?.points ?? 0,
      goalWeeks: activity.weeklyGoal.goalWeeks,
    };

    const states = evaluateBadges(input);
    const alreadyEarned = new Set(earnedRows.map((row) => row.badgeId));
    const newlyEarned = states.filter((state) => state.earned && !alreadyEarned.has(state.id));
    for (const badge of newlyEarned) {
      await db.insert(userBadges).values({ userId, badgeId: badge.id }).onConflictDoNothing();
    }
    const finalRows =
      newlyEarned.length > 0
        ? await db.select().from(userBadges).where(eq(userBadges.userId, userId))
        : earnedRows;
    const earnedAt = new Map(finalRows.map((row) => [row.badgeId, row.earnedAt.toISOString()]));

    return {
      badges: states.map((state) => ({
        ...state,
        earned: earnedAt.has(state.id),
        earnedAt: earnedAt.get(state.id) ?? null,
      })),
    };
  },
};
