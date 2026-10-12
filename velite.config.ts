import { defineCollection, defineConfig, s } from 'velite';

const tracks = defineCollection({
  name: 'Track',
  pattern: 'tracks/*/track.json',
  schema: s.object({
    title: s.string(),
    slug: s.string(),
    description: s.string(),
    order: s.number(),
    icon: s.string(),
  }),
});

const categories = defineCollection({
  name: 'Category',
  pattern: 'tracks/*/*/category.json',
  schema: s
    .object({
      title: s.string(),
      slug: s.string().optional(),
      order: s.number(),
    })
    .transform((data, { meta }) => {
      const path = String(meta.path).replace(/\\/g, '/');
      const match = path.match(/tracks\/([^/]+)\/([^/]+)\/category\.json$/);
      return {
        ...data,
        track: match?.[1] ?? '',
        subCategory: match?.[2] ?? data.slug ?? '',
      };
    }),
});

const topics = defineCollection({
  name: 'Topic',
  pattern: 'tracks/**/*.mdx',
  schema: s
    .object({
      title: s.string(),
      slug: s.string(),
      track: s.string(),
      subCategory: s.string(),
      order: s.number().default(0),
      estimatedMinutes: s.number(),
      status: s.enum(['published', 'preview']).default('published'),
      prerequisites: s.array(s.string()).optional(),
      keyTakeaways: s.array(s.string()),
      masteryCriteria: s.object({
        minQuestionsCorrect: s.number(),
        requireChallenge: s.boolean().optional(),
      }),
      difficulty: s.enum(['easy', 'medium', 'hard']),
      interviewQuestions: s.array(
        s.object({
          id: s.string(),
          question: s.string(),
          answer: s.string(),
          difficulty: s.enum(['easy', 'medium', 'hard']),
          followUps: s.array(s.string()).optional(),
        }),
      ),
      content: s.mdx(),
    })
    .transform((data) => {
      const path = `${data.track}/${data.subCategory}/${data.slug}`;
      return { ...data, path, permalink: `/learn/${path}` };
    }),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { tracks, categories, topics },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
});
