import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { user } from '@/db/schema/auth.schema';

/**
 * One spaced-repetition schedule per graded prompt (gap 2, Wave 1).
 *
 * A row is created the first time a signed-in learner grades a prompt
 * (flashcard "Got it" / "Review later" today; other prompt kinds later)
 * and rescheduled on every later grade by the scheduling engine in
 * `src/lib/progress/spaced-repetition.ts`. The table is additive: it
 * never rewrites topic_progress or practice_attempts, and every query
 * is scoped by userId.
 */
export const reviewItems = pgTable(
  'review_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    topicPath: text('topic_path').notNull(),
    promptId: text('prompt_id').notNull(),
    kind: text('kind').default('qa').notNull(),
    intervalDays: integer('interval_days').default(1).notNull(),
    repetitions: integer('repetitions').default(0).notNull(),
    lapses: integer('lapses').default(0).notNull(),
    dueAt: timestamp('due_at').notNull(),
    lastReviewedAt: timestamp('last_reviewed_at').notNull(),
    lastResult: text('last_result').notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('review_items_user_topic_prompt_idx').on(
      table.userId,
      table.topicPath,
      table.promptId,
    ),
    index('review_items_user_due_idx').on(table.userId, table.dueAt),
  ],
);
