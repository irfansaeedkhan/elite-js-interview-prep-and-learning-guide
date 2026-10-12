import { notFound } from 'next/navigation';
import { TopicIndexProvider } from '@/components/curriculum/topic-index-context';
import { LearnShell } from '@/components/navigation/learn-shell';
import {
  buildTrackNav,
  getTopicsForTrack,
  getTrackBySlug,
  getTrackNavItems,
  toNavItems,
} from '@/lib/curriculum/get-topics';
import { getTopicIndex } from '@/lib/progress/mastery';

export default async function LearnTrackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  const trackMeta = getTrackBySlug(track);

  if (!trackMeta) {
    notFound();
  }

  const nav = buildTrackNav(toNavItems(getTopicsForTrack(track)));

  return (
    <TopicIndexProvider index={getTopicIndex()}>
      <LearnShell track={track} nav={nav} trackItems={getTrackNavItems()}>
        {children}
      </LearnShell>
    </TopicIndexProvider>
  );
}
