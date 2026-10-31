import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/require-auth';
import { mockService } from '@/lib/mocks/mock-service';
import { getMockPack } from '@/lib/mocks/mock-packs';
import { mockSessionToDto } from '@/lib/mocks/mock-dto';
import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { MockResultsView } from '@/components/mocks/mock-results-view';
import { MockSessionClient } from '@/components/mocks/mock-session-client';

export const metadata = buildPageMetadata({
  title: 'Mock session',
  description: 'A timed mock interview session.',
  path: '/mocks',
  noIndex: true,
});

/**
 * Mock session route (spec 0003). Server component: it loads the
 * caller's own session and branches on status — the live session UI
 * while in progress, the results view once finished. A session id
 * from another user resolves to 404, never to data, because the
 * service scopes every lookup to the session user. Signed-out
 * visitors are sent to sign in.
 */
export default async function MockSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const row = await mockService.getSession(session.user.id, id);
  if (!row) {
    notFound();
  }
  const pack = getMockPack(row.packId);
  if (!pack) {
    notFound();
  }

  const dto = mockSessionToDto(row);
  const terminal = row.status === 'submitted' || row.status === 'timed_out';

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      {terminal ? (
        <MockResultsView session={dto} pack={pack} />
      ) : (
        <MockSessionClient session={dto} pack={pack} />
      )}
    </main>
  );
}
