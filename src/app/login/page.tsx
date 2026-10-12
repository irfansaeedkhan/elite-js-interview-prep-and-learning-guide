import { AuthForm } from '@/components/auth/auth-form';
import { buildPageMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildPageMetadata({
  title: 'Sign in',
  description: 'Sign in to sync interview prep progress, points, and streaks across devices.',
  path: '/login',
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}
