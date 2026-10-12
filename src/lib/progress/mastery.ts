import { topics } from '#site/content';
import type { TopicProgressMap } from '@/lib/progress/types';
import type { TopicMeta } from '@/types/curriculum';

export type ProgressTopic = TopicMeta & { path: string; permalink: string };

export function getPublishedTopicsForTrack(track: string): ProgressTopic[] {
  return topics
    .filter((t) => t.track === track && (t.status ?? 'published') === 'published')
    .sort((a, b) => a.order - b.order) as ProgressTopic[];
}

export function getTopicByPath(path: string): ProgressTopic | undefined {
  return topics.find((t) => t.path === path) as ProgressTopic | undefined;
}

export function getTopicBySlug(track: string, slug: string): ProgressTopic | undefined {
  return topics.find((t) => t.track === track && t.slug === slug) as ProgressTopic | undefined;
}

/** Resolve a prerequisite slug — same track first, then any track (e.g. JS before React). */
export function resolvePrerequisiteTopic(
  track: string,
  slug: string,
): ProgressTopic | undefined {
  return getTopicBySlug(track, slug) ?? (topics.find((t) => t.slug === slug) as ProgressTopic | undefined);
}

export function countKnowAnswers(path: string, progress: TopicProgressMap): number {
  const results = Object.values(progress[path]?.qaResults ?? {});
  return results.filter((r) => r === 'know').length;
}

export function isTopicMastered(path: string, progress: TopicProgressMap): boolean {
  const topic = getTopicByPath(path);
  if (!topic) return false;

  const entry = progress[path];
  if (entry?.masteredAt) return true;

  const knowCount = countKnowAnswers(path, progress);
  const { minQuestionsCorrect, requireChallenge } = topic.masteryCriteria;
  const qaPass = knowCount >= minQuestionsCorrect;
  const challengePass = !requireChallenge || Boolean(entry?.challengePassed);

  return qaPass && challengePass;
}

export function canAccessTopic(path: string, progress: TopicProgressMap): boolean {
  const topic = getTopicByPath(path);
  if (!topic?.prerequisites?.length) return true;

  return topic.prerequisites.every((slug) => {
    const prereq = resolvePrerequisiteTopic(topic.track, slug);
    return prereq ? isTopicMastered(prereq.path, progress) : true;
  });
}

export function getTopicProgressPercent(path: string, progress: TopicProgressMap): number {
  const topic = getTopicByPath(path);
  if (!topic) return 0;

  const { minQuestionsCorrect, requireChallenge } = topic.masteryCriteria;
  const knowCount = countKnowAnswers(path, progress);
  const qaRatio = Math.min(knowCount / Math.max(minQuestionsCorrect, 1), 1);
  const challengeRatio =
    !requireChallenge || progress[path]?.challengePassed ? 1 : 0;

  return Math.round(((qaRatio + challengeRatio) / 2) * 100);
}

export function getTrackMasteryPercent(track: string, progress: TopicProgressMap): number {
  const published = getPublishedTopicsForTrack(track);
  if (!published.length) return 0;
  const mastered = published.filter((t) => isTopicMastered(t.path, progress)).length;
  return Math.round((mastered / published.length) * 100);
}

export function getUnmetPrerequisites(
  path: string,
  progress: TopicProgressMap,
): ProgressTopic[] {
  const topic = getTopicByPath(path);
  if (!topic?.prerequisites?.length) return [];

  return topic.prerequisites
    .map((slug) => resolvePrerequisiteTopic(topic.track, slug))
    .filter((t): t is ProgressTopic => Boolean(t))
    .filter((t) => !isTopicMastered(t.path, progress));
}

export const LEARN_SETTINGS_KEY = 'elite-learn-settings';

export interface LearnSettings {
  hardLock: boolean;
}

export function getLearnSettings(): LearnSettings {
  if (typeof window === 'undefined') return { hardLock: false };
  try {
    const raw = localStorage.getItem(LEARN_SETTINGS_KEY);
    return raw ? ({ hardLock: false, ...JSON.parse(raw) } as LearnSettings) : { hardLock: false };
  } catch {
    return { hardLock: false };
  }
}

export function setLearnSettings(settings: Partial<LearnSettings>) {
  const next = { ...getLearnSettings(), ...settings };
  localStorage.setItem(LEARN_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('elite-learn-settings-change'));
}
