import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { mockService } from '@/lib/mocks/mock-service';
import { mockSessionToDto } from '@/lib/mocks/mock-dto';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const row = await mockService.getSession(session.user.id, id);
    if (!row) return Response.json({ error: 'Mock session not found' }, { status: 404 });
    return Response.json({ session: mockSessionToDto(row) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
