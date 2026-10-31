-- Timed mock sessions (spec 0003). Idempotent: safe to re-run.
-- Mirrors src/db/schema/mock.schema.ts exactly. Apply at merge via
-- this file or via drizzle-kit push, not both blindly (both create
-- the same table; re-running this file after a push is a no-op).
CREATE TABLE IF NOT EXISTS mock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMP NOT NULL,
  deadline_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS mock_sessions_user_started_idx
  ON mock_sessions (user_id, started_at);
