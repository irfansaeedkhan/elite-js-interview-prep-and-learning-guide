'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopicProgressRing } from '@/components/progress/topic-progress-ring';
import { getLearnSettings } from '@/lib/progress/learn-settings';
import {
  canAccessTopic,
  getTopicProgressPercent,
  getTrackMasteryPercent,
  isTopicMastered,
} from '@/lib/progress/mastery-rules';
import { useTopicIndex } from '@/components/curriculum/topic-index-context';
import { useProgressEnabled, useTopicProgressMap } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';
import type { NavSubCategory } from '@/lib/curriculum/get-topics';
import type { TopicsSidebarMode } from '@/hooks/use-learn-sidebar';

export interface SubSidebarProps {
  mode: TopicsSidebarMode;
  subCategories: NavSubCategory[];
  selectedTopicSlug: string;
  activeSubCategory: string;
  track: string;
  onClose: () => void;
}

export function SubSidebar({
  mode,
  subCategories,
  selectedTopicSlug,
  activeSubCategory,
  track,
  onClose,
}: SubSidebarProps) {
  const index = useTopicIndex();
  const { enabled: progressEnabled } = useProgressEnabled();
  const progressMap = useTopicProgressMap();
  const [hardLock, setHardLock] = useState(false);
  const trackPercent = progressEnabled ? getTrackMasteryPercent(index, track, progressMap) : 0;

  useEffect(() => {
    if (progressEnabled) {
      setHardLock(getLearnSettings().hardLock);
    }
  }, [progressEnabled]);

  const [openCategories, setOpenCategories] = useState<string[]>(() =>
    subCategories.map((sub) => sub.id),
  );

  useEffect(() => {
    if (activeSubCategory && !openCategories.includes(activeSubCategory)) {
      setOpenCategories((prev) => [...prev, activeSubCategory]);
    }
  }, [activeSubCategory, openCategories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  if (mode === 'hidden') return null;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-background transition-[width,opacity] duration-200 ease-in-out">
      <div className="flex items-start justify-between border-b p-6">
        <div>
          <div className="flex items-center gap-2">
            {progressEnabled ? (
              <TopicProgressRing value={trackPercent} size={22} label={`Track ${trackPercent}% mastered`} />
            ) : null}
            <h2 className="text-lg font-semibold">Topics</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {progressEnabled ? `${trackPercent}% mastered · ` : ''}in learning order
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 cursor-pointer"
          onClick={onClose}
          aria-label="Hide topics sidebar"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-2 p-4">
          {subCategories.map((subCategory) => (
            <Collapsible
              key={subCategory.id}
              open={openCategories.includes(subCategory.id)}
              onOpenChange={() => toggleCategory(subCategory.id)}
            >
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                <span>{subCategory.title}</span>
                <ChevronRight
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    openCategories.includes(subCategory.id) && 'rotate-90',
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-1 space-y-1 pl-1">
                {subCategory.topics.map((topic) => {
                  const mastered = progressEnabled && isTopicMastered(index, topic.path, progressMap);
                  const accessible = !progressEnabled || canAccessTopic(index, topic.path, progressMap);
                  const blocked = progressEnabled && hardLock && !accessible;
                  const percent = progressEnabled ? getTopicProgressPercent(index, topic.path, progressMap) : 0;

                  const linkClass = cn(
                    'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-5 py-2 text-left text-sm transition-colors',
                    selectedTopicSlug === topic.id
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    blocked && 'pointer-events-none opacity-50',
                  );

                  const inner = (
                    <>
                      <span className="flex min-w-0 items-center gap-2">
                        {progressEnabled ? (
                          <TopicProgressRing
                            value={mastered ? 100 : percent}
                            size={18}
                            strokeWidth={2}
                            className="shrink-0"
                          />
                        ) : null}
                        <span className="truncate">{topic.title}</span>
                        {progressEnabled && !accessible && !mastered ? (
                          <Lock className="size-3 shrink-0 opacity-60" aria-hidden />
                        ) : null}
                      </span>
                      {topic.status === 'preview' ? (
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          Preview
                        </Badge>
                      ) : mastered ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-green-500/30 text-[10px] text-green-700 dark:text-green-400"
                        >
                          Mastered
                        </Badge>
                      ) : null}
                    </>
                  );

                  return blocked ? (
                    <div key={`${subCategory.id}-${topic.href}`} className={linkClass} title="Complete prerequisites first">
                      {inner}
                    </div>
                  ) : (
                    <Link key={`${subCategory.id}-${topic.href}`} href={topic.href} className={linkClass}>
                      {inner}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
