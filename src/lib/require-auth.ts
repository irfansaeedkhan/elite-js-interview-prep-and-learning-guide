import { headers } from 'next/headers';
import { auth, type Session } from '@/lib/auth';
import { ApiError } from '@/lib/api-error';

export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session?.user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
  }
  return session;
}
