'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { InterviewQuestion, TopicMeta } from '@/types/curriculum';

export type VeliteTopic = TopicMeta & {
  path: string;
  permalink: string;
  content: string;
};

const TopicContext = createContext<VeliteTopic | null>(null);

export function TopicProvider({
  topic,
  children,
}: {
  topic: VeliteTopic;
  children: ReactNode;
}) {
  return <TopicContext.Provider value={topic}>{children}</TopicContext.Provider>;
}

export function useTopic() {
  const topic = useContext(TopicContext);
  if (!topic) {
    throw new Error('useTopic must be used within TopicProvider');
  }
  return topic;
}

export function useTopicOptional() {
  return useContext(TopicContext);
}

export function getInterviewQuestionById(
  topic: VeliteTopic | null,
  id: string,
): InterviewQuestion | undefined {
  return topic?.interviewQuestions.find((q) => q.id === id);
}
