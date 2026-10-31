'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import {
  formatCountdown,
  remainingMs,
  RUBRIC_DIMENSIONS,
  type MockAnswer,
  type MockAnswers,
  type MockPack,
  type MockQuestion,
  type RecordingMeta,
  type RubricDimension,
  type RubricScores,
  type TestResult,
} from '@/lib/mocks/mock-session';
import type { MockSessionDto } from '@/lib/mocks/mock-dto';
import {
  saveMockAnswer,
  submitMock,
} from '@/lib/mocks/mock-api-client';
import { MockCodeRunner } from '@/components/mocks/mock-code-runner';
import { SpokenAnswerRecorder } from '@/components/mocks/spoken-answer-recorder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Draft {
  code?: string;
  text?: string;
  recording?: RecordingMeta;
  rubric?: RubricScores;
  note?: string;
}

interface RunState {
  results: TestResult[];
  testsRunAt: string;
  forCode: string;
}

const WARNING_THRESHOLD_MS = 5 * 60 * 1000;

function draftFromSaved(saved: MockAnswer | undefined): Draft {
  if (!saved) return {};
  return {
    code: saved.code,
    text: saved.text,
    recording: saved.recording,
    rubric: saved.rubric ? { ...saved.rubric } : undefined,
    note: saved.note,
  };
}

/**
 * Live mock session (spec 0003). Display-only countdown: the server
 * owns the deadline, so a late save or submit surfaces the timed_out
 * state instead of silently succeeding. Unsaved work is lost on
 * timeout, exactly as the spec requires — the UI says so next to Save.
 */
export function MockSessionClient({
  session,
  pack,
}: {
  session: MockSessionDto;
  pack: MockPack;
}) {
  const router = useRouter();
  const [savedAnswers, setSavedAnswers] = useState<MockAnswers>(session.answers);
  const [currentId, setCurrentId] = useState(pack.questions[0]?.id ?? '');
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      pack.questions.map((q) => [q.id, draftFromSaved(session.answers[q.id])]),
    ),
  );
  const [runs, setRuns] = useState<Record<string, RunState>>({});
  const [now, setNow] = useState(() => Date.now());
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoSubmittedRef = useRef(false);

  const current = pack.questions.find((q) => q.id === currentId) ?? pack.questions[0];
  const remaining = remainingMs(session.deadlineAt, new Date(now));
  const warning = remaining > 0 && remaining < WARNING_THRESHOLD_MS;
  const answeredCount = pack.questions.filter((q) => savedAnswers[q.id]).length;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timeout path: submit whatever is saved and let the server page
  // re-render as the results view. Unsaved drafts are lost on purpose.
  useEffect(() => {
    if (remaining !== 0 || autoSubmittedRef.current || submitting) return;
    autoSubmittedRef.current = true;
    setSubmitting(true);
    setError(null);
    void submitMock(session.id, {})
      .then(() => router.refresh())
      .catch(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function updateDraft(questionId: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }));
    setSaveMessage(null);
  }

  function toggleRubric(questionId: string, dimension: RubricDimension, value: 0 | 1 | 2) {
    const draft = drafts[questionId] ?? {};
    const rubric = { ...draft.rubric };
    if (rubric[dimension] === value) {
      delete rubric[dimension];
    } else {
      rubric[dimension] = value;
    }
    updateDraft(questionId, { rubric: Object.keys(rubric).length > 0 ? rubric : undefined });
  }

  /** Build the saveable answer for a question, or null when the draft
   * is empty. Returns an error string when the draft has content the
   * server would reject (e.g. rubric without an answer). */
  function buildAnswer(
    question: MockQuestion,
    draft: Draft,
  ): { answer: MockAnswer | null; error: string | null } {
    const answer: MockAnswer = {};
    if (question.kind === 'coding') {
      if (draft.code?.trim()) answer.code = draft.code;
      const run = runs[question.id];
      if (run && run.forCode === draft.code) {
        answer.tests = run.results;
        answer.testsRunAt = run.testsRunAt;
      }
    } else {
      if (draft.text?.trim()) answer.text = draft.text;
      if (draft.recording) answer.recording = draft.recording;
    }
    if (draft.rubric && Object.keys(draft.rubric).length > 0) answer.rubric = draft.rubric;
    if (draft.note?.trim()) answer.note = draft.note;
    if (Object.keys(answer).length === 0) return { answer: null, error: null };
    if (question.kind === 'coding' && !answer.code) {
      return { answer: null, error: 'A coding answer needs code before it can be saved.' };
    }
    if (question.kind === 'spoken' && !answer.text && !answer.recording) {
      return { answer: null, error: 'A spoken answer needs typed text, a recording, or both.' };
    }
    return { answer, error: null };
  }

  function isTerminalError(message: string): boolean {
    return /timed out|already finished/i.test(message);
  }

  async function handleSave() {
    if (!current) return;
    const draft = drafts[current.id] ?? {};
    const { answer, error: buildError } = buildAnswer(current, draft);
    if (buildError) {
      setError(buildError);
      return;
    }
    if (!answer) {
      setError('Nothing to save for this question yet.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const dto = await saveMockAnswer(session.id, current.id, answer);
      setSavedAnswers(dto.answers);
      setSaveMessage('Saved.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the answer.';
      if (isTerminalError(message)) {
        router.refresh();
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Manual submit saves every changed draft first, then finishes
      // the mock — so no valid unsaved work is dropped. Drafts that
      // buildAnswer rejects (empty, or content the server would
      // reject, e.g. rubric without an answer) are left unsaved:
      // they are unsaveable via Save for the same reason. A
      // non-terminal save failure surfaces its error and aborts the
      // submit instead of submitting partial work; a terminal error
      // refreshes, exactly as handleSave does. The timeout path is
      // different: it submits saved answers only.
      for (const question of pack.questions) {
        const draft = drafts[question.id] ?? {};
        const { answer, error: buildError } = buildAnswer(question, draft);
        if (buildError || !answer) continue;
        const saved = savedAnswers[question.id];
        if (JSON.stringify(answer) === JSON.stringify(saved ?? {})) continue;
        try {
          const dto = await saveMockAnswer(session.id, question.id, answer);
          setSavedAnswers(dto.answers);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Could not save the answer.';
          if (isTerminalError(message)) {
            router.refresh();
            return;
          }
          setError(message);
          setSubmitting(false);
          setConfirmSubmit(false);
          return;
        }
      }
      await submitMock(session.id, {});
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit the mock.';
      if (isTerminalError(message)) {
        router.refresh();
      } else {
        setError(message);
        setSubmitting(false);
        setConfirmSubmit(false);
      }
    }
  }

  if (!current) {
    return <p className="text-sm text-muted-foreground">This pack has no questions.</p>;
  }

  const draft = drafts[current.id] ?? {};
  const run = runs[current.id];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pack.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.durationMinutes} minute mock · {answeredCount} of {pack.questions.length}{' '}
            answered
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-3xl font-semibold tabular-nums ${
              remaining === 0
                ? 'text-destructive'
                : warning
                  ? 'text-amber-600 dark:text-amber-400'
                  : ''
            }`}
            role="timer"
            aria-label={`${formatCountdown(remaining)} remaining`}
          >
            {formatCountdown(remaining)}
          </p>
          <p className="text-sm text-muted-foreground">
            {remaining === 0
              ? "Time's up — submitting…"
              : warning
                ? 'Under 5 minutes left'
                : 'remaining'}
          </p>
        </div>
      </div>

      <nav aria-label="Questions" className="flex flex-wrap gap-2">
        {pack.questions.map((question, index) => {
          const saved = Boolean(savedAnswers[question.id]);
          const isCurrent = question.id === currentId;
          return (
            <Button
              key={question.id}
              type="button"
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              className="cursor-pointer gap-1"
              aria-current={isCurrent ? 'true' : undefined}
              onClick={() => {
                setCurrentId(question.id);
                setSaveMessage(null);
                setError(null);
                setConfirmSubmit(false);
              }}
            >
              {saved ? <Check className="size-4" /> : null}
              {index + 1}. {question.title}
            </Button>
          );
        })}
      </nav>

      <Card key={current.id}>
        <CardHeader>
          <CardTitle className="text-lg">
            {pack.questions.findIndex((q) => q.id === current.id) + 1}. {current.title}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            {current.kind === 'coding' ? 'Coding' : 'Spoken'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {current.kind === 'coding' ? (
            <>
              <p className="whitespace-pre-wrap text-sm">{current.prompt}</p>
              <MockCodeRunner
                task={current}
                initialCode={draft.code ?? savedAnswers[current.id]?.code ?? current.starterCode}
                onCodeChange={(code) => {
                  updateDraft(current.id, { code });
                  setRuns((prev) => {
                    const existing = prev[current.id];
                    if (!existing || existing.forCode === code) return prev;
                    const next = { ...prev };
                    delete next[current.id];
                    return next;
                  });
                }}
                onResults={(results) =>
                  setRuns((prev) => ({
                    ...prev,
                    [current.id]: {
                      results,
                      testsRunAt: new Date().toISOString(),
                      forCode: drafts[current.id]?.code ?? '',
                    },
                  }))
                }
              />
              {run ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Reported test results: {run.results.filter((r) => r.passed).length}/
                    {run.results.length} passed
                  </p>
                  <ul className="space-y-1">
                    {run.results.map((test) => (
                      <li key={test.index} className="text-sm text-muted-foreground">
                        {test.passed ? '✓' : '✗'} Test {test.index}: {test.label}
                        {test.message ? ` — ${test.message}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-sm">{current.question}</p>
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                A strong answer covers: {current.guidance}
              </p>
              <div className="space-y-2">
                <label htmlFor="spoken-text" className="text-sm font-medium">
                  Typed answer
                </label>
                <textarea
                  id="spoken-text"
                  value={draft.text ?? ''}
                  onChange={(event) => updateDraft(current.id, { text: event.target.value })}
                  rows={6}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Type your answer here, or record it below — or both."
                />
              </div>
              <SpokenAnswerRecorder
                attached={draft.recording ?? savedAnswers[current.id]?.recording ?? null}
                onAttach={(meta) => updateDraft(current.id, { recording: meta })}
              />
            </>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Follow-up probes to address in your answer</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {current.followUps.map((followUp) => (
                <li key={followUp}>{followUp}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">
              Self-score this answer (optional, 0 = miss, 1 = partial, 2 = strong)
            </p>
            {RUBRIC_DIMENSIONS.map((dimension) => (
              <div key={dimension.id} className="flex flex-wrap items-center gap-2">
                <span className="w-32 shrink-0 text-sm">{dimension.label}</span>
                <span className="hidden text-xs text-muted-foreground lg:inline">
                  {dimension.guidance}
                </span>
                <span className="ml-auto flex gap-1">
                  {([0, 1, 2] as const).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={draft.rubric?.[dimension.id] === value ? 'default' : 'outline'}
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => toggleRubric(current.id, dimension.id, value)}
                    >
                      {value}
                    </Button>
                  ))}
                </span>
              </div>
            ))}
            <div className="space-y-2">
              <label htmlFor="answer-note" className="text-sm font-medium">
                Note (optional)
              </label>
              <textarea
                id="answer-note"
                value={draft.note ?? ''}
                onChange={(event) => updateDraft(current.id, { note: event.target.value })}
                rows={2}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="What would you improve next time?"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {saveMessage ? <p className="text-sm text-emerald-600">{saveMessage}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="cursor-pointer"
              disabled={saving || submitting || remaining === 0}
              onClick={() => void handleSave()}
            >
              {saving ? 'Saving…' : 'Save answer'}
            </Button>
            <Button
              type="button"
              variant={confirmSubmit ? 'destructive' : 'outline'}
              className="cursor-pointer"
              disabled={submitting || remaining === 0}
              onClick={() => void handleSubmit()}
            >
              {submitting
                ? 'Submitting…'
                : confirmSubmit
                  ? 'Click again to confirm submit'
                  : 'Submit mock'}
            </Button>
            {confirmSubmit && !submitting ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => setConfirmSubmit(false)}
              >
                Cancel
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Save each answer before time runs out — unsaved work is lost on timeout. Submitting is
            final: a finished mock never reopens.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
