import type { MetadataRoute } from 'next';
import { topics } from '#site/content';
import { getActiveTracks, getDefaultTrackHref } from '@/lib/curriculum/get-topics';
import { getSiteUrl } from '@/lib/seo/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${siteUrl}/learn/javascript`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/learn/react`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const topicRoutes: MetadataRoute.Sitemap = topics
    .filter((t) => (t.status ?? 'published') === 'published')
    .map((topic) => ({
      url: `${siteUrl}${topic.permalink}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: topic.track === 'javascript' || topic.track === 'react' ? 0.8 : 0.5,
    }));

  return [...staticRoutes, ...topicRoutes];
}
