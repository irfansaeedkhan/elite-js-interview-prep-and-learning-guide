'use client';

import type { ReactNode } from 'react';
import type { Difficulty } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import {
  getInterviewQuestionById,
  useTopicOptional,
} from '@/components/curriculum/topic-context';
import { useProgressActions } from '@/hooks/use-topic-progress';

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
  hard: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
};

export interface KeyTakeawaysProps {
  items?: string[];
  /** Velite injects from frontmatter when omitted in MDX */
}

/** Renders key takeaways — Velite injects `items` from frontmatter at build time. */
export function KeyTakeaways({ items: itemsProp }: KeyTakeawaysProps) {
  const topic = useTopicOptional();
  const items = itemsProp ?? topic?.keyTakeaways;

  if (!items?.length) {
    return null;
  }

  return (
    <div className="my-8 rounded-xl border bg-muted/30 p-6">
      <h3 className="mb-4 text-lg font-semibold">Key takeaways</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed">
            <span className="text-primary" aria-hidden>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface InterviewQuestionBlockProps {
  id: string;
  question?: string;
  answer?: string;
  difficulty?: Difficulty;
  followUps?: string[];
}

/** Structured Q&A from frontmatter — Velite merges by `id`. */
export function InterviewQuestionBlock({ id, question, answer, difficulty, followUps }: InterviewQuestionBlockProps) {
  const topic = useTopicOptional();
  const { recordKnow, recordReview, enabled } = useProgressActions();
  const fromFrontmatter = getInterviewQuestionById(topic ?? null, id);
  const resolved = {
    question: question ?? fromFrontmatter?.question,
    answer: answer ?? fromFrontmatter?.answer,
    difficulty: difficulty ?? fromFrontmatter?.difficulty ?? 'medium',
    followUps: followUps ?? fromFrontmatter?.followUps,
  };

  if (!resolved.question || !resolved.answer) {
    return (
      <div className="my-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Interview question <code>{id}</code> — resolved from frontmatter at build time
      </div>
    );
  }

  return (
    <details className="my-4 group rounded-xl border bg-card">
      <summary className="cursor-pointer list-none px-4 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start gap-3">
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${difficultyStyles[resolved.difficulty as Difficulty]}`}
          >
            {resolved.difficulty}
          </span>
          <span className="flex-1 text-left font-medium">{resolved.question}</span>
        </div>
      </summary>
      <div className="space-y-3 border-t px-4 py-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{resolved.answer}</p>
        {resolved.followUps?.length ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Follow-ups
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {resolved.followUps.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {enabled ? (
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => topic && recordKnow(topic.path, id)}
            >
              Got it
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => topic && recordReview(topic.path, id)}
            >
              Review later
            </Button>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export interface InterviewQuestionProps {
  id: string;
  question: string;
  difficulty?: Difficulty;
  followUps?: string[];
  children?: ReactNode;
}

/** Narrative Q&A — answer body can include Mermaid, Figure, etc. */
export function InterviewQuestion({
  id,
  question,
  difficulty = 'medium',
  followUps,
  children,
}: InterviewQuestionProps) {
  return (
    <details className="my-4 group rounded-xl border bg-card" data-question-id={id}>
      <summary className="cursor-pointer list-none px-4 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start gap-3">
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${difficultyStyles[difficulty]}`}
          >
            {difficulty}
          </span>
          <span className="flex-1 text-left font-medium">{question}</span>
        </div>
      </summary>
      <div className="space-y-3 border-t px-4 py-4">
        {children ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            {children}
          </div>
        ) : null}
        {followUps?.length ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Follow-ups
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {followUps.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}
