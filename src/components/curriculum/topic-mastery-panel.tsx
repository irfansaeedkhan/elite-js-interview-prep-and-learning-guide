'use client';

import Link from 'next/link';
import { Lock, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTopicIndex } from '@/components/curriculum/topic-index-context';
import { useTopicOptional } from '@/components/curriculum/topic-context';
import {
  countKnowAnswers,
  getUnmetPrerequisites,
  isTopicMastered,
} from '@/lib/progress/mastery-rules';
import { useProgressEnabled, useTopicProgressMap } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export function TopicMasteryPanel() {
  const topic = useTopicOptional();
  const index = useTopicIndex();
  const { enabled: progressEnabled } = useProgressEnabled();
  const progressMap = useTopicProgressMap();

  if (!topic) return null;

  if (!progressEnabled) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <h3 className="text-sm font-semibold">Track your mastery</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to save Q&amp;A scores, coding challenge progress, points, and streaks across devices.
        </p>
        <Button variant="outline" size="sm" className="mt-4 cursor-pointer" asChild>
          <Link href="/login">Sign in to save progress</Link>
        </Button>
      </div>
    );
  }

  const entry = progressMap[topic.path];
  const knowCount = countKnowAnswers(topic.path, progressMap);
  const { minQuestionsCorrect, requireChallenge } = topic.masteryCriteria;
  const mastered = isTopicMastered(index, topic.path, progressMap);
  const unmet = getUnmetPrerequisites(index, topic.path, progressMap);

  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        mastered ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-muted/20',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {mastered ? <Trophy className="size-4 text-green-600 dark:text-green-400" /> : null}
            <h3 className="text-sm font-semibold">
              {mastered ? 'Topic mastered' : 'Mastery progress'}
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark interview questions as &quot;Got it&quot; in the Q&amp;A tab
            {requireChallenge ? ' and pass the coding challenge' : ''} to master this topic.
          </p>
        </div>
        {mastered ? (
          <Badge variant="outline" className="border-green-500/30 text-green-700 dark:text-green-400">
            Mastered
          </Badge>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Interview Q&amp;A</span>
          <span className="font-medium tabular-nums">
            {knowCount} / {minQuestionsCorrect} &quot;Got it&quot;
          </span>
        </li>
        {requireChallenge ? (
          <li className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Coding challenge</span>
            <span className="font-medium">
              {entry?.challengePassed ? 'Passed' : 'Not passed yet'}
            </span>
          </li>
        ) : null}
      </ul>

      {unmet.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          <p className="flex items-center gap-2 font-medium">
            <Lock className="size-3.5 shrink-0" />
            Complete these prerequisites first
          </p>
          <ul className="mt-2 space-y-1 pl-5">
            {unmet.map((t) => (
              <li key={t.path}>
                <Link href={t.permalink} className="underline-offset-2 hover:underline">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
