'use client';

import Link from 'next/link';
import {
  BookOpen,
  Braces,
  ChevronLeft,
  Clock,
  Database,
  Globe,
  Hexagon,
  Layers,
  Package,
  Route,
  Server,
  Table,
  Zap,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserAuthNav } from '@/components/auth/user-auth-nav';
import { CrossTrackProgress } from '@/components/progress/cross-track-progress';
import { ReadinessDashboard } from '@/components/progress/readiness-dashboard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { MainSidebarMode } from '@/hooks/use-learn-sidebar';

const iconMap = {
  BookOpen,
  Braces,
  Layers,
  Package,
  Globe,
  Server,
  Route,
  Zap,
  Database,
  Table,
  Hexagon,
} as const;

export interface MainSidebarProps {
  mode: MainSidebarMode;
  selectedTrack: string;
  tracks: Array<{ id: string; title: string; icon: string; href: string }>;
  onCollapse: () => void;
}

export function MainSidebar({ mode, selectedTrack, tracks, onCollapse }: MainSidebarProps) {
  if (mode === 'hidden') return null;

  const isRail = mode === 'rail';

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r bg-muted/30 transition-[width] duration-200 ease-in-out',
        isRail ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      <div className={cn('flex items-start border-b', isRail ? 'justify-center p-3' : 'justify-between p-6')}>
        {isRail ? (
          <Link
            href="/learn/javascript"
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-muted"
            title="Interview Prep"
          >
            <BookOpen className="size-5" />
          </Link>
        ) : (
          <>
            <Link href="/learn/javascript" className="min-w-0 flex-1 cursor-pointer">
              <h1 className="text-xl font-semibold tracking-tight">Interview Prep</h1>
              <p className="mt-1 text-sm text-muted-foreground">Full-stack mastery</p>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 cursor-pointer"
              onClick={onCollapse}
              aria-label="Collapse tracks to icons"
              title="Collapse to icons"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <CrossTrackProgress
          compact={isRail}
          selectedTrack={selectedTrack}
          tracks={tracks.map((track) => ({ slug: track.id, title: track.title, href: track.href }))}
        />
        <ReadinessDashboard
          compact={isRail}
          tracks={tracks.map((track) => ({ slug: track.id, title: track.title }))}
        />
        <nav className={cn('space-y-1', isRail ? 'p-2' : 'p-4')}>
          {!isRail ? (
            <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tracks
            </p>
          ) : null}
          {tracks.map((track) => {
            const Icon = iconMap[track.icon as keyof typeof iconMap] ?? BookOpen;
            return (
              <Link
                key={track.id}
                href={track.href}
                title={track.title}
                className={cn(
                  'flex w-full cursor-pointer items-center rounded-lg text-sm font-medium transition-colors',
                  isRail ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left',
                  selectedTrack === track.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <Icon className="size-5 shrink-0" />
                {!isRail && <span>{track.title}</span>}
              </Link>
            );
          })}
          <Separator className={cn(isRail ? 'my-2' : 'my-3')} />
          <Link
            href="/review"
            title="Due for review"
            className={cn(
              'flex w-full cursor-pointer items-center rounded-lg text-sm font-medium transition-colors',
              isRail ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left',
              'text-foreground hover:bg-muted',
            )}
          >
            <Clock className="size-5 shrink-0" />
            {!isRail && <span>Due for review</span>}
          </Link>
        </nav>
      </ScrollArea>

      <div
        className={cn(
          'flex flex-col gap-3 border-t',
          isRail ? 'items-center p-3' : 'p-4',
        )}
      >
        <UserAuthNav compact={isRail} />
        <div className={cn('flex items-center', isRail ? 'justify-center' : 'justify-between')}>
          {!isRail && <span className="text-xs text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
