import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/db';
import { account, session, user, verification } from '@/db/schema/auth.schema';
import { env, isGoogleOAuthEnabled } from '@/lib/env';

export const auth = betterAuth({
  appName: 'Elite Interview Prep',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),

  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  ...(isGoogleOAuthEnabled()
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),

  rateLimit: {
    enabled: env.NODE_ENV === 'production',
    // NOTE: never 'database' here unless a rateLimit model is added to
    // the drizzle schema and pushed to the database. With 'database',
    // better-auth queries the rateLimit model on EVERY auth request
    // (router onRequest, before routing), and the adapter throws
    // 'model "rateLimit" was not found in the schema object' because
    // no such model exists in src/db/schema. That crash turned every
    // production /api/auth/* request into an empty 500, which the
    // client shows as the generic 'Sign up failed' / 'Sign in failed'.
    // 'memory' is better-auth's default storage and needs no table.
    storage: 'memory',
  },
});

export type Session = typeof auth.$Infer.Session;
