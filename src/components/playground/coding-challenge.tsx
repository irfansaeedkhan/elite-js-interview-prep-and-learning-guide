'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useTopicOptional } from '@/components/curriculum/topic-context';
import { SandpackPlayground } from '@/components/playground/sandpack-playground-client';
import { useProgressActions } from '@/hooks/use-topic-progress';
import { fetchPracticeAttempts, recordPracticeAttempt } from '@/lib/progress/progress-api-client';
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
  const queryClient = useQueryClient();
  const [ran, setRan] = useState(false);
  const [saved, setSaved] = useState(false);
  const code = buildTestHarness(starterCode, tests);
  const history = useQuery({
    queryKey: ['practice-attempts', topic?.path],
    queryFn: () => fetchPracticeAttempts(topic!.path),
    enabled: Boolean(enabled && topic?.path),
    staleTime: 60_000,
  });

  async function handleMarkPassed() {
    setRan(true);
    if (!topic || !enabled) return;
    passChallenge(topic.path);
    const ok = await recordPracticeAttempt({
      topicPath: topic.path,
      kind: 'challenge',
      promptId: title,
      passed: true,
    });
    setSaved(ok);
    if (ok) {
      await queryClient.invalidateQueries({ queryKey: ['practice-attempts', topic.path] });
    }
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
      >
        Mark challenge attempted
      </Button>

      {ran ? (
        <p className={cn('text-sm text-muted-foreground')}>
          Check the console for ✓ / ✗ lines after you click Run. All green means you pass.
          {saved ? ' Saved to your history.' : ''}
          {!enabled
            ? ' This attempt stays on this page until you refresh. Sign in to save it.'
            : ''}
        </p>
      ) : null}

      {enabled && history.data?.attempts.length ? (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {history.data.attempts
            .filter((attempt) => attempt.kind === 'challenge')
            .slice(0, 5)
            .map((attempt) => (
              <li key={attempt.id}>
                {attempt.promptId} — {attempt.passed ? 'passed' : 'missed'}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
