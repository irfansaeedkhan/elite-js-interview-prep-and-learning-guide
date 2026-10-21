import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/progress/progress-service', () => ({
  progressService: {
    recordPracticeAttempt: vi.fn(),
    listPracticeAttempts: vi.fn(),
  },
}));

import { GET, POST } from './route';
import { ApiError } from '@/lib/api-error';
import { requireSession } from '@/lib/require-auth';
import { progressService } from '@/lib/progress/progress-service';

const session = { user: { id: 'user-123' } } as unknown as Session;
const base = 'http://localhost/api/progress/attempts';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue(session);
});

describe('GET /api/progress/attempts', () => {
  it('returns attempts scoped to the signed-in user', async () => {
    const attempts = [
      {
        id: 'a1',
        topicPath: 'javascript/foundation/closures',
        kind: 'challenge',
        promptId: 'closures-1',
        passed: true,
        createdAt: new Date('2026-10-01T10:00:00.000Z'),
      },
    ];
    vi.mocked(progressService.listPracticeAttempts).mockResolvedValue(attempts as never);

    const res = await GET(
      new Request(`${base}?topicPath=javascript/foundation/closures`),
    );

    expect(res.status).toBe(200);
    expect(progressService.listPracticeAttempts).toHaveBeenCalledWith(
      'user-123',
      'javascript/foundation/closures',
    );
    const body = await res.json();
    expect(body.attempts).toHaveLength(1);
    expect(body.attempts[0].createdAt).toBe('2026-10-01T10:00:00.000Z');
  });

  it('returns 400 when topicPath is missing', async () => {
    const res = await GET(new Request(base));
    expect(res.status).toBe(400);
    expect(progressService.listPracticeAttempts).not.toHaveBeenCalled();
  });

  it('returns 401 when not signed in', async () => {
    vi.mocked(requireSession).mockRejectedValue(
      new ApiError('Unauthorized', 401, 'UNAUTHORIZED'),
    );

    const res = await GET(new Request(`${base}?topicPath=javascript/foundation/closures`));

    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ code: 'UNAUTHORIZED' });
    expect(progressService.listPracticeAttempts).not.toHaveBeenCalled();
  });
});

describe('POST /api/progress/attempts', () => {
  const validBody = {
    topicPath: 'javascript/foundation/closures',
    kind: 'challenge',
    promptId: 'closures-1',
    passed: true,
  };

  function postRequest(body: unknown) {
    return new Request(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('records the attempt under the session user id', async () => {
    vi.mocked(progressService.recordPracticeAttempt).mockResolvedValue({
      id: 'attempt-1',
      createdAt: new Date('2026-10-01T10:00:00.000Z'),
    } as never);

    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(200);
    expect(progressService.recordPracticeAttempt).toHaveBeenCalledWith('user-123', validBody);
    const body = await res.json();
    expect(body).toMatchObject({ id: 'attempt-1', saved: true });
  });

  it('returns 400 for an invalid body', async () => {
    const res = await POST(postRequest({ topicPath: 'x', kind: 'challenge' }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(progressService.recordPracticeAttempt).not.toHaveBeenCalled();
  });

  it('returns 401 when not signed in', async () => {
    vi.mocked(requireSession).mockRejectedValue(
      new ApiError('Unauthorized', 401, 'UNAUTHORIZED'),
    );

    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(401);
    expect(progressService.recordPracticeAttempt).not.toHaveBeenCalled();
  });
});
