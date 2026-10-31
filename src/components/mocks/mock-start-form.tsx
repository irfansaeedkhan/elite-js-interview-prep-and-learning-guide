'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALLOWED_DURATIONS_MINUTES, type MockPack } from '@/lib/mocks/mock-session';
import { startMock } from '@/lib/mocks/mock-api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Start a timed mock (spec 0003). Pack + duration only; the server
 * computes the deadline, so the client never decides the outcome. */
export function MockStartForm({ packs }: { packs: MockPack[] }) {
  const router = useRouter();
  const [packId, setPackId] = useState(packs[0]?.id ?? '');
  const [durationMinutes, setDurationMinutes] = useState(
    packs[0]?.defaultDurationMinutes ?? 30,
  );
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPack = packs.find((pack) => pack.id === packId);

  function handlePackChange(id: string) {
    setPackId(id);
    const pack = packs.find((p) => p.id === id);
    if (pack) setDurationMinutes(pack.defaultDurationMinutes);
  }

  async function handleStart() {
    if (!packId) return;
    setStarting(true);
    setError(null);
    try {
      const session = await startMock(packId, durationMinutes);
      router.push(`/mocks/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the mock.');
      setStarting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Start a timed mock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mock-pack" className="text-sm font-medium">
            Question pack
          </label>
          <select
            id="mock-pack"
            value={packId}
            onChange={(event) => handlePackChange(event.target.value)}
            className="w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
          >
            {packs.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title}
              </option>
            ))}
          </select>
          {selectedPack ? (
            <p className="text-sm text-muted-foreground">{selectedPack.description}</p>
          ) : null}
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Duration</legend>
          <div className="flex flex-wrap gap-2">
            {ALLOWED_DURATIONS_MINUTES.map((minutes) => (
              <Button
                key={minutes}
                type="button"
                variant={durationMinutes === minutes ? 'default' : 'outline'}
                size="sm"
                className="cursor-pointer"
                onClick={() => setDurationMinutes(minutes)}
              >
                {minutes} min
              </Button>
            ))}
          </div>
        </fieldset>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          type="button"
          className="cursor-pointer"
          disabled={starting || !packId}
          onClick={() => void handleStart()}
        >
          {starting ? 'Starting…' : 'Start mock'}
        </Button>
        <p className="text-sm text-muted-foreground">
          Practice, not a proctored exam. Scores are self-assessment; nothing here certifies
          ability to anyone else.
        </p>
      </CardContent>
    </Card>
  );
}
