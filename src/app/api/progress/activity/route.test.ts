import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/progress/progress-service', () => ({
  progressService: {
    getActivityByDay: vi.fn(),
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

describe('GET /api/progress/activity', () => {
  it('returns activity scoped to the signed-in user', async () => {
    const activity = {
      days: [{ date: '2026-10-28', count: 2 }],
      weeks: [[{ date: '2026-10-28', count: 2 }]],
      weeklyGoal: { targetDaysPerWeek: 3, currentWeekActiveDays: 1, goalWeeks: 0 },
    };
    vi.mocked(progressService.getActivityByDay).mockResolvedValue(activity as never);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(progressService.getActivityByDay).toHaveBeenCalledWith('user-123');
    expect(await res.json()).toEqual(activity);
  });

  it('returns 401 when there is no session', async () => {
    vi.mocked(requireSession).mockRejectedValue(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));

    const res = await GET();

    expect(res.status).toBe(401);
    expect(progressService.getActivityByDay).not.toHaveBeenCalled();
  });
});
