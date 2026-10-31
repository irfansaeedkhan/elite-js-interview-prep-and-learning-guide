import { z } from 'zod';
import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { mockService } from '@/lib/mocks/mock-service';
import { mockSessionToDto } from '@/lib/mocks/mock-dto';

const startSchema = z.object({
  packId: z.string().min(1),
  durationMinutes: z.number().int(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = startSchema.parse(await request.json());
    const row = await mockService.startSession(session.user.id, body.packId, body.durationMinutes);
    return Response.json({ session: mockSessionToDto(row) }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET() {
  try {
    const session = await requireSession();
    const rows = await mockService.listSessions(session.user.id);
    return Response.json({ sessions: rows.map(mockSessionToDto) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
