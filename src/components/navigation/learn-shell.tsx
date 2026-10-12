'use client';

import { BookOpen } from 'lucide-react';
import { ResumeLearningPrompt } from '@/components/progress/resume-learning-prompt';
import { MainSidebar } from '@/components/navigation/main-sidebar';
import { SubSidebar } from '@/components/navigation/sub-sidebar';
import { LearnSidebarToolbar } from '@/components/navigation/learn-sidebar-toolbar';
import { useLearnSidebar } from '@/hooks/use-learn-sidebar';
import {
  buildTrackNav,
  getTrackNavItems,
  type NavSubCategory,
} from '@/lib/curriculum/get-topics';

export interface LearnShellProps {
  track: string;
  topics: Array<{
    slug: string;
    subCategory: string;
    title: string;
    permalink: string;
    order: number;
    track: string;
    path: string;
    status?: string;
  }>;
  activeSubCategory: string;
  selectedTopicSlug: string;
  children: React.ReactNode;
}

export function LearnShell({
  track,
  topics,
  activeSubCategory,
  selectedTopicSlug,
  children,
}: LearnShellProps) {
  const nav: NavSubCategory[] = buildTrackNav(topics as Parameters<typeof buildTrackNav>[0]);
  const trackItems = getTrackNavItems();

  const {
    mainMode,
    topicsMode,
    toggleTopicsSidebar,
    setMainFull,
    setMainRail,
    hideMainSidebar,
    openTopicsSidebar,
  } = useLearnSidebar();

  const handleMainCollapse = () => {
    if (mainMode === 'full') setMainRail();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <MainSidebar
        mode={mainMode}
        selectedTrack={track}
        tracks={trackItems}
        onCollapse={handleMainCollapse}
      />
      <SubSidebar
        mode={topicsMode}
        subCategories={nav}
        selectedTopicSlug={selectedTopicSlug}
        activeSubCategory={activeSubCategory}
        track={track}
        onClose={toggleTopicsSidebar}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <LearnSidebarToolbar
          mainMode={mainMode}
          topicsMode={topicsMode}
          onHideMain={hideMainSidebar}
          onShowMain={setMainFull}
          onHideTopics={toggleTopicsSidebar}
          onShowTopics={openTopicsSidebar}
        />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}

export function LearnPlaceholder() {
  return (
    <div className="flex h-full flex-1 items-center justify-center bg-background">
      <div className="space-y-4 px-8 text-center">
        <BookOpen className="mx-auto size-16 text-muted-foreground" />
        <div>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Select a topic to start learning
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Choose from the sidebar to view definitions, examples, and interview questions
          </p>
          <ResumeLearningPrompt />
        </div>
      </div>
    </div>
  );
}
