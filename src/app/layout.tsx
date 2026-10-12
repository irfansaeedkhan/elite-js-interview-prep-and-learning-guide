import type { Metadata } from 'next';
import { buildRootMetadata } from '@/lib/seo/build-metadata';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProviders } from '@/components/providers/app-providers';
import './globals.css';

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
