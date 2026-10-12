import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata = buildPageMetadata({
  title: 'Elite Interview Prep',
  description:
    'Master every interview topic before moving on. Structured JavaScript and React curriculum with playgrounds, Q&A, and mastery gates.',
  path: '/',
});

export default function HomePage() {
  return <LandingPage />;
}
