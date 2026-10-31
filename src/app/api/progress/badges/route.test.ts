import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/progress/progress-service', () => ({
  progressService: {
    getBadges: vi.fn(),
  },
}));

import { GET } from './route';
import { ApiError } from '@/lib/api-error';
import { requireSession } from '@/lib/require-auth';
import { progressService } from '@/lib/progress/progress-service';

const session = { user: { id: 'user-123' } } as unknown as Session;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue(session);
});

describe('GET /api/progress/badges', () => {
  it('returns badges scoped to the signed-in user', async () => {
    const result = {
      badges: [
        {
          id: 'first-visit',
          name: 'First step',
          description: 'Visited your first topic.',
          category: 'first',
          earned: true,
          earnedAt: '2026-10-01T00:00:00.000Z',
        },
      ],
    };
    vi.mocked(progressService.getBadges).mockResolvedValue(result as never);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(progressService.getBadges).toHaveBeenCalledWith('user-123');
    expect(await res.json()).toEqual(result);
  });

  it('returns 401 when there is no session', async () => {
    vi.mocked(requireSession).mockRejectedValue(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));

    const res = await GET();

    expect(res.status).toBe(401);
    expect(progressService.getBadges).not.toHaveBeenCalled();
  });
});
