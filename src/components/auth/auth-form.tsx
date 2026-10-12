'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { signIn, signUp } from '@/lib/auth-client';

export interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const result = await signUp.email({ name, email, password });
        if (result.error) {
          setError(result.error.message ?? 'Sign up failed');
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? 'Sign in failed');
          return;
        }
      }

      router.push('/learn/javascript');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-semibold">{isSignup ? 'Create account' : 'Sign in'}</h1>
        <p className="text-sm text-muted-foreground">
          {isSignup
            ? 'Save progress, earn points, and sync across devices.'
            : 'Pick up where you left off with synced progress.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup ? (
          <label className="block space-y-1.5 text-sm">
            <span>Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-input-background px-3 py-2"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block space-y-1.5 text-sm">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-input-background px-3 py-2"
            autoComplete="email"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span>Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-input-background px-3 py-2"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link href={isSignup ? '/login' : '/signup'} className="underline-offset-2 hover:underline">
          {isSignup ? 'Sign in' : 'Sign up'}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Topics stay free to read without an account.
      </p>
    </Card>
  );
}
