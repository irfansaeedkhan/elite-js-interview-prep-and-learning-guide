'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { codeToHtml } from 'shiki';
import { cn } from '@/lib/utils';

export interface CodeExampleProps {
  title?: string;
  language?: 'javascript' | 'typescript' | 'jsx' | 'tsx';
  runnable?: boolean;
  children: string;
}

export function CodeExample({
  title,
  language = 'javascript',
  runnable = false,
  children,
}: CodeExampleProps) {
  const code = children.trim();
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language,
          theme: resolvedTheme === 'dark' ? 'github-dark' : 'github-light',
        });
        if (!cancelled) setHtml(highlighted);
      } catch {
        if (!cancelled) setHtml(null);
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, language, resolvedTheme]);

  return (
    <div className="my-6 overflow-hidden rounded-xl border bg-card">
      {(title || runnable) && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
          {title ? <span className="text-sm font-medium">{title}</span> : <span />}
          {runnable ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              Runnable in Phase 2
            </span>
          ) : null}
        </div>
      )}
      {html ? (
        <div
          className={cn(
            'overflow-x-auto p-4 text-sm [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0',
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      )}
    </div>
  );
}
