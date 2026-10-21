import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Validates the real Velite output (content/tracks as compiled).
 * Skips when `yarn velite` has not run yet, so `yarn test` stays green
 * on a fresh clone; CI runs velite first.
 */
const topicsJsonPath = path.resolve(__dirname, '../../../.velite/topics.json');
const hasVeliteOutput = fs.existsSync(topicsJsonPath);

interface VeliteQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
}

interface VeliteTopic {
  title: string;
  slug: string;
  track: string;
  subCategory: string;
  order: number;
  path: string;
  permalink: string;
  status: string;
  prerequisites?: string[];
  interviewQuestions: VeliteQuestion[];
}

const topics: VeliteTopic[] = hasVeliteOutput
  ? (JSON.parse(fs.readFileSync(topicsJsonPath, 'utf8')) as VeliteTopic[])
  : [];

function findPrerequisite(track: string, slug: string): VeliteTopic | undefined {
  // Mirrors resolvePrerequisiteFromIndex: same-track match, else any track.
  return (
    topics.find((t) => t.track === track && t.slug === slug) ??
    topics.find((t) => t.slug === slug)
  );
}

describe.skipIf(!hasVeliteOutput)('velite topic content', () => {
  it('has at least one topic', () => {
    expect(topics.length).toBeGreaterThan(0);
  });

  it('every topic has the required fields', () => {
    for (const topic of topics) {
      expect(topic.title, `${topic.path}: title`).toBeTruthy();
      expect(topic.slug, `${topic.path}: slug`).toBeTruthy();
      expect(topic.track, `${topic.path}: track`).toBeTruthy();
      expect(topic.permalink, `${topic.path}: permalink`).toBeTruthy();
      expect(topic.path, `${topic.slug}: path`).toBeTruthy();
    }
  });

  it('paths and permalinks are unique', () => {
    const paths = topics.map((t) => t.path);
    const permalinks = topics.map((t) => t.permalink);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(permalinks).size).toBe(permalinks.length);
  });

  it('permalink is derived from path', () => {
    for (const topic of topics) {
      expect(topic.permalink).toBe(`/learn/${topic.path}`);
    }
  });

  it('every prerequisite resolves to a real topic', () => {
    for (const topic of topics) {
      for (const prereq of topic.prerequisites ?? []) {
        const target = findPrerequisite(topic.track, prereq);
        expect(
          target,
          `${topic.path}: prerequisite "${prereq}" resolves to a topic`,
        ).toBeDefined();
      }
    }
  });

  it('interview question ids are unique within each topic', () => {
    for (const topic of topics) {
      const ids = topic.interviewQuestions.map((q) => q.id);
      expect(new Set(ids).size, `${topic.path}: duplicate question ids`).toBe(ids.length);
    }
  });
});
