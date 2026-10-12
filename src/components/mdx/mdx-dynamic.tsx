'use client';

import dynamic from 'next/dynamic';

function editorFallback() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border bg-muted/20 text-sm text-muted-foreground">
      Loading editor…
    </div>
  );
}

export const MermaidDiagram = dynamic(
  () => import('@/components/mdx/mermaid-diagram').then((m) => m.MermaidDiagram),
  { ssr: false },
);

export const CodingChallenge = dynamic(
  () => import('@/components/playground/coding-challenge').then((m) => m.CodingChallenge),
  { ssr: false, loading: editorFallback },
);

export const ReactPlayground = dynamic(
  () => import('@/components/playground/react-playground').then((m) => m.ReactPlayground),
  { ssr: false, loading: editorFallback },
);

export const SandpackPlayground = dynamic(
  () =>
    import('@/components/playground/sandpack-playground').then((m) => m.SandpackPlayground),
  { ssr: false, loading: editorFallback },
);
