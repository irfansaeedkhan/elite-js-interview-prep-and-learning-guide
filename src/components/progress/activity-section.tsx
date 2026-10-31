'use client';

import { useQuery } from '@tanstack/react-query';
import { useProgressEnabled } from '@/hooks/use-topic-progress';
import { fetchActivity, fetchBadges } from '@/lib/progress/progress-api-client';
import { ActivityHeatmap } from '@/components/progress/activity-heatmap';
import { AchievementBadges } from '@/components/progress/achievement-badges';

/**
 * Signed-in activity section on the track landing area. Returns null for
 * signed-out visitors, so the landing view is unchanged for them, and null
 * on fetch errors, so a progress outage never breaks the learning area.
 */
export function ActivitySection() {
  const { enabled } = useProgressEnabled();
  const activityQuery = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const badgesQuery = useQuery({
    queryKey: ['badges'],
    queryFn: fetchBadges,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  if (!enabled) return null;

  if (activityQuery.isPending || badgesQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-10">
        <p className="text-sm text-muted-foreground">Loading your activity…</p>
      </div>
    );
  }

  if (
    activityQuery.error ||
    badgesQuery.error ||
    !activityQuery.data ||
    !badgesQuery.data
  ) {
    return null;
  }

  const { weeks, days, weeklyGoal } = activityQuery.data;
  const totalAttempts = days.reduce((total, day) => total + day.count, 0);

  return (
    <section
      className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-10"
      aria-label="Your activity and badges"
    >
      <div>
        <h2 className="text-lg font-semibold">Your activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This week: {weeklyGoal.currentWeekActiveDays} of {weeklyGoal.targetDaysPerWeek} active
          days · {weeklyGoal.goalWeeks} steady weeks so far. Missed days never erase your record.
        </p>
        <div className="mt-4">
          <ActivityHeatmap weeks={weeks} totalAttempts={totalAttempts} />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="mt-3">
          <AchievementBadges badges={badgesQuery.data.badges} />
        </div>
      </div>
    </section>
  );
}
