import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/mocks/mock-service', () => ({
  mockService: {
    submitSession: vi.fn(),
  },
}));

import { POST } from './route';
import { requireSession } from '@/lib/require-auth';
import { mockService } from '@/lib/mocks/mock-service';

const session = { user: { id: 'user-123' } } as unknown as Session;
const base = 'http://localhost/api/mocks/mock-1/submit';
const params = Promise.resolve({ id: 'mock-1' });

function row() {
  return {
    id: 'mock-1',
    userId: 'user-123',
    packId: 'javascript-foundations',
    durationMinutes: 30,
    status: 'submitted',
    startedAt: new Date('2026-10-29T10:00:00.000Z'),
    deadlineAt: new Date('2026-10-29T10:30:00.000Z'),
    submittedAt: new Date('2026-10-29T10:20:00.000Z'),
    answers: {},
    createdAt: new Date('2026-10-29T10:00:00.000Z'),
    updatedAt: new Date('2026-10-29T10:20:00.000Z'),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue(session);
});

describe('POST /api/mocks/[id]/submit', () => {
  it('submits with an empty body and returns session plus summary', async () => {
    const summary = { total: 0, max: 0, band: 'Not scored' };
    vi.mocked(mockService.submitSession).mockResolvedValue({ session: row(), summary } as never);
    const res = await POST(new Request(base, { method: 'POST', body: JSON.stringify({}) }), {
      params,
    });
    expect(res.status).toBe(200);
    expect(mockService.submitSession).toHaveBeenCalledWith('user-123', 'mock-1', {});
    const body = await res.json();
    expect(body.session.status).toBe('submitted');
    expect(body.summary.band).toBe('Not scored');
  });

  it('passes final answers through when provided', async () => {
    vi.mocked(mockService.submitSession).mockResolvedValue({ session: row(), summary: null } as never);
    const answers = { 'flatten-depth': { code: 'export function f() {}' } };
    await POST(
      new Request(base, { method: 'POST', body: JSON.stringify({ answers }) }),
      { params },
    );
    expect(mockService.submitSession).toHaveBeenCalledWith('user-123', 'mock-1', answers);
  });
});
