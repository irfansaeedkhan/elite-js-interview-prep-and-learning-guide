'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TopicProvider, type VeliteTopic } from '@/components/curriculum/topic-context';
import { TopicMasteryPanel } from '@/components/curriculum/topic-mastery-panel';
import { MDXContent } from '@/components/mdx/mdx-content';
import { TopicNav } from '@/components/navigation/topic-nav';
import { Badge } from '@/components/ui/badge';
import { useTopicVisitTracking } from '@/hooks/use-topic-progress';

export interface TopicMdxContentProps {
  topic: VeliteTopic;
}

export function TopicMdxContent({ topic }: TopicMdxContentProps) {
  const { visitTopic, addTimeSpent, enabled } = useTopicVisitTracking(topic.path);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    visitTopic(topic.path);
    startedAtRef.current = Date.now();
    return () => {
      if (startedAtRef.current) {
        const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
        if (seconds >= 5) addTimeSpent(topic.path, seconds);
      }
    };
  }, [topic.path, enabled, visitTopic, addTimeSpent]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="shrink-0 border-b bg-muted/30 px-8 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{topic.title}</h1>
          <Badge variant="outline" className="capitalize">
            {topic.difficulty}
          </Badge>
          {topic.status === 'preview' ? (
            <Badge variant="secondary">Preview</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-muted-foreground">
          Complete guide with examples and interview questions · {topic.estimatedMinutes} min
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <TopicProvider topic={topic}>
          <div className="max-w-5xl px-8 py-8 pb-24">
            <MDXContent code={topic.content} />
            <TopicMasteryPanel />
            <TopicNav track={topic.track} topic={topic} />
          </div>
        </TopicProvider>
      </ScrollArea>
    </div>
  );
}
