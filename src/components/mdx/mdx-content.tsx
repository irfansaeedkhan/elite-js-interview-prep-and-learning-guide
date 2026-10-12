'use client';

import * as runtime from 'react/jsx-runtime';
import { useMemo } from 'react';
import { mdxComponents } from '@/components/mdx/mdx-components';

function useMDXComponent(code: string) {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default as React.ComponentType<{
      components?: Record<string, unknown>;
    }>;
  }, [code]);
}

export interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);

  return <Component components={mdxComponents} />;
}
