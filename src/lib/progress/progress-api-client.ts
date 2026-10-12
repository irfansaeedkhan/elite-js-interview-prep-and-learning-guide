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
