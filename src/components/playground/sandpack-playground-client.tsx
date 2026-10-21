'use client';

import dynamic from 'next/dynamic';

export type { SandpackPlaygroundProps } from '@/components/playground/sandpack-playground';

/**
 * Client entry for the Sandpack editor. The inner `ssr: false` is load-bearing:
 * `output-prediction.tsx` statically imports this module into the server-rendered
 * MDX tree (client components SSR by default), so this is what keeps the
 * browser-only editor out of SSR. It also keeps `@codesandbox/sandpack-react`
 * in its own async chunk, separate from the challenge/prediction shells.
 */
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
