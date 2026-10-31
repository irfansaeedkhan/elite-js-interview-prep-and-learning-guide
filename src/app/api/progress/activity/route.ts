import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { progressService } from '@/lib/progress/progress-service';

export async function GET() {
  try {
    const session = await requireSession();
    const activity = await progressService.getActivityByDay(session.user.id);
    return Response.json(activity);
  } catch (error) {
    return toErrorResponse(error);
  }
}
