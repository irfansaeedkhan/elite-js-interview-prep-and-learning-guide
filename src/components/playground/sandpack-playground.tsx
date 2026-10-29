'use client';

import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
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
} from '@codesandbox/sandpack-react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ensureSandpackStyles } from '@/lib/playground/ensure-sandpack-styles';
import { sandpackDarkTheme, sandpackLightTheme } from '@/lib/playground/sandpack-theme';
import { cn } from '@/lib/utils';

export interface SandpackPlaygroundProps {
  code: string;
  title?: string;
  filename?: string;
  template?: 'node' | 'react';
  editorHeight?: number;
  showConsole?: boolean;
  readOnly?: boolean;
}

interface PlaygroundRunButtonProps {
  consoleRef: React.RefObject<ComponentRef<typeof SandpackConsole> | null>;
}

function PlaygroundRunButton({ consoleRef }: PlaygroundRunButtonProps) {
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
    <Button
      type="button"
      size="sm"
      className="shrink-0 cursor-pointer gap-1.5"
      onClick={() => void handleRun()}
    >
      <Play className="size-3.5 fill-current" />
      Run
    </Button>
  );
}

interface SandpackPlaygroundInnerProps {
  editorHeight: number;
  showConsole: boolean;
  readOnly: boolean;
}

function SandpackPlaygroundInner({
  editorHeight,
  showConsole,
  readOnly,
}: SandpackPlaygroundInnerProps) {
  const consoleRef = useRef<ComponentRef<typeof SandpackConsole>>(null);

  return (
    <>
      <div className="sandpack-toolbar flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
        <span className="min-w-0 flex-1 text-xs text-muted-foreground">
          {readOnly
            ? 'Read-only preview'
            : 'Edit the code, then click Run — output appears in Console'}
        </span>
        {!readOnly ? <PlaygroundRunButton consoleRef={consoleRef} /> : null}
      </div>

      <SandpackLayout className="sandpack-vertical !rounded-none !border-0">
        <SandpackStack className="!min-w-0 !flex-1">
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            showInlineErrors
            showRunButton={false}
            wrapContent
            readOnly={readOnly}
            style={{ minHeight: editorHeight, maxHeight: editorHeight }}
          />
          {showConsole ? (
            <>
              {/* Own deterministic header, labelled Console: Sandpack's
                  built-in console header renders its own label, which
                  the walk found reading Terminal while every other
                  piece of copy says Console. Hiding it and labelling
                  the pane ourselves keeps header and copy in agreement
                  regardless of the Sandpack version. */}
              <div className="border-t bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Console
              </div>
              <SandpackConsole
                ref={consoleRef}
                standalone
                showHeader={false}
                showResetConsoleButton
                resetOnPreviewRestart
                showRestartButton={false}
              />
            </>
          ) : null}
        </SandpackStack>
      </SandpackLayout>
    </>
  );
}

export function SandpackPlayground({
  code,
  title,
  filename,
  template = 'node',
  editorHeight = 280,
  showConsole = true,
  readOnly = false,
}: SandpackPlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const resolvedFilename =
    filename ?? (template === 'react' ? '/App.js' : '/index.js');

  // Stable reference — a new object every render resets Sandpack to the MDX original.
  const sandpackFiles = useMemo(
    () => ({ [resolvedFilename]: code.trim() }),
    [resolvedFilename, code],
  );

  useEffect(() => {
    setMounted(true);
    void ensureSandpackStyles();
  }, []);

  const theme =
    mounted && resolvedTheme === 'dark' ? sandpackDarkTheme : sandpackLightTheme;

  return (
    <div className={cn('sandpack-shell overflow-hidden rounded-xl border bg-card')}>
      {title ? (
        <div className="border-b bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground">
          {title}
        </div>
      ) : null}

      <SandpackProvider
        key={`${template}:${resolvedFilename}:${code}`}
        template={template}
        theme={theme}
        files={sandpackFiles}
        options={{
          visibleFiles: [resolvedFilename],
          activeFile: resolvedFilename,
          autoReload: false,
          autorun: false,
          recompileMode: 'immediate',
          recompileDelay: 300,
          initMode: 'immediate',
        }}
      >
        <SandpackPlaygroundInner
          editorHeight={editorHeight}
          showConsole={showConsole}
          readOnly={readOnly}
        />
      </SandpackProvider>
    </div>
  );
}
