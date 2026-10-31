import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from '@/db/schema/auth.schema';
import type { MockAnswers, MockStatus } from '@/lib/mocks/mock-session';

/**
 * Timed mock sessions (spec 0003). One row per mock attempt.
 * Answers are one entry per question id; rubric scores and reported
 * test results live inside the answers JSON (no derived summary is
 * stored: the rubric is recomputed from answers on read).
 */
export const mockSessions = pgTable(
  'mock_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    packId: text('pack_id').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    status: text('status').$type<MockStatus>().default('in_progress').notNull(),
    startedAt: timestamp('started_at').notNull(),
    deadlineAt: timestamp('deadline_at').notNull(),
    submittedAt: timestamp('submitted_at'),
    answers: jsonb('answers').$type<MockAnswers>().default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('mock_sessions_user_started_idx').on(table.userId, table.startedAt)],
);
