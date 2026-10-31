import type { ActivityWeekCell } from '@/lib/progress/progress-api-client';
import { cn } from '@/lib/utils';

const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function intensityClass(count: number): string {
  if (count <= 0) return 'bg-muted';
  if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900';
  if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700';
  return 'bg-emerald-600 dark:bg-emerald-500';
}

function cellLabel(cell: ActivityWeekCell): string {
  if (cell.date === null) return '';
  if (cell.count === 0) return `No activity on ${cell.date}`;
  return `${cell.count} practice attempt${cell.count === 1 ? '' : 's'} on ${cell.date}`;
}

/**
 * GitHub-style activity grid: one column per Monday-first week, one row per
 * weekday. Presentational only; data comes from /api/progress/activity.
 * Days are UTC calendar days, and a cell counts every practice attempt on
 * that day, passed or not, because a failed attempt is still practice.
 */
export function ActivityHeatmap({
  weeks,
  totalAttempts,
}: {
  weeks: ActivityWeekCell[][];
  totalAttempts: number;
}) {
  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div
          className="flex gap-[3px]"
          role="img"
          aria-label={`Activity heatmap, ${totalAttempts} practice attempts in the last 26 weeks`}
        >
          <div className="mr-1 flex flex-col gap-[3px]" aria-hidden="true">
            {ROW_LABELS.map((label, index) => (
              <span
                key={index}
                className="flex h-3 items-center text-[10px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((cell, cellIndex) =>
                cell.date === null ? (
                  <span key={cellIndex} className="size-3" aria-hidden="true" />
                ) : (
                  <span
                    key={cellIndex}
                    title={cellLabel(cell)}
                    aria-label={cellLabel(cell)}
                    className={cn('size-3 rounded-[3px]', intensityClass(cell.count))}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{totalAttempts} practice attempts in the last 26 weeks</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          Less
          <span className="size-3 rounded-[3px] bg-muted" />
          <span className="size-3 rounded-[3px] bg-emerald-200 dark:bg-emerald-900" />
          <span className="size-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-700" />
          <span className="size-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-500" />
          More
        </span>
      </div>
    </div>
  );
}
