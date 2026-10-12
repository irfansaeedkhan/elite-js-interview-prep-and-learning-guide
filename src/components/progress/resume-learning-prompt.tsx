'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTopicByPath } from '@/lib/progress/mastery';
import { useProgressEnabled, useUserStats } from '@/hooks/use-topic-progress';

export function ResumeLearningPrompt() {
  const { enabled } = useProgressEnabled();
  const { stats } = useUserStats();

  if (!enabled || !stats?.lastTopicPath) return null;

  const topic = getTopicByPath(stats.lastTopicPath);
  if (!topic) return null;

  return (
    <Button variant="outline" className="mt-6 cursor-pointer gap-2" asChild>
      <Link href={topic.permalink}>
        Resume: {topic.title}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
