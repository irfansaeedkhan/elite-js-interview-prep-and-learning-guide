import type { TopicProgressMap } from '@/lib/progress/types';

/** Slim topic record safe to send to the browser. No MDX and no answer text. */
export interface TopicIndexEntry {
  path: string;
  permalink: string;
  slug: string;
  track: string;
  title: string;
  order: number;
  status: string;
  prerequisites: string[];
  masteryCriteria: {
    minQuestionsCorrect: number;
    requireChallenge?: boolean;
  };
}

export function countKnowAnswers(path: string, progress: TopicProgressMap): number {
  const results = Object.values(progress[path]?.qaResults ?? {});
  return results.filter((r) => r === 'know').length;
}

export function getTopicFromIndex(index: TopicIndexEntry[], path: string): TopicIndexEntry | undefined {
  return index.find((t) => t.path === path);
}

export function getTopicBySlugFromIndex(
  index: TopicIndexEntry[],
  track: string,
  slug: string,
): TopicIndexEntry | undefined {
  return index.find((t) => t.track === track && t.slug === slug);
}

export function resolvePrerequisiteFromIndex(
  index: TopicIndexEntry[],
  track: string,
  slug: string,
): TopicIndexEntry | undefined {
  return getTopicBySlugFromIndex(index, track, slug) ?? index.find((t) => t.slug === slug);
}

export function isTopicMastered(
  index: TopicIndexEntry[],
  path: string,
  progress: TopicProgressMap,
): boolean {
  const topic = getTopicFromIndex(index, path);
  if (!topic) return false;

  const entry = progress[path];
  if (entry?.masteredAt) return true;

  const knowCount = countKnowAnswers(path, progress);
  const { minQuestionsCorrect, requireChallenge } = topic.masteryCriteria;
  const qaPass = knowCount >= minQuestionsCorrect;
  const challengePass = !requireChallenge || Boolean(entry?.challengePassed);

  return qaPass && challengePass;
}

export function canAccessTopic(
  index: TopicIndexEntry[],
  path: string,
  progress: TopicProgressMap,
): boolean {
  const topic = getTopicFromIndex(index, path);
  if (!topic?.prerequisites?.length) return true;

  return topic.prerequisites.every((slug) => {
    const prereq = resolvePrerequisiteFromIndex(index, topic.track, slug);
    return prereq ? isTopicMastered(index, prereq.path, progress) : true;
  });
}

export function getTopicProgressPercent(
  index: TopicIndexEntry[],
  path: string,
  progress: TopicProgressMap,
): number {
  const topic = getTopicFromIndex(index, path);
  if (!topic) return 0;

  const { minQuestionsCorrect, requireChallenge } = topic.masteryCriteria;
  const knowCount = countKnowAnswers(path, progress);
  const qaRatio = Math.min(knowCount / Math.max(minQuestionsCorrect, 1), 1);
  const challengeRatio = !requireChallenge || progress[path]?.challengePassed ? 1 : 0;

  return Math.round(((qaRatio + challengeRatio) / 2) * 100);
}

export function getTrackMasteryPercent(
  index: TopicIndexEntry[],
  track: string,
  progress: TopicProgressMap,
): number {
  const published = index
    .filter((t) => t.track === track && t.status === 'published')
    .sort((a, b) => a.order - b.order);
  if (!published.length) return 0;
  const mastered = published.filter((t) => isTopicMastered(index, t.path, progress)).length;
  return Math.round((mastered / published.length) * 100);
}

export function getUnmetPrerequisites(
  index: TopicIndexEntry[],
  path: string,
  progress: TopicProgressMap,
): TopicIndexEntry[] {
  const topic = getTopicFromIndex(index, path);
  if (!topic?.prerequisites?.length) return [];

  return topic.prerequisites
    .map((slug) => resolvePrerequisiteFromIndex(index, topic.track, slug))
    .filter((t): t is TopicIndexEntry => Boolean(t))
    .filter((t) => !isTopicMastered(index, t.path, progress));
}

export function getAdjacentFromIndex(index: TopicIndexEntry[], track: string, path: string) {
  const sorted = index.filter((t) => t.track === track).sort((a, b) => a.order - b.order);
  const i = sorted.findIndex((t) => t.path === path);
  return {
    prev: i > 0 ? sorted[i - 1] : null,
    next: i >= 0 && i < sorted.length - 1 ? sorted[i + 1] : null,
  };
}
