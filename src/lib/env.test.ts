import { describe, expect, it, afterEach } from 'vitest';
import { getEnv, resetEnvCache } from '@/lib/env';

describe('getEnv', () => {
  afterEach(() => {
    resetEnvCache();
  });

  it('does not throw on module import', async () => {
    await expect(import('@/lib/env')).resolves.toBeDefined();
  });

  it('throws when required vars are missing on first read', () => {
    const saved = { ...process.env };
    delete process.env.DATABASE_URL;
    resetEnvCache();
    expect(() => getEnv()).toThrow(/DATABASE_URL/);
    process.env = saved;
    resetEnvCache();
  });
});
