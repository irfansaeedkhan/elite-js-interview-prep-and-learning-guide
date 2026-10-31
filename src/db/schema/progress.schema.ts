import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { user } from '@/db/schema/auth.schema';

export type QaResultsJson = Record<string, 'know' | 'review'>;

export const topicProgress = pgTable(
  'topic_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    topicPath: text('topic_path').notNull(),
    visitedAt: timestamp('visited_at').notNull(),
    qaResults: jsonb('qa_results').$type<QaResultsJson>().default({}).notNull(),
    challengePassed: integer('challenge_passed').default(0).notNull(),
    masteredAt: timestamp('mastered_at'),
    timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('topic_progress_user_topic_idx').on(table.userId, table.topicPath),
    index('topic_progress_user_id_idx').on(table.userId),
  ],
);

export const userBadges = pgTable(
  'user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    badgeId: text('badge_id').notNull(),
    earnedAt: timestamp('earned_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_badges_user_badge_idx').on(table.userId, table.badgeId),
    index('user_badges_user_id_idx').on(table.userId),
  ],
);

export const userStats = pgTable('user_stats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  points: integer('points').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActiveDate: text('last_active_date'),
  lastTopicPath: text('last_topic_path'),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const practiceAttempts = pgTable(
  'practice_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    topicPath: text('topic_path').notNull(),
    kind: text('kind').notNull(),
    promptId: text('prompt_id').notNull(),
    passed: boolean('passed').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('practice_attempts_user_topic_created_idx').on(
      table.userId,
      table.topicPath,
      table.createdAt,
    ),
  ],
);
