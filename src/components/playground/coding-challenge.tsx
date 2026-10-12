'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTopicOptional } from '@/components/curriculum/topic-context';
import { SandpackPlayground } from '@/components/playground/sandpack-playground-client';
import { useProgressActions } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export interface CodingChallengeTest {
  label: string;
  code: string;
}

export interface CodingChallengeProps {
  title: string;
  prompt: string;
  starterCode: string;
  tests: CodingChallengeTest[];
  hint?: string;
}

function buildTestHarness(starterCode: string, tests: CodingChallengeTest[]): string {
  const testBlock = tests
    .map(
      (t, i) => `try {
  ${t.code}
  console.log('✓ Test ${i + 1}: ${t.label.replace(/'/g, "\\'")}');
} catch (e) {
  console.error('✗ Test ${i + 1}: ${t.label.replace(/'/g, "\\'")} —', e.message);
}`,
    )
    .join('\n\n');

  return `${starterCode.trim()}

${testBlock}`;
}

export function CodingChallenge({
  title,
  prompt,
  starterCode,
  tests,
  hint,
}: CodingChallengeProps) {
  const topic = useTopicOptional();
  const { passChallenge, enabled } = useProgressActions();
  const [ran, setRan] = useState(false);
  const code = buildTestHarness(starterCode, tests);

  function handleMarkPassed() {
    setRan(true);
    if (topic && enabled) passChallenge(topic.path);
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{prompt}</p>
        {hint ? <p className="mt-2 text-sm text-muted-foreground italic">{hint}</p> : null}
      </div>

      <SandpackPlayground code={code} editorHeight={320} showConsole />

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="cursor-pointer"
        onClick={handleMarkPassed}
        disabled={!enabled}
      >
        Mark challenge attempted
      </Button>

      {ran ? (
        <p className={cn('text-sm text-muted-foreground')}>
          Check the console for ✓ / ✗ lines after you click Run. All green means you pass.
        </p>
      ) : null}
    </div>
  );
}
