import { AuthForm } from '@/components/auth/auth-form';
import { buildPageMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildPageMetadata({
  title: 'Create account',
  description: 'Create a free account to save mastery progress, points, and streaks. All topics remain free to read.',
  path: '/signup',
  noIndex: true,
});

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <AuthForm mode="signup" />
    </div>
  );
}
