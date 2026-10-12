'use client';

import Link from 'next/link';
import { TopicProgressRing } from '@/components/progress/topic-progress-ring';
import { useTopicIndex } from '@/components/curriculum/topic-index-context';
import { getTrackMasteryPercent } from '@/lib/progress/mastery-rules';
import { useProgressEnabled, useTopicProgressMap } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export interface CrossTrackProgressProps {
  compact?: boolean;
  selectedTrack?: string;
  tracks: Array<{ slug: string; title: string; href: string }>;
}

export function CrossTrackProgress({ compact, selectedTrack, tracks }: CrossTrackProgressProps) {
  const { enabled } = useProgressEnabled();
  const progressMap = useTopicProgressMap();
  const index = useTopicIndex();

  if (!enabled || tracks.length < 2) return null;

  return (
    <div className={cn('border-b', compact ? 'px-2 py-3' : 'px-4 py-4')}>
      {!compact ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Track progress
        </p>
      ) : null}
      <ul className="space-y-2">
        {tracks.map((track) => {
          const percent = getTrackMasteryPercent(index, track.slug, progressMap);
          const isSelected = selectedTrack === track.slug;

          return (
            <li key={track.slug}>
              <Link
                href={track.href}
                title={`${track.title} — ${percent}% mastered`}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md text-xs transition-colors',
                  compact ? 'justify-center p-1.5' : 'px-2 py-1.5',
                  isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <TopicProgressRing value={percent} size={compact ? 18 : 20} strokeWidth={2} />
                {!compact ? (
                  <>
                    <span className="min-w-0 flex-1 truncate">{track.title}</span>
                    <span className="tabular-nums">{percent}%</span>
                  </>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
