'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTopicOptional } from '@/components/curriculum/topic-context';
import { predictionsMatch } from '@/lib/playground/normalize-prediction';
import { SandpackPlayground } from '@/components/playground/sandpack-playground-client';
import { recordPracticeAttempt } from '@/lib/progress/progress-api-client';
import { useProgressEnabled } from '@/hooks/use-topic-progress';
import { cn } from '@/lib/utils';

export interface OutputPredictionProps {
  title: string;
  code: string;
  expected: string;
  hint?: string;
  explanation: string;
}

export function OutputPrediction({
  title,
  code,
  expected,
  hint = 'Type letters in order, e.g. A, D, C, B',
  explanation,
}: OutputPredictionProps) {
  const topic = useTopicOptional();
  const { enabled } = useProgressEnabled();
  const [guess, setGuess] = useState('');
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const correct = checked && predictionsMatch(guess, expected);

  async function handleCheck() {
    const passed = predictionsMatch(guess, expected);
    setChecked(true);
    setSaved(false);
    if (!topic || !enabled) return;
    const ok = await recordPracticeAttempt({
      topicPath: topic.path,
      kind: 'prediction',
      promptId: title,
      passed,
    });
    setSaved(ok);
  }

  function handleReset() {
    setGuess('');
    setChecked(false);
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Predict what prints and in what order — then run the code below to verify.
        </p>

        <pre className="my-6 overflow-x-auto rounded-xl border bg-card p-4 text-sm">
          <code>{code}</code>
        </pre>

        <div className="mt-4 space-y-3">
          <label className="text-sm font-medium" htmlFor="output-guess">
            Your prediction
          </label>
          <input
            id="output-guess"
            type="text"
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setChecked(false);
            }}
            placeholder={hint}
            className="flex h-10 w-full max-w-md rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="cursor-pointer" onClick={handleCheck}>
              Check prediction
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>

        {checked ? (
          <div
            className={cn(
              'mt-4 rounded-lg border px-4 py-3 text-sm',
              correct
                ? 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
            )}
          >
            <p className="font-medium">{correct ? 'Correct!' : 'Not quite — compare below'}</p>
            <p className="mt-1 text-muted-foreground">
              Expected: <span className="font-mono text-foreground">{expected}</span>
            </p>
            <p className="mt-2 leading-relaxed text-muted-foreground">{explanation}</p>
            {saved ? (
              <p className="mt-2 text-muted-foreground">Saved to your history.</p>
            ) : null}
            {!enabled ? (
              <p className="mt-2 text-muted-foreground">
                This attempt stays on this page until you refresh. Sign in to save it.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <SandpackPlayground
        title="Run it — use the Run button above the editor; output appears in Console"
        code={code}
        editorHeight={240}
        showConsole
      />
    </div>
  );
}
