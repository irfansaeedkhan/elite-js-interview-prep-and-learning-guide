import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex cursor-pointer items-center gap-2 font-semibold tracking-tight">
          <BookOpen className="size-5" />
          <span>Interview Prep</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="cursor-pointer transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#tracks" className="cursor-pointer transition-colors hover:text-foreground">
            Tracks
          </a>
          <a href="#faq" className="cursor-pointer transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="cursor-pointer rounded-full" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" className="cursor-pointer rounded-full" asChild>
            <Link href="/learn/javascript">Start learning</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
