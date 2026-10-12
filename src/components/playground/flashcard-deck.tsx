'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getInterviewQuestionById,
  useTopicOptional,
} from '@/components/curriculum/topic-context';
import { useProgressActions } from '@/hooks/use-topic-progress';
import type { Difficulty } from '@/types/curriculum';
import { cn } from '@/lib/utils';

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
  hard: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
};

export interface FlashcardDeckProps {
  ids: string[];
}

export function FlashcardDeck({ ids }: FlashcardDeckProps) {
  const topic = useTopicOptional();
  const { recordKnow, recordReview, enabled } = useProgressActions();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const id = ids[index];
  const card = getInterviewQuestionById(topic ?? null, id);

  if (!card) {
    return (
      <p className="text-sm text-muted-foreground">
        Flashcard <code>{id}</code> not found in topic frontmatter.
      </p>
    );
  }

  const goNext = () => {
    setIndex((i) => (i + 1) % ids.length);
    setRevealed(false);
  };

  const goPrev = () => {
    setIndex((i) => (i - 1 + ids.length) % ids.length);
    setRevealed(false);
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Card {index + 1} of {ids.length}
        </p>
        <Badge variant="outline" className={cn('capitalize', difficultyStyles[card.difficulty])}>
          {card.difficulty}
        </Badge>
      </div>

      <p className="text-lg font-medium leading-relaxed">{card.question}</p>

      {revealed ? (
        <div className="mt-6 space-y-4 border-t pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{card.answer}</p>
          {card.followUps?.length ? (
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {card.followUps.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
          {enabled ? (
            <div className="flex flex-wrap gap-2">
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
      ) : (
        <Button
          type="button"
          className="mt-6 cursor-pointer"
          onClick={() => setRevealed(true)}
        >
          Reveal answer
        </Button>
      )}

      <div className="mt-6 flex justify-between gap-2 border-t pt-4">
        <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-1" onClick={goPrev}>
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-1" onClick={goNext}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
