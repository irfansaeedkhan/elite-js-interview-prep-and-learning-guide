'use client';

import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  SandpackStack,
  useActiveCode,
  useSandpack,
  useSandpackShellStdout,
} from '@codesandbox/sandpack-react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ensureSandpackStyles } from '@/lib/playground/ensure-sandpack-styles';
import { sandpackDarkTheme, sandpackLightTheme } from '@/lib/playground/sandpack-theme';
import { cn } from '@/lib/utils';
import {
  buildHiddenRunner,
  parseTestLogs,
  type CodingQuestion,
  type TestResult,
} from '@/lib/mocks/mock-session';

export interface MockCodeRunnerProps {
  task: CodingQuestion;
  initialCode: string;
  onCodeChange: (code: string) => void;
  onResults: (results: TestResult[]) => void;
}

/** Reports the active (solution) file's code upward on every edit. */
function CodeReporter({ onCodeChange }: { onCodeChange: (code: string) => void }) {
  const { code } = useActiveCode();
  useEffect(() => {
    onCodeChange(code);
  }, [code, onCodeChange]);
  return null;
}

/** Parses console output into per-test results and reports them. */
function ResultsListener({ onResults }: { onResults: (results: TestResult[]) => void }) {
  const { logs } = useSandpackShellStdout({ resetOnPreviewRestart: true });
  useEffect(() => {
    const results = parseTestLogs(logs.map((log) => log.data));
    if (results.length > 0) onResults(results);
  }, [logs, onResults]);
  return null;
}

function RunnerRunButton({ consoleRef }: { consoleRef: React.RefObject<ComponentRef<typeof SandpackConsole> | null> }) {
  const { sandpack } = useSandpack();
  const { code } = useActiveCode();

  async function handleRun() {
    flushSync(() => {
      sandpack.updateCurrentFile(code, true);
    });
    consoleRef.current?.reset();
    for (const clientId of Object.keys(sandpack.clients)) {
      sandpack.unregisterBundler(clientId);
    }
    await sandpack.runSandpack();
  }

  return (
    <Button type="button" size="sm" className="shrink-0 cursor-pointer gap-1.5" onClick={() => void handleRun()}>
      <Play className="size-3.5 fill-current" /> Run
    </Button>
  );
}

function MockCodeRunnerInner({ onCodeChange, onResults }: Pick<MockCodeRunnerProps, 'onCodeChange' | 'onResults'>) {
  const consoleRef = useRef<ComponentRef<typeof SandpackConsole>>(null);
  return (
    <>
      <div className="sandpack-toolbar flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
        <span className="min-w-0 flex-1 text-xs text-muted-foreground">
          Edit your solution, then click Run. Hidden tests run against it — they are not shown
          in the editor.
        </span>
        <RunnerRunButton consoleRef={consoleRef} />
      </div>
      <SandpackLayout className="sandpack-vertical !rounded-none !border-0">
        <SandpackStack className="!min-w-0 !flex-1">
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            showInlineErrors
            showRunButton={false}
            wrapContent
            style={{ minHeight: 280, maxHeight: 280 }}
          />
          <SandpackConsole
            ref={consoleRef}
            standalone
            showHeader
            showResetConsoleButton
            resetOnPreviewRestart
            showRestartButton={false}
          />
        </SandpackStack>
      </SandpackLayout>
      <CodeReporter onCodeChange={onCodeChange} />
      <ResultsListener onResults={onResults} />
    </>
  );
}

/**
 * Coding task runner for timed mocks. The editor shows ONLY the
 * learner's solution file; the hidden test-runner file is the entry
 * point the bundler executes but is never the visible file. Tests
 * are hidden from the editor UI, not from the browser (see spec
 * 0003): this is practice, not proctoring.
 */
export function MockCodeRunner({ task, initialCode, onCodeChange, onResults }: MockCodeRunnerProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Stable reference: a new files object would reset Sandpack to the
  // initial code on every keystroke. The shell remounts this
  // component (keyed by question id) when the question changes.
  const filesRef = useRef<Record<string, string> | null>(null);
  if (!filesRef.current) {
    filesRef.current = {
      '/solution.js': initialCode,
      '/index.js': buildHiddenRunner(task.tests),
    };
  }

  useEffect(() => {
    setMounted(true);
    void ensureSandpackStyles();
  }, []);

  const theme = mounted && resolvedTheme === 'dark' ? sandpackDarkTheme : sandpackLightTheme;

  return (
    <div className={cn('sandpack-shell overflow-hidden rounded-xl border bg-card')}>
      <SandpackProvider
        key={task.id}
        template="node"
        theme={theme}
        files={filesRef.current}
        options={{
          visibleFiles: ['/solution.js'],
          activeFile: '/solution.js',
          autoReload: false,
          autorun: false,
          recompileMode: 'immediate',
          recompileDelay: 300,
          initMode: 'immediate',
        }}
      >
        <MockCodeRunnerInner onCodeChange={onCodeChange} onResults={onResults} />
      </SandpackProvider>
    </div>
  );
}
