'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { TopicIndexEntry } from '@/lib/progress/mastery-rules';

const TopicIndexContext = createContext<TopicIndexEntry[]>([]);

export function TopicIndexProvider({
  index,
  children,
}: {
  index: TopicIndexEntry[];
  children: ReactNode;
}) {
  return <TopicIndexContext.Provider value={index}>{children}</TopicIndexContext.Provider>;
}

export function useTopicIndex(): TopicIndexEntry[] {
  return useContext(TopicIndexContext);
}
