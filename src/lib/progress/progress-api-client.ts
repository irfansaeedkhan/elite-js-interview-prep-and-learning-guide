import type { ProgressSnapshot } from '@/lib/progress/progress-service';
import type { TopicProgressMap } from '@/lib/progress/types';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function fetchProgressSnapshot(): Promise<ProgressSnapshot> {
  const response = await fetch('/api/progress', { credentials: 'include' });
  return parseJson<ProgressSnapshot>(response);
}

export async function patchProgress(body: Record<string, unknown>): Promise<ProgressSnapshot> {
  const response = await fetch('/api/progress', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson<ProgressSnapshot>(response);
}

export async function migrateLocalProgress(progress: TopicProgressMap): Promise<ProgressSnapshot> {
  const response = await fetch('/api/progress/migrate', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress }),
  });
  return parseJson<ProgressSnapshot>(response);
}

export interface PracticeAttemptInput {
  topicPath: string;
  kind: 'challenge' | 'prediction' | 'qa';
  promptId: string;
  passed: boolean;
}

export async function recordPracticeAttempt(input: PracticeAttemptInput): Promise<boolean> {
  const response = await fetch('/api/progress/attempts', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.ok;
}

export async function fetchPracticeAttempts(topicPath: string) {
  const response = await fetch(`/api/progress/attempts?topicPath=${encodeURIComponent(topicPath)}`, {
    credentials: 'include',
  });
  return parseJson<{
    attempts: Array<{
      id: string;
      topicPath: string;
      kind: string;
      promptId: string;
      passed: boolean;
      createdAt: string;
    }>;
  }>(response);
}
