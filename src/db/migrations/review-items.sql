-- Gap 2 (Wave 1): spaced-repetition review schedule, one row per graded prompt.
-- Idempotent: safe to run more than once. Applied by the Manager at merge
-- time (this repo snapshot has no drizzle-kit journal yet, so no journal
-- entry is fabricated here). The table is additive and cascades with the user.
CREATE TABLE IF NOT EXISTS "review_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "topic_path" text NOT NULL,
  "prompt_id" text NOT NULL,
  "kind" text NOT NULL DEFAULT 'qa',
  "interval_days" integer NOT NULL DEFAULT 1,
  "repetitions" integer NOT NULL DEFAULT 0,
  "lapses" integer NOT NULL DEFAULT 0,
  "due_at" timestamp NOT NULL,
  "last_reviewed_at" timestamp NOT NULL,
  "last_result" text NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "review_items_user_topic_prompt_idx"
  ON "review_items" ("user_id", "topic_path", "prompt_id");
CREATE INDEX IF NOT EXISTS "review_items_user_due_idx"
  ON "review_items" ("user_id", "due_at");
