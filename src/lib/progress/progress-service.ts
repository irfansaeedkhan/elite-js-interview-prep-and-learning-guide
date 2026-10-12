import { and, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { topicProgress, userStats, type QaResultsJson } from '@/db/schema/progress.schema';
import { isTopicMastered as checkTopicMastered, getTopicByPath } from '@/lib/progress/mastery';
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
};
