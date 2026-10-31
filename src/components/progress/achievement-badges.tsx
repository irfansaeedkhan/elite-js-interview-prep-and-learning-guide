import { BookOpen, Flame, Lock, Play, Star, Trophy } from 'lucide-react';
import type { BadgeItem } from '@/lib/progress/progress-api-client';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  first: BookOpen,
  streak: Flame,
  mastery: Trophy,
  practice: Play,
  points: Star,
  consistency: Flame,
} as const;

/**
 * Achievement badge shelf. Earned badges show their icon in color with the
 * date earned; locked badges stay muted with a lock, never hidden, so the
 * shelf reads as a record, not a judgement. No animation, no confetti:
 * earned, not noisy.
 */
export function AchievementBadges({ badges }: { badges: BadgeItem[] }) {
  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {earnedCount} of {badges.length} earned
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => {
          const Icon = badge.earned ? CATEGORY_ICONS[badge.category] : Lock;
          return (
            <li
              key={badge.id}
              className={cn(
                'rounded-xl border p-4',
                badge.earned ? 'border-border bg-muted/20' : 'border-border bg-background opacity-70',
              )}
            >
              <Icon
                className={cn(
                  'size-5',
                  badge.earned ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                )}
              />
              <p className="mt-2 text-sm font-semibold">{badge.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{badge.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {badge.earned
                  ? badge.earnedAt
                    ? `Earned ${badge.earnedAt.slice(0, 10)}`
                    : 'Earned'
                  : 'Not yet earned'}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
