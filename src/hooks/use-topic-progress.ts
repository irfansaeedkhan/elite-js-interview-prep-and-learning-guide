'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useTopicIndex } from '@/components/curriculum/topic-index-context';
import { getTopicFromIndex, isTopicMastered as checkMastered } from '@/lib/progress/mastery-rules';
import {
  fetchProgressSnapshot,
  migrateLocalProgress,
  patchProgress,
  recordPracticeAttempt,
} from '@/lib/progress/progress-api-client';
import {
  clearLocalProgress,
  hasLocalProgress,
  readLocalProgress,
} from '@/lib/progress/local-progress-store';
import type { ProgressSnapshot } from '@/lib/progress/progress-service';
import type { TopicProgressEntry, TopicProgressMap } from '@/lib/progress/types';

export type { TopicProgressEntry, TopicProgressMap };
export { PROGRESS_CHANGE_EVENT } from '@/lib/progress/types';

const PROGRESS_QUERY_KEY = ['progress'] as const;

export function useProgressEnabled() {
  const { data: session, isPending } = useSession();
  return {
    enabled: Boolean(session?.user),
    isPending,
    user: session?.user ?? null,
  };
}

function useProgressQuery(enabled: boolean) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEY,
    queryFn: fetchProgressSnapshot,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgressSnapshot() {
  const { enabled, isPending } = useProgressEnabled();
  const query = useProgressQuery(enabled);

  return {
    enabled,
    isPending: isPending || (enabled && query.isPending),
    progress: enabled ? (query.data?.progress ?? {}) : ({} as TopicProgressMap),
    stats: enabled ? query.data?.stats : null,
    isLoading: enabled && query.isLoading,
    error: query.error,
  };
}

export function useTopicProgressMap(): TopicProgressMap {
  const { progress } = useProgressSnapshot();
  return progress;
}

export function useUserStats() {
  const { stats, enabled, isPending } = useProgressSnapshot();
  return { stats, enabled, isPending };
}

function useProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchProgress,
    onSuccess: (snapshot) => {
      queryClient.setQueryData<ProgressSnapshot>(PROGRESS_QUERY_KEY, snapshot);
    },
  });
}

export function markTopicVisited(path: string) {
  // Imperative callers use the hook actions instead when possible.
  void path;
}

export function recordQaResult(
  topicPath: string,
  questionId: string,
  result: 'know' | 'review',
) {
  void topicPath;
  void questionId;
  void result;
}

export function recordChallengePassed(topicPath: string) {
  void topicPath;
}

export function getTopicProgress(path: string): TopicProgressEntry | null {
  if (typeof window === 'undefined') return null;
  return readLocalProgress()[path] ?? null;
}

export function getTopicQaScore(path: string): { know: number; total: number } {
  const entry = getTopicProgress(path);
  const results = Object.values(entry?.qaResults ?? {});
  return {
    know: results.filter((r) => r === 'know').length,
    total: results.length,
  };
}

export function useTopicMastery(path: string) {
  const progress = useTopicProgressMap();
  const index = useTopicIndex();
  const topic = getTopicFromIndex(index, path);

  return {
    progress: progress[path] ?? null,
    knowCount: Object.values(progress[path]?.qaResults ?? {}).filter((r) => r === 'know').length,
    isMastered: checkMastered(index, path, progress),
    topic,
  };
}

export function useProgressActions() {
  const { enabled } = useProgressEnabled();
  const mutation = useProgressMutation();

  const recordKnow = useCallback(
    (topicPath: string, questionId: string) => {
      if (!enabled) return;
      mutation.mutate({ action: 'qa', topicPath, questionId, result: 'know' });
      void recordPracticeAttempt({ topicPath, kind: 'qa', promptId: questionId, passed: true });
    },
    [enabled, mutation],
  );

  const recordReview = useCallback(
    (topicPath: string, questionId: string) => {
      if (!enabled) return;
      mutation.mutate({ action: 'qa', topicPath, questionId, result: 'review' });
      void recordPracticeAttempt({ topicPath, kind: 'qa', promptId: questionId, passed: false });
    },
    [enabled, mutation],
  );

  const passChallenge = useCallback(
    (topicPath: string) => {
      if (!enabled) return;
      mutation.mutate({ action: 'challenge', topicPath });
    },
    [enabled, mutation],
  );

  const visitTopic = useCallback(
    (topicPath: string) => {
      if (!enabled) return;
      mutation.mutate({ action: 'visit', topicPath });
    },
    [enabled, mutation],
  );

  const addTimeSpent = useCallback(
    (topicPath: string, seconds: number) => {
      if (!enabled || seconds <= 0) return;
      mutation.mutate({ action: 'time', topicPath, seconds });
    },
    [enabled, mutation],
  );

  return { recordKnow, recordReview, passChallenge, visitTopic, addTimeSpent, enabled };
}

export function useTopicVisitTracking(topicPath: string) {
  const { visitTopic, addTimeSpent, enabled } = useProgressActions();

  return { visitTopic, addTimeSpent, enabled };
}

export function useProgressMigration() {
  const { enabled } = useProgressEnabled();
  const queryClient = useQueryClient();

  const migrate = useCallback(async () => {
    if (!enabled || !hasLocalProgress()) return;
    const local = readLocalProgress();
    const snapshot = await migrateLocalProgress(local);
    clearLocalProgress();
    queryClient.setQueryData<ProgressSnapshot>(PROGRESS_QUERY_KEY, snapshot);
  }, [enabled, queryClient]);

  return { migrate, shouldMigrate: enabled && hasLocalProgress() };
}
