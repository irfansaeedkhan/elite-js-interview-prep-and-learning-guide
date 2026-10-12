import { z } from 'zod';
import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { progressService } from '@/lib/progress/progress-service';

const attemptSchema = z.object({
  topicPath: z.string().min(1),
  kind: z.enum(['challenge', 'prediction', 'qa']),
  promptId: z.string().min(1).max(200),
  passed: z.boolean(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const topicPath = new URL(request.url).searchParams.get('topicPath') ?? '';
    if (!topicPath) {
      return Response.json({ error: 'topicPath is required' }, { status: 400 });
    }
    const attempts = await progressService.listPracticeAttempts(session.user.id, topicPath);
    return Response.json({
      attempts: attempts.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = attemptSchema.parse(await request.json());
    const row = await progressService.recordPracticeAttempt(session.user.id, body);
    return Response.json({
      id: row.id,
      saved: true,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
