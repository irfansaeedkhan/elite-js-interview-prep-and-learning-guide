'use client';

import type { HTMLAttributes } from 'react';
import { Callout } from './callout';
import { CodeExample } from './code-example';
import { Figure } from './figure';
import {
  InterviewQuestion,
  InterviewQuestionBlock,
  KeyTakeaways,
} from './interview-question';
import { MermaidDiagram } from './mermaid-diagram';
import { EventLoopExplorer } from '@/components/diagrams/event-loop-explorer';
import { CodingChallenge } from '@/components/playground/coding-challenge';
import { FlashcardDeck } from '@/components/playground/flashcard-deck';
import { OutputPrediction } from '@/components/playground/output-prediction';
import { ReactPlayground } from '@/components/playground/react-playground';
import { SandpackPlayground } from '@/components/playground/sandpack-playground-client';
import { TopicDefinition } from '@/components/curriculum/topic-definition';
import { TopicPlayground } from '@/components/curriculum/topic-playground';
import { TopicQuickStats } from '@/components/curriculum/topic-quick-stats';
import { TopicTab, TopicTabs } from '@/components/curriculum/topic-tabs';

export const mdxComponents = {
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

export {
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
};
