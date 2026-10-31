import Link from 'next/link';
import { Check, ChevronLeft, X } from 'lucide-react';
import type { MockPack } from '@/lib/mocks/mock-session';
import {
  RUBRIC_DIMENSIONS,
  scoreRubric,
} from '@/lib/mocks/mock-session';
import type { MockSessionDto } from '@/lib/mocks/mock-dto';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Results view for a finished mock (spec 0003). Purely presentational:
 * the summary comes from the single scoring implementation in
 * mock-session.ts, never from a local copy of the rules. Every score
 * display is labeled self-assessment; nothing here is a grade, a
 * pass, or a hiring signal.
 */
export function MockResultsView({
  session,
  pack,
}: {
  session: MockSessionDto;
  pack: MockPack;
}) {
  const summary = scoreRubric(session.answers, pack.questions);

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 cursor-pointer gap-1">
          <Link href="/mocks">
            <ChevronLeft className="size-4" />
            Back to mock history
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{pack.title} — review</h1>
          {session.status === 'timed_out' ? (
            <Badge variant="outline" className="text-destructive">
              Timed out
            </Badge>
          ) : (
            <Badge variant="secondary">Submitted</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Started {formatDate(session.startedAt)}
          {session.submittedAt ? ` · Finished ${formatDate(session.submittedAt)}` : ''}
          {session.status === 'timed_out'
            ? ' · Time ran out, so whatever was saved was submitted as-is.'
            : ''}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Self-assessment — these scores are your own ratings, not a grade, a pass, or a hiring
          signal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rubric summary (self-assessment)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Overall: <span className="font-semibold">{summary.total}/{summary.max}</span>
            {' · '}
            Band: <span className="font-semibold">{summary.band}</span>
          </p>
          <ul className="space-y-1">
            {RUBRIC_DIMENSIONS.map((dimension) => {
              const row = summary.perDimension[dimension.id];
              return (
                <li key={dimension.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{dimension.label}</span>
                  <span className="font-medium">
                    {row.scored}/{row.max}
                  </span>
                </li>
              );
            })}
          </ul>
          {summary.max === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rubric scores were saved, so there is nothing to total. Unanswered and unscored
              questions lower nothing.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ol className="space-y-6">
        {pack.questions.map((question, index) => {
          const answer = session.answers[question.id];
          return (
            <li key={question.id}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <CardTitle className="min-w-0 flex-1 text-base leading-snug">
                    {index + 1}. {question.title}
                  </CardTitle>
                  <Badge variant="outline" className="shrink-0 whitespace-nowrap">
                    {question.kind === 'coding' ? 'Coding' : 'Spoken'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {answer ? (
                    <>
                      {question.kind === 'coding' && answer.code ? (
                        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                          {answer.code}
                        </pre>
                      ) : null}
                      {question.kind === 'spoken' && answer.text ? (
                        <p className="whitespace-pre-wrap text-sm">{answer.text}</p>
                      ) : null}
                      {answer.recording ? (
                        <p className="text-sm text-muted-foreground">
                          Recording attached: {answer.recording.durationSeconds}s. The audio itself
                          stays in the browser session where it was recorded; refreshing the page
                          loses the clip, but the recording details stay saved.
                        </p>
                      ) : null}
                      {answer.tests ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Reported test results:{' '}
                            {answer.tests.filter((t) => t.passed).length}/{answer.tests.length}{' '}
                            passed
                          </p>
                          <ul className="space-y-1">
                            {answer.tests.map((test) => (
                              <li key={test.index} className="flex items-start gap-2 text-sm">
                                {test.passed ? (
                                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                ) : (
                                  <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                                )}
                                <span>
                                  Test {test.index}: {test.label}
                                  {test.message ? ` — ${test.message}` : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {answer.rubric ? (
                        <ul className="space-y-1">
                          {RUBRIC_DIMENSIONS.map((dimension) => {
                            const value = answer.rubric?.[dimension.id];
                            return (
                              <li key={dimension.id} className="flex justify-between gap-4 text-sm">
                                <span className="text-muted-foreground">{dimension.label}</span>
                                <span className="font-medium">
                                  {value === undefined ? '—' : `${value}/2`}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No rubric scores saved for this answer.
                        </p>
                      )}
                      {answer.note ? (
                        <p className="text-sm text-muted-foreground">Note: {answer.note}</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not answered — it changes no number.
                    </p>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
