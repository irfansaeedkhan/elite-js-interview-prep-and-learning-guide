export const SITE_NAME = 'Elite Interview Prep';

export const SITE_TAGLINE = 'Structured technical interview mastery';

export const SITE_DESCRIPTION =
  'Master every interview topic before moving on — definitions, runnable examples, deep dives, Q&A, and coding challenges. JavaScript and React tracks live.';

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return url.replace(/\/$/, '');
}

export const DEFAULT_OG_IMAGE = {
  url: '/og/default.png',
  width: 1200,
  height: 630,
  alt: 'Elite Interview Prep — structured interview mastery platform',
} as const;
