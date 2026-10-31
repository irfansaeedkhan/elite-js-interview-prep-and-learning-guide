/**
 * Spaced-repetition scheduling engine (gap 2, Wave 1).
 *
 * Pure functions only: no database, no clock reads. Callers pass `now`
 * explicitly so every rule is unit-testable and timezone handling stays
 * in one place (UTC instants; due means dueAt <= now, no calendar-day
 * rounding, so DST and local zones cannot shift a due date).
 *
 * Model (doubling ladder, documented alternative to full SM2: the
 * intervals are fixed and predictable instead of ease-factor tuned):
 *
 * - A review item is one graded prompt: (topicPath, promptId, kind).
 *   Flashcards and interview Q&A share the same prompt ids, so kind
 *   'qa' covers flashcards first and Q&A with them. Other kinds
 *   (predictions, challenges) can join later without changing this file.
 * - Grades reuse the existing vocabulary: 'know' (Got it) and 'review'
 *   (Review later).
 * - New item graded 'know' -> due in 1 day, repetitions 1.
 * - New item graded 'review' -> due in 1 day, repetitions 0, lapses 1.
 * - Known again -> interval doubles along 1, 2, 4, 8, 16, 32, 64 days
 *   and stops at the 64-day cap. Repetitions increment.
 * - Marked 'review' again -> interval resets to 1 day, repetitions
 *   reset to 0, lapses increment. A weak item always returns sooner
 *   than the interval it just failed.
 * - Due queue order: weak items first (last result 'review'), then
 *   most-overdue first, then topicPath/promptId for a stable order.
 *   Grading every due item reschedules each one past now, so a
 *   finished session clears the queue to zero.
 */

export type ReviewGrade = 'know' | 'review';

export type ReviewKind = 'qa';

export interface ReviewItemState {
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: Date;
  lastReviewedAt: Date;
  lastResult: ReviewGrade;
}

export interface SchedulableItem extends ReviewItemState {
  topicPath: string;
  promptId: string;
  kind: string;
}

export interface DueQueueItem extends SchedulableItem {
  overdueDays: number;
}

export const REVIEW_INTERVAL_LADDER_DAYS = [1, 2, 4, 8, 16, 32, 64] as const;

export const MAX_INTERVAL_DAYS = 64;

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function nextIntervalDays(currentIntervalDays: number, grade: ReviewGrade): number {
  if (grade === 'review') return 1;
  const current = Math.max(1, Math.floor(currentIntervalDays));
  const ladder = REVIEW_INTERVAL_LADDER_DAYS as readonly number[];
  const index = ladder.indexOf(current);
  if (index === -1) return Math.min(current * 2, MAX_INTERVAL_DAYS);
  return ladder[Math.min(index + 1, ladder.length - 1)];
}

export function scheduleReview(
  previous: ReviewItemState | null,
  grade: ReviewGrade,
  now: Date,
): ReviewItemState {
  if (previous === null) {
    return {
      intervalDays: 1,
      repetitions: grade === 'know' ? 1 : 0,
      lapses: grade === 'review' ? 1 : 0,
      dueAt: addDays(now, 1),
      lastReviewedAt: now,
      lastResult: grade,
    };
  }

  const intervalDays = nextIntervalDays(previous.intervalDays, grade);
  return {
    intervalDays,
    repetitions: grade === 'know' ? previous.repetitions + 1 : 0,
    lapses: grade === 'review' ? previous.lapses + 1 : previous.lapses,
    dueAt: addDays(now, intervalDays),
    lastReviewedAt: now,
    lastResult: grade,
  };
}

export function isDue(item: Pick<ReviewItemState, 'dueAt'>, now: Date): boolean {
  return item.dueAt.getTime() <= now.getTime();
}

export function getDueQueue(items: SchedulableItem[], now: Date): DueQueueItem[] {
  const nowMs = now.getTime();
  return items
    .filter((item) => item.dueAt.getTime() <= nowMs)
    .map((item) => ({
      ...item,
      overdueDays: Math.max(0, Math.floor((nowMs - item.dueAt.getTime()) / DAY_MS)),
    }))
    .sort((a, b) => {
      const weakA = a.lastResult === 'review' ? 0 : 1;
      const weakB = b.lastResult === 'review' ? 0 : 1;
      if (weakA !== weakB) return weakA - weakB;
      const dueDiff = a.dueAt.getTime() - b.dueAt.getTime();
      if (dueDiff !== 0) return dueDiff;
      if (a.topicPath !== b.topicPath) return a.topicPath < b.topicPath ? -1 : 1;
      if (a.promptId !== b.promptId) return a.promptId < b.promptId ? -1 : 1;
      return 0;
    });
}
