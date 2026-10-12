import { z } from 'zod';
import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { progressService } from '@/lib/progress/progress-service';
import type { TopicProgressMap } from '@/lib/progress/types';

const migrateSchema = z.object({
  progress: z.record(
    z.string(),
    z.object({
      visitedAt: z.string(),
      qaResults: z.record(z.string(), z.enum(['know', 'review'])).optional(),
      challengePassed: z.boolean().optional(),
      masteredAt: z.string().optional(),
      timeSpentSeconds: z.number().optional(),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = migrateSchema.parse(await request.json());
    const snapshot = await progressService.mergeLocalProgress(
      session.user.id,
      body.progress as TopicProgressMap,
    );
    return Response.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}
