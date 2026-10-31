import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/require-auth';
import { mockService } from '@/lib/mocks/mock-service';
import { getMockPack, MOCK_PACKS } from '@/lib/mocks/mock-packs';
import { scoreRubric } from '@/lib/mocks/mock-session';
import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { MockStartForm } from '@/components/mocks/mock-start-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = buildPageMetadata({
  title: 'Mock interviews',
  description: 'Timed mock interviews with self-assessment.',
  path: '/mocks',
  noIndex: true,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Mock history + start (spec 0003). Server component: the list loads
 * through the mock service, scoped to the signed-in user, never
 * through a shared client cache. Signed-out visitors are sent to
 * sign in. Band is computed with the single scoring implementation
 * from mock-session.ts.
 */
export default async function MocksPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const rows = await mockService.listSessions(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Mock interviews</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Timed practice under pressure: coding tasks and spoken questions against a countdown,
        scored by you on a five-dimension rubric. Practice, not a proctored exam.
      </p>

      <div className="mt-8">
        <MockStartForm packs={MOCK_PACKS} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">History</h2>
      {rows.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No mocks yet. Start your first timed mock above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => {
            const pack = getMockPack(row.packId);
            const summary =
              row.status === 'in_progress' || !pack
                ? null
                : scoreRubric(row.answers, pack.questions);
            return (
              <li key={row.id}>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <CardTitle className="min-w-0 flex-1 text-base leading-snug">
                      {pack?.title ?? row.packId}
                    </CardTitle>
                    {row.status === 'timed_out' ? (
                      <Badge
                        variant="outline"
                        className="shrink-0 whitespace-nowrap text-destructive"
                      >
                        Timed out
                      </Badge>
                    ) : row.status === 'submitted' ? (
                      <Badge variant="secondary" className="shrink-0 whitespace-nowrap">
                        Submitted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 whitespace-nowrap">
                        In progress
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Started {formatDate(row.startedAt.toISOString())} · {row.durationMinutes}{' '}
                      minutes
                      {summary ? ` · Self-assessment band: ${summary.band}` : ''}
                    </p>
                    <Button asChild size="sm" className="cursor-pointer">
                      <Link href={`/mocks/${row.id}`}>
                        {row.status === 'in_progress' ? 'Resume' : 'Review'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
