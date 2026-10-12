'use client';

import { useEffect, useRef } from 'react';
import { useTopicVisitTracking } from '@/hooks/use-topic-progress';

export function TopicVisitTracker({ path }: { path: string }) {
  const { visitTopic, addTimeSpent, enabled } = useTopicVisitTracking(path);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    visitTopic(path);
    startedAtRef.current = Date.now();
    return () => {
      if (startedAtRef.current) {
        const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
        if (seconds >= 5) addTimeSpent(path, seconds);
      }
    };
  }, [path, enabled, visitTopic, addTimeSpent]);

  return null;
}
