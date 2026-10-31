import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { getTopicIndex } from '@/lib/progress/mastery';
import { getReadinessReport } from '@/lib/progress/readiness';
import { progressService } from '@/lib/progress/progress-service';

/**
 * Readiness analytics (gap 5). Read-only: derives weakest topics,
 * readiness estimates, and the study-next recommendation from the
 * learner's existing progress snapshot. No writes, no schema change.
 * This is the stable shape gap 9 (study plans) consumes.
 */
export async function GET() {
  try {
    const session = await requireSession();
    const snapshot = await progressService.getSnapshot(session.user.id);
    return Response.json(getReadinessReport(getTopicIndex(), snapshot.progress));
  } catch (error) {
    return toErrorResponse(error);
  }
}
