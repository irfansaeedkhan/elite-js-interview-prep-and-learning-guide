import {
  canAccessTopic,
  getTopicProgressPercent,
  isTopicMastered,
  type TopicIndexEntry,
} from '@/lib/progress/mastery-rules';
import type { TopicProgressMap } from '@/lib/progress/types';

/**
 * Readiness analytics (gap 5). Pure functions over the published topic
 * index + the learner's progress map. Read-only: nothing here writes to
 * any progress table, and no schema change is needed.
 *
 * Honesty rules, enforced by construction:
 * - An unattempted topic contributes 0. The shared topic-percent
 *   primitive scores an untouched no-challenge topic at 50% (the
 *   challenge half is free); crediting that here would make a brand-new
 *   learner look partly ready for doing nothing. The shared primitive
 *   itself is untouched; the gate lives in `toRow` only.
 * - "Weakest" means attempted but not mastered. A 0% unvisited topic is
 *   "not started", not "weak", so weakest is never padded with
 *   unvisited topics.
 * - Readiness is an estimate of coverage, never a guarantee of
 *   interview performance. Callers must label it as such.
 */

export interface ReadinessTopicRow {
  path: string;
  permalink: string;
  slug: string;
  track: string;
  title: string;
  order: number;
  percent: number;
  mastered: boolean;
  attempted: boolean;
  knowCount: number;
  reviewCount: number;
  canAccess: boolean;
}

export interface ReadinessTrackRow {
  track: string;
  readiness: number;
  mastered: number;
  total: number;
}

export interface StudyNextTopic extends ReadinessTopicRow {
  reason: string;
}

export interface ReadinessReport {
  readiness: number;
  readinessBand: string;
  perTrack: ReadinessTrackRow[];
  weakest: ReadinessTopicRow[];
  studyNext: StudyNextTopic | null;
}

export function getReadinessBand(readiness: number): string {
  if (readiness >= 90) return 'Near-complete coverage';
  if (readiness >= 70) return 'Strong coverage';
  if (readiness >= 40) return 'Growing coverage';
  return 'Early coverage';
}

export function getPublishedTopics(index: TopicIndexEntry[]): TopicIndexEntry[] {
  return index.filter((t) => t.status === 'published');
}

function countResults(
  progress: TopicProgressMap,
  path: string,
  wanted: 'know' | 'review',
): number {
  return Object.values(progress[path]?.qaResults ?? {}).filter((r) => r === wanted).length;
}

export function toReadinessRow(
  index: TopicIndexEntry[],
  entry: TopicIndexEntry,
  progress: TopicProgressMap,
): ReadinessTopicRow {
  const attempted = progress[entry.path] != null;
  return {
    path: entry.path,
    permalink: entry.permalink,
    slug: entry.slug,
    track: entry.track,
    title: entry.title,
    order: entry.order,
    percent: attempted ? getTopicProgressPercent(index, entry.path, progress) : 0,
    mastered: isTopicMastered(index, entry.path, progress),
    attempted,
    knowCount: countResults(progress, entry.path, 'know'),
    reviewCount: countResults(progress, entry.path, 'review'),
    canAccess: canAccessTopic(index, entry.path, progress),
  };
}

function byPath(a: ReadinessTopicRow, b: ReadinessTopicRow): number {
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}

/** Lowest mastery first; review marks break ties; deterministic. */
function byWeakness(a: ReadinessTopicRow, b: ReadinessTopicRow): number {
  return (
    a.percent - b.percent ||
    b.reviewCount - a.reviewCount ||
    a.order - b.order ||
    byPath(a, b)
  );
}

/**
 * Weakest topics: attempted, not mastered, prerequisites met. At most
 * `limit` (default 3). Never padded with unvisited topics, so a short
 * list (or an empty one) is a valid result.
 */
export function getWeakestTopics(
  index: TopicIndexEntry[],
  progress: TopicProgressMap,
  limit = 3,
): ReadinessTopicRow[] {
  return getPublishedTopics(index)
    .map((entry) => toReadinessRow(index, entry, progress))
    .filter((row) => row.attempted && !row.mastered && row.canAccess)
    .sort(byWeakness)
    .slice(0, Math.max(limit, 0));
}

function meanPercent(rows: ReadinessTopicRow[]): number {
  if (!rows.length) return 0;
  const sum = rows.reduce((total, row) => total + row.percent, 0);
  return Math.round(sum / rows.length);
}

export function getReadinessSummary(
  index: TopicIndexEntry[],
  progress: TopicProgressMap,
): { readiness: number; readinessBand: string; perTrack: ReadinessTrackRow[] } {
  const rows = getPublishedTopics(index).map((entry) => toReadinessRow(index, entry, progress));

  const perTrack: ReadinessTrackRow[] = [];
  for (const row of rows) {
    let trackRow = perTrack.find((t) => t.track === row.track);
    if (!trackRow) {
      trackRow = { track: row.track, readiness: 0, mastered: 0, total: 0 };
      perTrack.push(trackRow);
    }
    trackRow.total += 1;
    if (row.mastered) trackRow.mastered += 1;
  }
  for (const trackRow of perTrack) {
    trackRow.readiness = meanPercent(rows.filter((row) => row.track === trackRow.track));
  }

  const readiness = meanPercent(rows);
  return { readiness, readinessBand: getReadinessBand(readiness), perTrack };
}

function studyNextReason(row: ReadinessTopicRow): string {
  if (!row.attempted) return 'Not started yet — prerequisites met';
  const base = `Lowest mastery at ${row.percent}%`;
  return row.reviewCount > 0 ? `${base} · ${row.reviewCount} marked for review` : base;
}

/**
 * What to study next. Attempted-but-unfinished topics first (lowest
 * mastery, most review marks), then unvisited topics in track order.
 * Null when every published topic is mastered or locked. This is the
 * stable signal gap 9 (study plans) consumes.
 */
export function getStudyNext(
  index: TopicIndexEntry[],
  progress: TopicProgressMap,
): StudyNextTopic | null {
  const candidates = getPublishedTopics(index)
    .map((entry) => toReadinessRow(index, entry, progress))
    .filter((row) => !row.mastered && row.canAccess)
    .sort((a, b) => {
      if (a.attempted !== b.attempted) return a.attempted ? -1 : 1;
      if (a.attempted) return byWeakness(a, b);
      return (
        (a.track < b.track ? -1 : a.track > b.track ? 1 : 0) || a.order - b.order || byPath(a, b)
      );
    });

  const next = candidates[0];
  return next ? { ...next, reason: studyNextReason(next) } : null;
}

export function getReadinessReport(
  index: TopicIndexEntry[],
  progress: TopicProgressMap,
): ReadinessReport {
  const summary = getReadinessSummary(index, progress);
  return {
    ...summary,
    weakest: getWeakestTopics(index, progress),
    studyNext: getStudyNext(index, progress),
  };
}
