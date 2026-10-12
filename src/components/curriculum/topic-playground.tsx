'use client';

export interface TopicPlaygroundProps {
  children?: React.ReactNode;
}

/** Wraps topic playground tab content (Sandpack, output prediction, challenges). */
export function TopicPlayground({ children }: TopicPlaygroundProps) {
  if (children) {
    return <div className="space-y-6">{children}</div>;
  }

  return (
    <p className="text-sm text-muted-foreground">
      Playground exercises for this topic are not available yet.
    </p>
  );
}
