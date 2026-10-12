import { describe, expect, it } from 'vitest';
import { topics } from '#site/content';
import { toNavItems } from '@/lib/curriculum/get-topics';

describe('toNavItems', () => {
  it('keeps sidebar fields and drops article payload', () => {
    const [item] = toNavItems(topics as Parameters<typeof toNavItems>[0]);
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
});
