'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import type { DiagramSize } from '@/types/curriculum';

const sizeClasses: Record<DiagramSize, string> = {
  inline: 'my-6 max-w-2xl',
  section: 'my-8 max-w-3xl mx-auto',
  full: 'my-10 w-full -mx-4 max-w-none px-4 sm:mx-0 sm:px-0',
};

export interface MermaidDiagramProps {
  children: string;
  caption?: string;
  size?: DiagramSize;
}

export function MermaidDiagram({
  children,
  caption,
  size = 'section',
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!containerRef.current) return;

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
          securityLevel: 'strict',
          fontFamily: 'inherit',
        });

        const { svg } = await mermaid.render(`mermaid-${id}`, children.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to render diagram');
        }
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [children, id, resolvedTheme]);

  return (
    <figure className={cn('rounded-xl border bg-muted/30 p-4', sizeClasses[size])}>
      {error ? (
        <pre className="overflow-x-auto p-4 text-xs text-destructive">{error}</pre>
      ) : (
        <div
          ref={containerRef}
          className="flex justify-center overflow-x-auto [&_svg]:max-w-full"
          aria-busy={!error}
        />
      )}
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
