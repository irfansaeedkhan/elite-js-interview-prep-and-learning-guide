'use client';

import Link from 'next/link';
import { Flame, LogIn, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth-client';
import { useUserStats } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export interface UserAuthNavProps {
  compact?: boolean;
}

export function UserAuthNav({ compact }: UserAuthNavProps) {
  const { data: session, isPending } = useSession();
  const { stats, enabled } = useUserStats();

  if (isPending) {
    return compact ? null : <div className="h-9" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Button variant="outline" size={compact ? 'icon' : 'sm'} className={cn(compact && 'size-9')} asChild>
        <Link href="/login" title="Sign in to save progress">
          {compact ? <LogIn className="size-4" /> : 'Sign in'}
        </Link>
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', compact ? 'flex-col' : 'flex-wrap')}>
      {enabled && stats ? (
        <div
          className={cn(
            'flex items-center gap-3 text-xs text-muted-foreground',
            compact && 'flex-col gap-1',
          )}
          title="Your learning stats"
        >
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="size-3.5" />
            {stats.points} pts
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Flame className="size-3.5" />
            {stats.currentStreak}d
          </span>
        </div>
      ) : null}
      {!compact ? (
        <span className="max-w-[8rem] truncate text-xs text-muted-foreground" title={session.user.email}>
          {session.user.name}
        </span>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size={compact ? 'icon' : 'sm'}
        className={cn('cursor-pointer', compact && 'size-9')}
        onClick={() => signOut()}
        title="Sign out"
      >
        <LogOut className="size-4" />
        {!compact ? <span className="sr-only">Sign out</span> : null}
      </Button>
    </div>
  );
}
