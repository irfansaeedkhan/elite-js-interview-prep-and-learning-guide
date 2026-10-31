import { z } from 'zod';
import { requireSession } from '@/lib/require-auth';
import { toErrorResponse } from '@/lib/api-error';
import { mockService } from '@/lib/mocks/mock-service';
import { mockSessionToDto } from '@/lib/mocks/mock-dto';
import type { MockAnswer } from '@/lib/mocks/mock-session';

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.record(z.string(), z.unknown()),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = answerSchema.parse(await request.json());
    const row = await mockService.saveAnswer(
      session.user.id,
      id,
      body.questionId,
      body.answer as MockAnswer,
    );
    return Response.json({ session: mockSessionToDto(row) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
