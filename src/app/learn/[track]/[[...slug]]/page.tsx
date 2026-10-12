import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { topics, tracks } from '#site/content';
import { LearnLayout } from '@/components/navigation/learn-layout';
import {
  getTopicByPath,
  getTopicsForTrack,
  getTrackBySlug,
} from '@/lib/curriculum/get-topics';
import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { SITE_DESCRIPTION } from '@/lib/seo/site-config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { track, slug } = await params;
  const trackMeta = getTrackBySlug(track);

  if (!trackMeta) {
    return buildPageMetadata({ title: 'Not found', description: SITE_DESCRIPTION, noIndex: true });
  }

  const topic = getTopicByPath(track, slug);

  if (topic && (topic.status ?? 'published') === 'published') {
    const takeaway = topic.keyTakeaways[0] ?? trackMeta.description;
    return buildPageMetadata({
      title: `${topic.title} — ${trackMeta.title} Interview Questions`,
      description: `${takeaway} ${topic.estimatedMinutes}-minute topic with examples, deep dive, interview Q&A, and playground.`,
      path: topic.permalink,
      type: 'article',
    });
  }

  if (!slug?.length) {
    const publishedCount = getTopicsForTrack(track).filter(
      (t) => (t.status ?? 'published') === 'published',
    ).length;

    return buildPageMetadata({
      title: `${trackMeta.title} Interview Prep Track`,
      description: `${trackMeta.description} ${publishedCount} structured topics with mastery gates, playgrounds, and interview Q&A.`,
      path: `/learn/${track}`,
    });
  }

  return buildPageMetadata({
    title: trackMeta.title,
    description: trackMeta.description,
    path: `/learn/${track}/${slug.join('/')}`,
    noIndex: true,
  });
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ track: string; slug?: string[] }>;
}) {
  const { track, slug } = await params;
  const trackMeta = getTrackBySlug(track);

  if (!trackMeta) {
    notFound();
  }

  const trackTopics = getTopicsForTrack(track);
  const topic = getTopicByPath(track, slug);

  return <LearnLayout track={track} topics={trackTopics} topic={topic} />;
}

export function generateStaticParams() {
  const params: Array<{ track: string; slug?: string[] }> = [];

  for (const track of tracks) {
    params.push({ track: track.slug, slug: undefined });
  }

  for (const topic of topics) {
    const slug = topic.path.replace(`${topic.track}/`, '').split('/');
    params.push({ track: topic.track, slug });
  }

  return params;
}
