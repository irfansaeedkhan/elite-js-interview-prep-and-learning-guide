'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTopicOptional } from '@/components/curriculum/topic-context';

export function TopicQuickStats() {
  const topic = useTopicOptional();
  if (!topic) return null;

  const questionCount = topic.interviewQuestions?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <div className="text-3xl font-semibold">{topic.estimatedMinutes}</div>
          <div className="text-sm text-muted-foreground">Minutes</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <div className="text-3xl font-semibold capitalize">{topic.difficulty}</div>
          <div className="text-sm text-muted-foreground">Difficulty</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <div className="text-3xl font-semibold">{questionCount}</div>
          <div className="text-sm text-muted-foreground">Interview Q&apos;s</div>
        </div>
      </CardContent>
    </Card>
  );
}
