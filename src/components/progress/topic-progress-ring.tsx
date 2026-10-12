'use client';

import { cn } from '@/lib/utils';

export interface TopicProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function TopicProgressRing({
  value,
  size = 20,
  strokeWidth = 2.5,
  className,
  label,
}: TopicProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      title={label ?? `${clamped}%`}
      aria-label={label ?? `${clamped}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/25"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            clamped >= 100 ? 'text-green-600 dark:text-green-400' : 'text-primary',
          )}
        />
      </svg>
      {clamped >= 100 ? (
        <span className="absolute text-[9px] font-bold text-green-600 dark:text-green-400">
          ✓
        </span>
      ) : null}
    </span>
  );
}
