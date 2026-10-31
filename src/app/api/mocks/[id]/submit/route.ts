import { z } from 'zod';
import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { mockService } from '@/lib/mocks/mock-service';
import { mockSessionToDto } from '@/lib/mocks/mock-dto';
import type { MockAnswers } from '@/lib/mocks/mock-session';

const submitSchema = z.object({
  answers: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = submitSchema.parse(await request.json());
    const { session: row, summary } = await mockService.submitSession(
      session.user.id,
      id,
      (body.answers ?? {}) as MockAnswers,
    );
    return Response.json({ session: mockSessionToDto(row), summary });
  } catch (error) {
    return toErrorResponse(error);
  }
}
