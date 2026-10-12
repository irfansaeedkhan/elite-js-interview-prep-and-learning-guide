import { cn } from '@/lib/utils';

export type DiagramSize = 'inline' | 'section' | 'full';

const sizeClasses: Record<DiagramSize, string> = {
  inline: 'my-6 max-w-2xl',
  section: 'my-8 max-w-3xl mx-auto',
  full: 'my-10 w-full max-w-none',
};

export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  size?: DiagramSize;
}

export function Figure({ src, alt, caption, size = 'section' }: FigureProps) {
  return (
    <figure className={cn('rounded-xl border bg-muted/30 p-4', sizeClasses[size])}>
      <div className="overflow-x-auto rounded-lg bg-background p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="mx-auto h-auto w-full max-w-full" />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
