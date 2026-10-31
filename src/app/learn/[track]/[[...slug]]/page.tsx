import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { topics, tracks } from '#site/content';
import { TopicArticle } from '@/components/curriculum/topic-article';
import { ActivitySection } from '@/components/progress/activity-section';
import {
  buildTrackNav,
  getTopicByPath,
  getTopicsForTrack,
  getTrackBySlug,
  toNavItems,
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

  const topic = getTopicByPath(track, slug);

  if (!slug?.length) {
    // Track index, not a bare "select a topic" prompt: track
    // description, topic count, and every group with its topics, so
    // the index page itself is useful and the sidebar track switch
    // lands here instead of jumping straight to the first topic.
    const published = getTopicsForTrack(track).filter(
      (t) => (t.status ?? 'published') === 'published',
    );
    const groups = buildTrackNav(toNavItems(published));
    return (
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="text-3xl font-semibold tracking-tight">{trackMeta.title}</h1>
        <p className="mt-2 text-muted-foreground">{trackMeta.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {published.length} topics · Sign in to save mastery progress, points, and streaks.
        </p>
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <section key={group.id}>
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <ul className="mt-3 space-y-1">
                {group.topics.map((t) => (
                  <li key={t.id}>
                    <Link href={t.href} className="text-sm text-primary hover:underline">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <ActivitySection />
      </div>
    );
  }

  if (!topic) {
    notFound();
  }

  return <TopicArticle topic={topic} />;
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
