'use client';

import dynamic from 'next/dynamic';
import { LearnPlaceholder, LearnShell } from '@/components/navigation/learn-shell';
import type { VeliteTopic } from '@/components/curriculum/topic-context';

const TopicMdxContent = dynamic(
  () =>
    import('@/components/curriculum/topic-mdx-content').then((m) => m.TopicMdxContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading topic…
      </div>
    ),
  },
);

export interface LearnLayoutProps {
  track: string;
  topics: VeliteTopic[];
  topic: VeliteTopic | null;
}

export function LearnLayout({ track, topics, topic }: LearnLayoutProps) {
  const activeSubCategory = topic?.subCategory ?? topics[0]?.subCategory ?? 'execution';
  const selectedTopicSlug = topic?.slug ?? '';

  return (
    <LearnShell
      track={track}
      topics={topics}
      activeSubCategory={activeSubCategory}
      selectedTopicSlug={selectedTopicSlug}
    >
      {topic ? <TopicMdxContent topic={topic} /> : <LearnPlaceholder />}
    </LearnShell>
  );
}
