import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/site-config';

export interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  /** Set false to rely on file-based opengraph-image.tsx */
  includeOgImage?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path = '',
  noIndex = false,
  type = 'website',
  includeOgImage = false,
}: PageMetadataOptions): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = path === '' || path === '/' ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
      ...(includeOgImage ? { images: [DEFAULT_OG_IMAGE] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

export function buildRootMetadata(): Metadata {
  return {
    ...buildPageMetadata({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      path: '/',
    }),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
  };
}
