import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { topics } from '#site/content';
import { getSession } from '@/lib/require-auth';
import { reviewService } from '@/lib/progress/review-service';
import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = buildPageMetadata({
  title: 'Due for review',
  description: 'Cards due for spaced review, weakest first.',
  path: '/review',
  noIndex: true,
});

/**
 * Due-review queue (gap 2, Wave 1). Server component: the queue is
 * per-user, so it loads through the review service, never through a
 * shared client cache. Signed-out visitors are sent to sign in.
 *
 * Each row links back to its topic page, where grading the card with
 * the existing "Got it" / "Review later" buttons reschedules it: a
 * finished session clears this queue to zero. Deep-linking to the
 * exact card inside the topic page is future work; the topic link is
 * the v1 path.
 */
export default async function ReviewPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const { items, counts } = await reviewService.getDueQueue(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 cursor-pointer gap-1">
        <Link href="/learn/javascript">
          <ChevronLeft className="size-4" />
          Back to learning
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Due for review</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {counts.due === 0
          ? 'Nothing is due right now. New cards join this queue the first time you grade them.'
          : `${counts.due} card${counts.due === 1 ? '' : 's'} due${counts.overdue > 0 ? `, ${counts.overdue} overdue` : ''}${counts.weakDue > 0 ? `, ${counts.weakDue} needing another look. Weak cards come first` : ''}.`}
      </p>

      {items.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Keep learning and cards you grade will come back here on their schedule.
            </p>
            <Button asChild className="mt-4 cursor-pointer">
              <Link href="/learn/javascript">Continue learning</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((entry) => {
            const topic = topics.find((t) => t.path === entry.topicPath) as
              | { title?: string; interviewQuestions?: Array<{ id: string; question: string }> }
              | undefined;
            const question = topic?.interviewQuestions?.find((q) => q.id === entry.promptId);
            return (
              <li key={`${entry.topicPath}:${entry.promptId}`}>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <CardTitle className="min-w-0 flex-1 text-base leading-snug">
                      {question?.question ?? entry.promptId}
                    </CardTitle>
                    {entry.lastResult === 'review' ? (
                      <Badge variant="outline" className="shrink-0 whitespace-nowrap">
                        Needs another look
                      </Badge>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {topic?.title ?? entry.topicPath}
                      {' · '}
                      {entry.overdueDays > 0
                        ? `Overdue by ${entry.overdueDays} day${entry.overdueDays === 1 ? '' : 's'}`
                        : 'Due now'}
                    </p>
                    <Button asChild size="sm" className="cursor-pointer">
                      <Link
                        href={`/learn/${entry.topicPath}`}
                        aria-label={`Review: ${question?.question ?? entry.promptId}`}
                      >
                        Review
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
