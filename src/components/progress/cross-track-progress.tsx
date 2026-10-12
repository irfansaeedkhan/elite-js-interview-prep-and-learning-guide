'use client';

import Link from 'next/link';
import { TopicProgressRing } from '@/components/progress/topic-progress-ring';
import { getActiveTracks, getDefaultTrackHref } from '@/lib/curriculum/get-topics';
import { getTrackMasteryPercent } from '@/lib/progress/mastery';
import { useProgressEnabled, useTopicProgressMap } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export interface CrossTrackProgressProps {
  compact?: boolean;
  selectedTrack?: string;
}

export function CrossTrackProgress({ compact, selectedTrack }: CrossTrackProgressProps) {
  const { enabled } = useProgressEnabled();
  const progressMap = useTopicProgressMap();
  const activeTracks = getActiveTracks();

  if (!enabled || activeTracks.length < 2) return null;

  return (
    <div className={cn('border-b', compact ? 'px-2 py-3' : 'px-4 py-4')}>
      {!compact ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Track progress
        </p>
      ) : null}
      <ul className="space-y-2">
        {activeTracks.map((track) => {
          const percent = getTrackMasteryPercent(track.slug, progressMap);
          const href = getDefaultTrackHref(track.slug);
          const isSelected = selectedTrack === track.slug;

          return (
            <li key={track.slug}>
              <Link
                href={href}
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
