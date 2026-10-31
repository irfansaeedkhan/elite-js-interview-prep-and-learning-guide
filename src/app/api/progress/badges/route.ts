import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { progressService } from '@/lib/progress/progress-service';

export async function GET() {
  try {
    const session = await requireSession();
    const result = await progressService.getBadges(session.user.id);
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
