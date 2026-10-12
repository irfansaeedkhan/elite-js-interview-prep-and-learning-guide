import { codeToHtml } from 'shiki';
import { cn } from '@/lib/utils';

export interface CodeExampleProps {
  title?: string;
  language?: 'javascript' | 'typescript' | 'jsx' | 'tsx';
  runnable?: boolean;
  children: string;
}

const highlightCache = new Map<string, { light: string; dark: string }>();

async function highlight(code: string, language: string) {
  const key = `${language}\0${code}`;
  const cached = highlightCache.get(key);
  if (cached) return cached;

  const [light, dark] = await Promise.all([
    codeToHtml(code, { lang: language, theme: 'github-light' }),
    codeToHtml(code, { lang: language, theme: 'github-dark' }),
  ]);
  const entry = { light, dark };
  highlightCache.set(key, entry);
  return entry;
}

export async function CodeExample({
  title,
  language = 'javascript',
  runnable = false,
  children,
}: CodeExampleProps) {
  const code = children.trim();
  const html = await highlight(code, language);

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
      <div
        className={cn(
          'overflow-x-auto p-4 text-sm dark:hidden [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0',
        )}
        dangerouslySetInnerHTML={{ __html: html.light }}
      />
      <div
        className={cn(
          'hidden overflow-x-auto p-4 text-sm dark:block [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0',
        )}
        dangerouslySetInnerHTML={{ __html: html.dark }}
      />
    </div>
  );
}
