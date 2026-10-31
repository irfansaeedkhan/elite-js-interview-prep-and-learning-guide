import type { MockSessionRow } from './mock-service';

/** Serialize a mock session row for API responses and client props. */
export function mockSessionToDto(row: MockSessionRow) {
  return {
    id: row.id,
    userId: row.userId,
    packId: row.packId,
    durationMinutes: row.durationMinutes,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    deadlineAt: row.deadlineAt.toISOString(),
    submittedAt: row.submittedAt?.toISOString() ?? null,
    answers: row.answers,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type MockSessionDto = ReturnType<typeof mockSessionToDto>;
