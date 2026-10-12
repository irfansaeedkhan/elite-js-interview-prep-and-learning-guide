import * as runtime from 'react/jsx-runtime';
import type { HTMLAttributes } from 'react';
import { Callout } from '@/components/mdx/callout';
import { CodeExample } from '@/components/mdx/code-example';
import { Figure } from '@/components/mdx/figure';
import {
  InterviewQuestion,
  InterviewQuestionBlock,
  KeyTakeaways,
} from '@/components/mdx/interview-question';
import {
  CodingChallenge,
  MermaidDiagram,
  ReactPlayground,
  SandpackPlayground,
} from '@/components/mdx/mdx-dynamic';
import { EventLoopExplorer } from '@/components/diagrams/event-loop-explorer';
import { FlashcardDeck } from '@/components/playground/flashcard-deck';
import { OutputPrediction } from '@/components/playground/output-prediction';
import { TopicDefinition } from '@/components/curriculum/topic-definition';
import { TopicPlayground } from '@/components/curriculum/topic-playground';
import { TopicQuickStats } from '@/components/curriculum/topic-quick-stats';
import { TopicTab, TopicTabs } from '@/components/curriculum/topic-tabs';

const components = {
  Callout,
  CodeExample,
  Figure,
  MermaidDiagram,
  KeyTakeaways,
  InterviewQuestion,
  InterviewQuestionBlock,
  EventLoopExplorer,
  OutputPrediction,
  ReactPlayground,
  SandpackPlayground,
  FlashcardDeck,
  CodingChallenge,
  TopicTabs,
  TopicTab,
  TopicQuickStats,
  TopicDefinition,
  TopicPlayground,
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-10 scroll-mt-24 text-2xl font-semibold first:mt-0" {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-8 scroll-mt-24 text-xl font-semibold" {...props} />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-relaxed text-muted-foreground" {...props} />
  ),
};

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default as React.ComponentType<{
    components?: Record<string, unknown>;
  }>;
}

export interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = getMDXComponent(code);
  return <Component components={components} />;
}
