'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = {
  title: string;
  stack: string[];
  microtasks: string[];
  macrotasks: string[];
  log: string[];
};

const STEPS: Step[] = [
  {
    title: '1. Sync code runs',
    stack: ['main()', "console.log('A')", "console.log('D')"],
    microtasks: [],
    macrotasks: ['setTimeout → log B'],
    log: ['A', 'D'],
  },
  {
    title: '2. Stack empty — drain microtasks',
    stack: [],
    microtasks: ["Promise.then → log C"],
    macrotasks: ['setTimeout → log B'],
    log: ['A', 'D'],
  },
  {
    title: '3. Microtask runs',
    stack: ["Promise.then → log C"],
    microtasks: [],
    macrotasks: ['setTimeout → log B'],
    log: ['A', 'D', 'C'],
  },
  {
    title: '4. One macrotask',
    stack: ['setTimeout callback → log B'],
    microtasks: [],
    macrotasks: [],
    log: ['A', 'D', 'C', 'B'],
  },
];

function QueueColumn({
  label,
  items,
  highlight,
}: {
  label: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        highlight ? 'border-primary/40 bg-primary/5' : 'bg-muted/30',
      )}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="min-h-[4rem] space-y-1">
        {items.length === 0 ? (
          <li className="text-xs text-muted-foreground italic">empty</li>
        ) : (
          items.map((item) => (
            <li key={item} className="rounded bg-background px-2 py-1 text-xs font-mono">
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/** Tier 3 — interactive step-through for event loop output prediction */
export function EventLoopExplorer() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  return (
    <div className="my-8 rounded-xl border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Interactive — step through one tick</h3>
          <p className="text-sm text-muted-foreground">{step.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => i - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={stepIndex === STEPS.length - 1}
            onClick={() => setStepIndex((i) => i + 1)}
          >
            Next step
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QueueColumn label="Call stack" items={step.stack} highlight={step.stack.length > 0} />
        <QueueColumn label="Microtasks" items={step.microtasks} highlight={step.microtasks.length > 0} />
        <QueueColumn label="Macrotasks" items={step.macrotasks} highlight={step.macrotasks.length > 0} />
      </div>

      <p className="mt-4 text-sm">
        <span className="font-medium">Console so far:</span>{' '}
        <code className="rounded bg-muted px-2 py-0.5">{step.log.join(' → ')}</code>
      </p>
    </div>
  );
}
