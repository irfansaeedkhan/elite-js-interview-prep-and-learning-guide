'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { canStartRecording, type RecordingMeta } from '@/lib/mocks/mock-session';

export interface SpokenAnswerRecorderProps {
  onAttach: (meta: RecordingMeta) => void;
  attached: RecordingMeta | null;
}

/**
 * Consent-gated spoken answers (spec 0003). Nothing records without
 * an explicit per-recording consent checkbox. The audio blob lives
 * only in this browser session: playback works here, but refreshing
 * the page loses the clip (metadata and typed text survive). No
 * audio bytes are uploaded anywhere in this slice.
 */
export function SpokenAnswerRecorder({ onAttach, attached }: SpokenAnswerRecorderProps) {
  const [consent, setConsent] = useState(false);
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConsent(checked: boolean) {
    setConsent(checked);
    setConsentAt(checked ? new Date().toISOString() : null);
  }

  async function handleStart() {
    if (!canStartRecording(consent)) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Recording is not supported in this browser. You can still type your answer.');
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setDurationSeconds(Math.round((Date.now() - startRef.current) / 1000));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      startRef.current = Date.now();
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone unavailable. Check permission and try again, or type your answer.');
    }
  }

  function handleStop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function handleDiscard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDurationSeconds(null);
  }

  function handleAttach() {
    if (audioUrl === null || durationSeconds === null || consentAt === null) return;
    onAttach({ durationSeconds, recordedAt: new Date().toISOString(), consentAt });
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <p className="text-sm font-medium">Spoken answer (optional)</p>
      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => handleConsent(event.target.checked)}
          className="mt-0.5 shrink-0 cursor-pointer"
        />
        <span>I consent to recording this answer in my browser for this mock review.</span>
      </label>
      {attached ? (
        <p className="text-sm text-muted-foreground">
          Attached: {attached.durationSeconds}s recording (from this browser session).
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {!recording ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer"
            disabled={!canStartRecording(consent)}
            onClick={() => void handleStart()}
          >
            Start recording
          </Button>
        ) : (
          <Button type="button" size="sm" variant="destructive" className="cursor-pointer" onClick={handleStop}>
            Stop recording
          </Button>
        )}
        {audioUrl && !recording ? (
          <>
            <Button type="button" size="sm" variant="outline" className="cursor-pointer" onClick={handleAttach}>
              Attach to answer
            </Button>
            <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={handleDiscard}>
              Discard
            </Button>
          </>
        ) : null}
        {recording ? (
          <span className="text-sm font-medium text-destructive" role="status">
            Recording…
          </span>
        ) : null}
      </div>
      {audioUrl ? (
        <div className="space-y-1">
          <audio controls src={audioUrl} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Playback works in this browser session. Refreshing the page loses the clip, but your
            typed text and recording details stay saved.
          </p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
