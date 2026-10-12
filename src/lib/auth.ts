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
    storage: 'database',
  },
});

export type Session = typeof auth.$Infer.Session;
