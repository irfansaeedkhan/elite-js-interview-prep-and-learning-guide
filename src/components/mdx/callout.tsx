import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Lightbulb, MessageSquare } from 'lucide-react';

const variants = {
  tip: {
    icon: Lightbulb,
    className: 'border-blue-500/20 bg-blue-500/5',
    label: 'Tip',
  },
  gotcha: {
    icon: AlertCircle,
    className: 'border-amber-500/20 bg-amber-500/5',
    label: 'Gotcha',
  },
  interview: {
    icon: MessageSquare,
    className: 'border-primary/20 bg-primary/5',
    label: 'Interview',
  },
  note: {
    icon: Lightbulb,
    className: 'border-border bg-muted/50',
    label: 'Note',
  },
} as const;

export type CalloutType = keyof typeof variants;

export interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const variant = variants[type];
  const Icon = variant.icon;
  const heading = title ?? variant.label;

  return (
    <aside
      className={cn(
        'my-6 flex gap-3 rounded-xl border p-4',
        variant.className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">{heading}</p>
        <div className="text-sm leading-relaxed text-muted-foreground [&>p]:m-0">
          {children}
        </div>
      </div>
    </aside>
  );
}
