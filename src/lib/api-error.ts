import { z } from 'zod';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { error: 'Invalid request body', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  console.error(error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
