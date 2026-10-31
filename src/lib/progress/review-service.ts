import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { reviewItems } from '@/db/schema/review.schema';
import {
  getDueQueue,
  scheduleReview,
  type ReviewGrade,
  type ReviewItemState,
  type SchedulableItem,
} from '@/lib/progress/spaced-repetition';

export interface DueQueueEntry {
  topicPath: string;
  promptId: string;
  kind: string;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: string;
  lastReviewedAt: string;
  lastResult: ReviewGrade;
  overdueDays: number;
}

export interface ReviewCounts {
  due: number;
  overdue: number;
  weakDue: number;
}

export interface RecordReviewInput {
  topicPath: string;
  promptId: string;
  kind?: string;
  grade: ReviewGrade;
}

type ReviewItemRow = typeof reviewItems.$inferSelect;

function rowToSchedulable(row: ReviewItemRow): SchedulableItem {
  return {
    topicPath: row.topicPath,
    promptId: row.promptId,
    kind: row.kind,
    intervalDays: row.intervalDays,
    repetitions: row.repetitions,
    lapses: row.lapses,
    dueAt: row.dueAt,
    lastReviewedAt: row.lastReviewedAt,
    lastResult: row.lastResult as ReviewGrade,
  };
}

function rowToState(row: ReviewItemRow): ReviewItemState {
  return {
    intervalDays: row.intervalDays,
    repetitions: row.repetitions,
    lapses: row.lapses,
    dueAt: row.dueAt,
    lastReviewedAt: row.lastReviewedAt,
    lastResult: row.lastResult as ReviewGrade,
  };
}

export const reviewService = {
  /**
   * The due-review queue for one user, weak items first, then most
   * overdue. Always scoped by userId; `now` is injectable for tests.
   */
  async getDueQueue(
    userId: string,
    now = new Date(),
  ): Promise<{ items: DueQueueEntry[]; counts: ReviewCounts }> {
    const rows = await db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.userId, userId)))
      .orderBy(asc(reviewItems.dueAt));

    const due = getDueQueue(rows.map(rowToSchedulable), now);
    const items: DueQueueEntry[] = due.map((entry) => ({
      topicPath: entry.topicPath,
      promptId: entry.promptId,
      kind: entry.kind,
      intervalDays: entry.intervalDays,
      repetitions: entry.repetitions,
      lapses: entry.lapses,
      dueAt: entry.dueAt.toISOString(),
      lastReviewedAt: entry.lastReviewedAt.toISOString(),
      lastResult: entry.lastResult,
      overdueDays: entry.overdueDays,
    }));

    return {
      items,
      counts: {
        due: items.length,
        overdue: items.filter((entry) => entry.overdueDays > 0).length,
        weakDue: items.filter((entry) => entry.lastResult === 'review').length,
      },
    };
  },

  /**
   * Grade one prompt and reschedule it. Creates the row on first grade.
   * Upsert is find-then-write, matching progress-service style.
   */
  async recordReview(userId: string, input: RecordReviewInput, now = new Date()) {
    const existingRows = await db
      .select()
      .from(reviewItems)
      .where(
        and(
          eq(reviewItems.userId, userId),
          eq(reviewItems.topicPath, input.topicPath),
          eq(reviewItems.promptId, input.promptId),
        ),
      )
      .limit(1);
    const existing = existingRows[0];

    const next = scheduleReview(existing ? rowToState(existing) : null, input.grade, now);

    if (existing) {
      const [row] = await db
        .update(reviewItems)
        .set({
          kind: input.kind ?? existing.kind,
          intervalDays: next.intervalDays,
          repetitions: next.repetitions,
          lapses: next.lapses,
          dueAt: next.dueAt,
          lastReviewedAt: next.lastReviewedAt,
          lastResult: next.lastResult,
        })
        .where(eq(reviewItems.id, existing.id))
        .returning();
      return row;
    }

    const [row] = await db
      .insert(reviewItems)
      .values({
        userId,
        topicPath: input.topicPath,
        promptId: input.promptId,
        kind: input.kind ?? 'qa',
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: next.lastReviewedAt,
        lastResult: next.lastResult,
      })
      .returning();
    return row;
  },
};
