import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { env } from '@/lib/env';

const globalForDb = globalThis as typeof globalThis & {
  __eliteLearnPool?: Pool;
};

const pool =
  globalForDb.__eliteLearnPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (env.NODE_ENV !== 'production') {
  globalForDb.__eliteLearnPool = pool;
}

export const db = drizzle(pool, { schema });
