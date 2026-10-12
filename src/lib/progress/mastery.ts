import { topics } from '#site/content';
import {
  canAccessTopic as canAccess,
  countKnowAnswers,
  getAdjacentFromIndex,
  getTopicBySlugFromIndex,
  getTopicProgressPercent as topicPercent,
  getTrackMasteryPercent as trackPercent,
  getUnmetPrerequisites as unmet,
  isTopicMastered as mastered,
  resolvePrerequisiteFromIndex,
  type TopicIndexEntry,
} from '@/lib/progress/mastery-rules';
import type { TopicProgressMap } from '@/lib/progress/types';
import type { TopicMeta } from '@/types/curriculum';

export type { TopicIndexEntry };
export type ProgressTopic = TopicMeta & { path: string; permalink: string };

function toIndex(topic: (typeof topics)[number]): TopicIndexEntry {
  return {
    path: topic.path,
    permalink: topic.permalink,
    slug: topic.slug,
    track: topic.track,
    title: topic.title,
    order: topic.order,
    status: topic.status ?? 'published',
    prerequisites: topic.prerequisites ?? [],
    masteryCriteria: topic.masteryCriteria,
  };
}

const index: TopicIndexEntry[] = topics.map(toIndex);

export function getTopicIndex(): TopicIndexEntry[] {
  return index;
}

export function getPublishedTopicsForTrack(track: string): ProgressTopic[] {
  return topics
    .filter((t) => t.track === track && (t.status ?? 'published') === 'published')
    .sort((a, b) => a.order - b.order) as ProgressTopic[];
}

export function getTopicByPath(path: string): ProgressTopic | undefined {
  return topics.find((t) => t.path === path) as ProgressTopic | undefined;
}

export function getTopicBySlug(track: string, slug: string): ProgressTopic | undefined {
  const hit = getTopicBySlugFromIndex(index, track, slug);
  return hit ? (topics.find((t) => t.path === hit.path) as ProgressTopic) : undefined;
}

export function resolvePrerequisiteTopic(track: string, slug: string): ProgressTopic | undefined {
  const hit = resolvePrerequisiteFromIndex(index, track, slug);
  return hit ? (topics.find((t) => t.path === hit.path) as ProgressTopic) : undefined;
}

export { countKnowAnswers };

export function isTopicMastered(path: string, progress: TopicProgressMap): boolean {
  return mastered(index, path, progress);
}

export function canAccessTopic(path: string, progress: TopicProgressMap): boolean {
  return canAccess(index, path, progress);
}

export function getTopicProgressPercent(path: string, progress: TopicProgressMap): number {
  return topicPercent(index, path, progress);
}

export function getTrackMasteryPercent(track: string, progress: TopicProgressMap): number {
  return trackPercent(index, track, progress);
}

export function getUnmetPrerequisites(path: string, progress: TopicProgressMap): ProgressTopic[] {
  return unmet(index, path, progress)
    .map((entry) => topics.find((t) => t.path === entry.path))
    .filter((t) => t != null) as ProgressTopic[];
}

export function getAdjacentTopics(track: string, path: string) {
  const adjacent = getAdjacentFromIndex(index, track, path);
  const asFull = (entry: TopicIndexEntry | null) =>
    entry ? ((topics.find((t) => t.path === entry.path) as ProgressTopic | undefined) ?? null) : null;
  return { prev: asFull(adjacent.prev), next: asFull(adjacent.next) };
}
