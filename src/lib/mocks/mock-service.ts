import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { mockSessions } from '@/db/schema/mock.schema';
import { ApiError } from '@/lib/api-error';
import {
  isTerminalStatus,
  scoreRubric,
  validateAnswer,
  validateStart,
  type MockAnswer,
  type MockAnswers,
} from './mock-session';
import { getMockPack, getMockPackIds } from './mock-packs';

export type MockSessionRow = typeof mockSessions.$inferSelect;

export interface MockSessionWithSummary {
  session: MockSessionRow;
  summary: ReturnType<typeof scoreRubric> | null;
}

function toSummary(row: MockSessionRow): ReturnType<typeof scoreRubric> | null {
  const pack = getMockPack(row.packId);
  if (!pack) return null;
  return scoreRubric(row.answers, pack.questions);
}

async function findOwnedSession(userId: string, id: string): Promise<MockSessionRow | null> {
  const rows = await db
    .select()
    .from(mockSessions)
    .where(and(eq(mockSessions.userId, userId), eq(mockSessions.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export const mockService = {
  async startSession(
    userId: string,
    packId: string,
    durationMinutes: number,
    now = new Date(),
  ): Promise<MockSessionRow> {
    const error = validateStart(packId, durationMinutes, getMockPackIds());
    if (error) throw new ApiError(error, 400, 'VALIDATION_ERROR');
    const deadlineAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const rows = await db
      .insert(mockSessions)
      .values({ userId, packId, durationMinutes, startedAt: now, deadlineAt })
      .returning();
    return rows[0];
  },

  async getSession(userId: string, id: string): Promise<MockSessionRow | null> {
    return findOwnedSession(userId, id);
  },

  async listSessions(userId: string): Promise<MockSessionRow[]> {
    return db
      .select()
      .from(mockSessions)
      .where(eq(mockSessions.userId, userId))
      .orderBy(desc(mockSessions.startedAt))
      .limit(20);
  },

  /**
   * Save one answer. The server enforces the deadline: a write after
   * deadlineAt flips the session to timed_out and is rejected, even
   * if the client's countdown had not fired yet.
   */
  async saveAnswer(
    userId: string,
    id: string,
    questionId: string,
    answer: MockAnswer,
    now = new Date(),
  ): Promise<MockSessionRow> {
    const row = await findOwnedSession(userId, id);
    if (!row) throw new ApiError('Mock session not found', 404, 'NOT_FOUND');
    if (isTerminalStatus(row.status)) {
      throw new ApiError('Mock session is already finished', 409, 'SESSION_FINISHED');
    }
    if (now >= row.deadlineAt) {
      await db
        .update(mockSessions)
        .set({ status: 'timed_out', submittedAt: now })
        .where(eq(mockSessions.id, row.id));
      throw new ApiError('Time expired: the mock session timed out', 409, 'SESSION_TIMED_OUT');
    }
    const pack = getMockPack(row.packId);
    const question = pack?.questions.find((q) => q.id === questionId);
    if (!question) throw new ApiError('Unknown question for this mock', 400, 'VALIDATION_ERROR');
    const error = validateAnswer(question, answer);
    if (error) throw new ApiError(error, 400, 'VALIDATION_ERROR');
    const answers: MockAnswers = { ...row.answers, [questionId]: answer };
    const updated = await db
      .update(mockSessions)
      .set({ answers })
      .where(eq(mockSessions.id, row.id))
      .returning();
    return updated[0];
  },

  /**
   * Finish a session. Re-submitting a finished session returns it
   * unchanged (auto-submit can fire twice). Past the deadline, the
   * session is marked timed_out instead of submitted.
   */
  async submitSession(
    userId: string,
    id: string,
    finalAnswers: MockAnswers = {},
    now = new Date(),
  ): Promise<MockSessionWithSummary> {
    const row = await findOwnedSession(userId, id);
    if (!row) throw new ApiError('Mock session not found', 404, 'NOT_FOUND');
    if (isTerminalStatus(row.status)) {
      return { session: row, summary: toSummary(row) };
    }
    const pack = getMockPack(row.packId);
    if (pack) {
      for (const [questionId, answer] of Object.entries(finalAnswers)) {
        const question = pack.questions.find((q) => q.id === questionId);
        if (!question) throw new ApiError('Unknown question for this mock', 400, 'VALIDATION_ERROR');
        const error = validateAnswer(question, answer);
        if (error) throw new ApiError(error, 400, 'VALIDATION_ERROR');
      }
    }
    const status = now >= row.deadlineAt ? 'timed_out' : 'submitted';
    const answers: MockAnswers = { ...row.answers, ...finalAnswers };
    const updated = await db
      .update(mockSessions)
      .set({ status, submittedAt: now, answers })
      .where(eq(mockSessions.id, row.id))
      .returning();
    const finished = updated[0];
    return { session: finished, summary: toSummary(finished) };
  },
};
