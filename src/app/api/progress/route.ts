import { z } from 'zod';
import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { progressService } from '@/lib/progress/progress-service';

const patchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('visit'),
    topicPath: z.string().min(1),
  }),
  z.object({
    action: z.literal('qa'),
    topicPath: z.string().min(1),
    questionId: z.string().min(1),
    result: z.enum(['know', 'review']),
  }),
  z.object({
    action: z.literal('challenge'),
    topicPath: z.string().min(1),
  }),
  z.object({
    action: z.literal('time'),
    topicPath: z.string().min(1),
    seconds: z.number().int().positive().max(3600),
  }),
]);

export async function GET() {
  try {
    const session = await requireSession();
    const snapshot = await progressService.getSnapshot(session.user.id);
    return Response.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = patchSchema.parse(await request.json());

    switch (body.action) {
      case 'visit':
        await progressService.markVisited(session.user.id, body.topicPath);
        break;
      case 'qa':
        await progressService.recordQaResult(
          session.user.id,
          body.topicPath,
          body.questionId,
          body.result,
        );
        break;
      case 'challenge':
        await progressService.recordChallengePassed(session.user.id, body.topicPath);
        break;
      case 'time':
        await progressService.addTimeSpent(session.user.id, body.topicPath, body.seconds);
        break;
    }

    const snapshot = await progressService.getSnapshot(session.user.id);
    return Response.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}
