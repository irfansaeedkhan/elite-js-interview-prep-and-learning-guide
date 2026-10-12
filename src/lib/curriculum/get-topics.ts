import { categories, topics, tracks } from '#site/content';
import type { VeliteTopic } from '@/components/curriculum/topic-context';

export interface TrackMeta {
  title: string;
  slug: string;
  description: string;
  order: number;
  icon: string;
}

export function getTracks(): TrackMeta[] {
  return [...tracks].sort((a, b) => a.order - b.order) as TrackMeta[];
}

export function getTrackBySlug(slug: string): TrackMeta | null {
  return (tracks.find((t) => t.slug === slug) as TrackMeta | undefined) ?? null;
}

export function getTopicsForTrack(track: string): VeliteTopic[] {
  return topics
    .filter((t) => t.track === track)
    .sort((a, b) => a.order - b.order) as VeliteTopic[];
}

export function getTopicByPath(track: string, slug: string[] | undefined): VeliteTopic | null {
  if (!slug?.length) return null;
  const path = `${track}/${slug.join('/')}`;
  const topic = topics.find((t) => t.path === path);
  return (topic as VeliteTopic) ?? null;
}

export function getTopicPathSegments(topic: VeliteTopic): string[] {
  const prefix = `${topic.track}/`;
  return topic.path.startsWith(prefix)
    ? topic.path.slice(prefix.length).split('/')
    : topic.path.split('/').slice(1);
}

export function getAdjacentTopics(track: string, currentPath: string) {
  const sorted = getTopicsForTrack(track);
  const index = sorted.findIndex((t) => t.path === currentPath);
  return {
    prev: index > 0 ? sorted[index - 1] : null,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}

export interface TopicNavItem {
  slug: string;
  subCategory: string;
  title: string;
  permalink: string;
  order: number;
  track: string;
  path: string;
  status?: string;
}

export function toNavItems(list: VeliteTopic[]): TopicNavItem[] {
  return list.map((topic) => ({
    slug: topic.slug,
    subCategory: topic.subCategory,
    title: topic.title,
    permalink: topic.permalink,
    order: topic.order,
    track: topic.track,
    path: topic.path,
    status: topic.status,
  }));
}

export interface NavSubCategory {
  id: string;
  title: string;
  order: number;
  topics: Array<{ id: string; title: string; href: string; order: number; status: string; path: string }>;
}

function getCategoryOrderMap(track: string): Map<string, number> {
  return new Map(
    categories
      .filter((c) => c.track === track)
      .map((c) => [c.subCategory, c.order]),
  );
}

function getCategoryTitle(track: string, subCategory: string): string {
  const meta = categories.find((c) => c.track === track && c.subCategory === subCategory);
  if (meta?.title) return meta.title;
  return subCategory
    .split(/[-/]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function buildTrackNav(trackTopics: TopicNavItem[]): NavSubCategory[] {
  if (trackTopics.length === 0) return [];

  const track = trackTopics[0].track;
  const categoryOrder = getCategoryOrderMap(track);
  const map = new Map<string, NavSubCategory>();

  for (const topic of [...trackTopics].sort((a, b) => a.order - b.order)) {
    const id = topic.subCategory;
    if (!map.has(id)) {
      map.set(id, {
        id,
        title: getCategoryTitle(track, id),
        order: categoryOrder.get(id) ?? 999,
        topics: [],
      });
    }
    map.get(id)!.topics.push({
      id: topic.slug,
      title: topic.title,
      href: topic.permalink,
      order: topic.order,
      status: topic.status ?? 'published',
      path: topic.path,
    });
  }

  return Array.from(map.values())
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map((sub) => ({
      ...sub,
      topics: [...sub.topics].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }));
}

export function getTrackNavItems() {
  return getActiveTracks().map((track) => {
    const firstTopic = getTopicsForTrack(track.slug)[0];
    return {
      id: track.slug,
      title: track.title,
      icon: track.icon,
      href: firstTopic?.permalink ?? `/learn/${track.slug}`,
    };
  });
}

/** Tracks with at least one published topic (hide preview-only placeholders). */
export function getActiveTracks(): TrackMeta[] {
  return getTracks().filter((track) =>
    getTopicsForTrack(track.slug).some((t) => (t.status ?? 'published') === 'published'),
  );
}

export function getDefaultTrackHref(trackSlug: string): string {
  const firstTopic = getTopicsForTrack(trackSlug)[0];
  return firstTopic?.permalink ?? `/learn/${trackSlug}`;
}
