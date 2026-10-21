import { describe, expect, it } from 'vitest';
import { topics } from '#site/content';
import { buildTrackNav, toNavItems } from '@/lib/curriculum/get-topics';

type VeliteTopicList = Parameters<typeof toNavItems>[0];

describe('toNavItems', () => {
  it('keeps sidebar fields and drops article payload', () => {
    const [item] = toNavItems(topics as VeliteTopicList);
    expect(item).toEqual({
      slug: 'hoisting',
      subCategory: 'foundation',
      title: 'Hoisting',
      permalink: '/learn/javascript/foundation/hoisting',
      order: 1,
      track: 'javascript',
      path: 'javascript/foundation/hoisting',
      status: 'published',
    });
    expect(item).not.toHaveProperty('content');
    expect(item).not.toHaveProperty('interviewQuestions');
  });

  it('strips content and interviewQuestions from every item', () => {
    const items = toNavItems(topics as VeliteTopicList);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).not.toHaveProperty('content');
      expect(item).not.toHaveProperty('interviewQuestions');
    }
  });
});

describe('buildTrackNav', () => {
  it('groups one track into subcategories sorted by order', () => {
    const jsItems = toNavItems(topics as VeliteTopicList).filter((t) => t.track === 'javascript');
    const nav = buildTrackNav(jsItems);

    expect(nav).toHaveLength(1);
    expect(nav[0].id).toBe('foundation');
    expect(nav[0].topics.map((t) => t.id)).toEqual(['hoisting', 'closures']);
    expect(nav[0].topics[0]).toMatchObject({
      title: 'Hoisting',
      href: '/learn/javascript/foundation/hoisting',
      path: 'javascript/foundation/hoisting',
    });
  });

  it('returns an empty list when there are no topics', () => {
    expect(buildTrackNav([])).toEqual([]);
  });
});
