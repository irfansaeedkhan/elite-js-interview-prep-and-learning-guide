'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CodeExample } from '@/components/mdx/code-example';
import { predictionsMatch } from '@/lib/playground/normalize-prediction';
import { SandpackPlayground } from '@/components/playground/sandpack-playground-client';
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
  const [guess, setGuess] = useState('');
  const [checked, setChecked] = useState(false);
  const correct = checked && predictionsMatch(guess, expected);

  function handleCheck() {
    setChecked(true);
  }

  function handleReset() {
    setGuess('');
    setChecked(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Predict what prints and in what order — then run the code below to verify.
        </p>

        <CodeExample title="Code">{code}</CodeExample>

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
