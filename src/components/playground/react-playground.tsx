'use client';

import { SandpackPlayground } from '@/components/playground/sandpack-playground-client';

export interface ReactPlaygroundProps {
  code: string;
  title?: string;
  editorHeight?: number;
  readOnly?: boolean;
}

export function ReactPlayground({
  code,
  title,
  editorHeight = 320,
  readOnly = false,
}: ReactPlaygroundProps) {
  return (
    <SandpackPlayground
      code={code}
      title={title}
      template="react"
      filename="/App.js"
      editorHeight={editorHeight}
      showConsole
      readOnly={readOnly}
    />
  );
}
