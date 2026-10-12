'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TopicDefinition({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-lg">Definition</CardTitle>
        <p className="text-sm text-muted-foreground">
          Say it out loud in an interview — clear, simple, no textbook wording.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-base leading-7 text-foreground [&_p]:my-0 [&_p]:text-base [&_p]:leading-7 [&_p]:text-foreground [&_strong]:font-semibold">
        {children}
      </CardContent>
    </Card>
  );
}
