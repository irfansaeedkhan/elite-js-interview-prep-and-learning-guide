'use client';

import { LayoutList, PanelLeft, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MainSidebarMode, TopicsSidebarMode } from '@/hooks/use-learn-sidebar';

export interface LearnSidebarToolbarProps {
  mainMode: MainSidebarMode;
  topicsMode: TopicsSidebarMode;
  onHideMain: () => void;
  onShowMain: () => void;
  onHideTopics: () => void;
  onShowTopics: () => void;
}

export function LearnSidebarToolbar({
  mainMode,
  topicsMode,
  onHideMain,
  onShowMain,
  onHideTopics,
  onShowTopics,
}: LearnSidebarToolbarProps) {
  const mainHidden = mainMode === 'hidden';
  const topicsHidden = topicsMode === 'hidden';

  return (
    <div className="flex shrink-0 items-center gap-1 border-b bg-muted/20 px-3 py-2">
      {mainHidden ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer gap-2"
          onClick={onShowMain}
          aria-label="Show tracks sidebar"
        >
          <PanelLeftOpen className="size-4" />
          <span className="hidden sm:inline">Tracks</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer gap-2"
          onClick={onHideMain}
          aria-label="Hide tracks sidebar"
        >
          <PanelLeft className="size-4" />
          <span className="hidden sm:inline">Hide tracks</span>
        </Button>
      )}

      {topicsHidden ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer gap-2"
          onClick={onShowTopics}
          aria-label="Show topics sidebar"
        >
          <LayoutList className="size-4" />
          <span className="hidden sm:inline">Topics</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer gap-2"
          onClick={onHideTopics}
          aria-label="Hide topics sidebar"
        >
          <PanelLeft className="size-4" />
          <span className="hidden sm:inline">Hide topics</span>
        </Button>
      )}

      <span className="ml-auto hidden text-xs text-muted-foreground lg:inline">
        Tip: hide sidebars on smaller screens for more reading space
      </span>
    </div>
  );
}
