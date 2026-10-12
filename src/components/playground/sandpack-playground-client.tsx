'use client';

import dynamic from 'next/dynamic';

export type { SandpackPlaygroundProps } from '@/components/playground/sandpack-playground';

export const SandpackPlayground = dynamic(
  () =>
    import('@/components/playground/sandpack-playground').then((m) => m.SandpackPlayground),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border bg-muted/20 text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  },
);
