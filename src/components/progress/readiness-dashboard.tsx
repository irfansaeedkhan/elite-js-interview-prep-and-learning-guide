'use client';

import Link from 'next/link';
import { useTopicIndex } from '@/components/curriculum/topic-index-context';
import { getReadinessReport } from '@/lib/progress/readiness';
import { useProgressEnabled, useTopicProgressMap } from '@/hooks/use-topic-progress';

export interface ReadinessDashboardProps {
  compact?: boolean;
  tracks: Array<{ slug: string; title: string }>;
}

/**
 * Readiness dashboard (gap 5). One glance, one next action: overall
 * readiness estimate, per-track readiness, the weakest topics, and the
 * single study-next recommendation. Computes from the progress snapshot
 * the shell already has, so it adds no request. Null when progress is
 * disabled (signed out) and in rail mode, matching CrossTrackProgress.
 */
export function ReadinessDashboard({ compact, tracks }: ReadinessDashboardProps) {
  const { enabled } = useProgressEnabled();
  const progressMap = useTopicProgressMap();
  const index = useTopicIndex();

  if (!enabled || compact) return null;

  const report = getReadinessReport(index, progressMap);
  const titleFor = (slug: string) => tracks.find((t) => t.slug === slug)?.title ?? slug;
  const masteredTotal = report.perTrack.reduce((sum, row) => sum + row.mastered, 0);
  const topicTotal = report.perTrack.reduce((sum, row) => sum + row.total, 0);
  const allMastered = topicTotal > 0 && masteredTotal === topicTotal;

  return (
    <div className="border-b px-4 py-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Readiness
      </p>

      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{report.readiness}%</span>
        <span className="text-xs text-muted-foreground">{report.readinessBand}</span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Estimate based on your topic progress, not a guarantee.
      </p>

      <ul className="mb-4 space-y-1.5">
        {report.perTrack.map((row) => (
          <li key={row.track} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{titleFor(row.track)}</span>
            <span className="tabular-nums">
              {row.readiness}% <span className="text-muted-foreground">· {row.mastered}/{row.total}</span>
            </span>
          </li>
        ))}
      </ul>

      {report.studyNext ? (
        <Link
          href={report.studyNext.permalink}
          className="mb-4 block rounded-md bg-primary/10 px-3 py-2.5 transition-colors hover:bg-primary/15"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            Study next
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-primary">
            {report.studyNext.title}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{report.studyNext.reason}</span>
        </Link>
      ) : (
        <p className="mb-4 rounded-md bg-muted px-3 py-2.5 text-xs text-muted-foreground">
          {allMastered
            ? 'All published topics mastered — time to practise interviews.'
            : 'No open topic right now — finish prerequisites to unlock the next one.'}
        </p>
      )}

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Weakest topics
      </p>
      {report.weakest.length > 0 ? (
        <ul className="space-y-1.5">
          {report.weakest.map((row) => (
            <li key={row.path}>
              <Link
                href={row.permalink}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted"
              >
                <span className="min-w-0 flex-1 truncate">{row.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {row.percent}%
                  {row.reviewCount > 0 ? ` · ${row.reviewCount} to review` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          No weak spots yet — start a topic and they will show up here.
        </p>
      )}
    </div>
  );
}
