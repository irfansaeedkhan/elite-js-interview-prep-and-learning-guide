import type { MockAnswer, MockAnswers } from './mock-session';
import type { MockSessionDto } from './mock-dto';

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function startMock(packId: string, durationMinutes: number): Promise<MockSessionDto> {
  const res = await fetch('/api/mocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packId, durationMinutes }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const body = await res.json();
  return body.session as MockSessionDto;
}

export async function listMocks(): Promise<MockSessionDto[]> {
  const res = await fetch('/api/mocks');
  if (!res.ok) throw new Error(await readError(res));
  const body = await res.json();
  return body.sessions as MockSessionDto[];
}

export async function saveMockAnswer(
  id: string,
  questionId: string,
  answer: MockAnswer,
): Promise<MockSessionDto> {
  const res = await fetch(`/api/mocks/${id}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, answer }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const body = await res.json();
  return body.session as MockSessionDto;
}

export async function submitMock(
  id: string,
  answers: MockAnswers = {},
): Promise<{ session: MockSessionDto; summary: unknown }> {
  const res = await fetch(`/api/mocks/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as { session: MockSessionDto; summary: unknown };
}
