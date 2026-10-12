'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VeliteTopic } from '@/components/curriculum/topic-context';
import { getAdjacentTopics } from '@/lib/curriculum/get-topics';
import { getLearnSettings, isTopicMastered } from '@/lib/progress/mastery';
import { useProgressEnabled, useTopicProgressMap } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export interface TopicNavProps {
  track: string;
  topic: VeliteTopic;
}

export function TopicNav({ track, topic }: TopicNavProps) {
  const { enabled: progressEnabled } = useProgressEnabled();
  const progressMap = useTopicProgressMap();
  const { prev, next } = getAdjacentTopics(track, topic.path);
  const currentMastered = progressEnabled && isTopicMastered(topic.path, progressMap);
  const hardLock = progressEnabled && getLearnSettings().hardLock;
  const nextBlocked = Boolean(next && !currentMastered && hardLock);

  if (!prev && !next) return null;

  return (
    <nav className="mt-12 flex flex-col gap-3 border-t pt-8" aria-label="Topic navigation">
      {progressEnabled && !currentMastered && next ? (
        <p className="text-sm text-muted-foreground">
          Master this topic (Q&amp;A &quot;Got it&quot; scores
          {topic.masteryCriteria.requireChallenge ? ' + challenge' : ''}) before moving on.
          {hardLock ? ' Next topic is locked until then.' : ''}
        </p>
      ) : null}

      <div className="flex items-stretch justify-between gap-4">
        {prev ? (
          <Button variant="outline" className="h-auto flex-1 cursor-pointer justify-start py-4" asChild>
            <Link href={prev.permalink}>
              <ChevronLeft className="size-4 shrink-0" />
              <span className="text-left">
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="block font-medium">{prev.title}</span>
              </span>
            </Link>
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          nextBlocked ? (
            <Button
              variant="outline"
              disabled
              className={cn('h-auto flex-1 cursor-not-allowed justify-end py-4 opacity-60')}
            >
              <span className="text-right">
                <span className="block text-xs text-muted-foreground">Next — locked</span>
                <span className="block font-medium">{next.title}</span>
              </span>
              <Lock className="size-4 shrink-0" />
            </Button>
          ) : (
            <Button variant="outline" className="h-auto flex-1 cursor-pointer justify-end py-4" asChild>
              <Link href={next.permalink}>
                <span className="text-right">
                  <span className="block text-xs text-muted-foreground">Next</span>
                  <span className="block font-medium">{next.title}</span>
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </Link>
            </Button>
          )
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
