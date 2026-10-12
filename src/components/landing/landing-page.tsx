import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Braces,
  CheckCircle2,
  Code2,
  Layers,
  Lock,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { LandingHeader } from '@/components/landing/landing-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveTracks, getDefaultTrackHref, getTopicsForTrack } from '@/lib/curriculum/get-topics';
import { LANDING_FAQ } from '@/lib/seo/landing-faq';
import { getSiteUrl } from '@/lib/seo/site-config';

function ProductPreview() {
  return (
    <div
      className="overflow-hidden rounded-3xl border bg-muted/30 shadow-sm"
      aria-hidden
    >
      <div className="flex border-b bg-muted/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <span className="mx-auto text-xs text-muted-foreground">Learn — JavaScript · Closures</span>
      </div>
      <div className="flex min-h-[280px] text-[10px] sm:min-h-[320px] sm:text-xs">
        <div className="w-[18%] shrink-0 border-r bg-muted/20 p-3">
          <p className="mb-2 font-medium text-muted-foreground">Tracks</p>
          <div className="space-y-1.5">
            <div className="rounded-md bg-primary px-2 py-1 text-primary-foreground">JavaScript</div>
            <div className="rounded-md px-2 py-1 text-muted-foreground">React</div>
          </div>
        </div>
        <div className="w-[26%] shrink-0 border-r p-3">
          <p className="mb-2 font-medium">Topics</p>
          <div className="space-y-1 text-muted-foreground">
            <div className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">Closures</div>
            <div className="px-2 py-1">Event Loop</div>
            <div className="px-2 py-1">Promises</div>
          </div>
        </div>
        <div className="min-w-0 flex-1 p-4">
          <p className="text-sm font-semibold sm:text-base">Closures</p>
          <p className="mt-1 text-muted-foreground">Definition · Examples · Q&amp;A · Playground</p>
          <div className="mt-4 rounded-xl border bg-card p-3">
            <p className="font-medium">Mastery progress</p>
            <p className="mt-1 text-muted-foreground">Interview Q&amp;A — 3 / 4 &quot;Got it&quot;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LANDING_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LandingPage() {
  const activeTracks = getActiveTracks();
  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-background">
      <FaqJsonLd />
      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Structured interview mastery
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Master every topic before the next one.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Most prep gives you fragments. We give you complete topic mastery — understand it,
                apply it, go deep, prove it — with runnable code and real interview Q&amp;A.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="cursor-pointer rounded-full px-8" asChild>
                  <Link href="/learn/javascript">
                    Start learning
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer rounded-full px-8" asChild>
                  <Link href="#tracks">Explore tracks</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Topics are free to read. Sign in to save progress, points, and streaks.
              </p>
            </div>
            <ProductPreview />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Fragmented prep doesn&apos;t build real understanding
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: 'Scattered Q&A lists',
                  body: 'GreatFrontEnd threads and blog posts — no order, no depth, no proof you learned it.',
                },
                {
                  title: 'Algorithms without concepts',
                  body: 'LeetCode drills patterns but skips the "explain closures" round that senior interviews expect.',
                },
                {
                  title: 'Video courses you can\'t revisit',
                  body: 'Hard to jump to one topic at 2am before an interview. You need reference-grade structure.',
                },
              ].map((item) => (
                <Card key={item.title} className="rounded-3xl border-0 bg-card shadow-sm">
                  <CardHeader>
                    <XCircle className="size-5 text-muted-foreground" aria-hidden />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{item.body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                One mastery flow for every topic
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Definition → examples → deep dive → interview Q&amp;A → prove it. No skipping ahead
                until you actually understand.
              </p>
            </div>
            <ol className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
              {[
                'Understand — clear definitions and mental models',
                'Apply — runnable examples and Sandpack playground',
                'Go deep — edge cases and follow-up prompts',
                'Prove it — Q&A scores, challenges, mastery gates',
              ].map((step, i) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-2xl border bg-card p-5 text-sm leading-relaxed sm:text-base"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-foreground" aria-hidden />
                  <span>
                    <span className="font-medium">{i + 1}.</span> {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for senior-level depth
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: 'Structured curriculum',
                  body: '40+ JavaScript topics and a full React track — ordered for interview readiness, not random blog order.',
                },
                {
                  icon: Code2,
                  title: 'Runnable playground',
                  body: 'Edit code, predict output, pass coding challenges. JavaScript and JSX Sandpack templates.',
                },
                {
                  icon: Target,
                  title: 'Mastery gates',
                  body: 'Mark Q&A as "Got it", pass challenges, unlock progress rings — optional hard lock for disciplined learners.',
                },
                {
                  icon: Sparkles,
                  title: 'Gamification when signed in',
                  body: 'Points, streaks, and cross-device sync — without hiding content from guests.',
                },
                {
                  icon: Lock,
                  title: 'Always free to read',
                  body: 'Every topic page is public. Accounts save progress and stats, not access.',
                },
                {
                  icon: Braces,
                  title: 'Multi-track roadmap',
                  body: 'JavaScript and React live. Next.js, Node, Express, and more reuse the same infrastructure.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <Card key={title} className="rounded-3xl">
                  <CardHeader>
                    <Icon className="size-5 text-muted-foreground" aria-hidden />
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tracks */}
        <section id="tracks" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with JavaScript, grow into full-stack
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
              Same UX on every track — pick up where prerequisites leave off.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {activeTracks.map((track) => {
                const topicCount = getTopicsForTrack(track.slug).filter(
                  (t) => (t.status ?? 'published') === 'published',
                ).length;
                const href = getDefaultTrackHref(track.slug);
                const Icon = track.slug === 'react' ? Layers : BookOpen;

                return (
                  <Card key={track.slug} className="rounded-3xl">
                    <CardHeader>
                      <Icon className="size-6 text-muted-foreground" aria-hidden />
                      <CardTitle className="text-xl">{track.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{topicCount} topics · mastery gates</p>
                      <Button className="mt-4 cursor-pointer rounded-full" asChild>
                        <Link href={href}>
                          Open {track.title} track
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-y bg-muted/20 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <div className="mt-12 space-y-8">
              {LANDING_FAQ.map((item) => (
                <article key={item.question}>
                  <h3 className="text-lg font-semibold leading-snug sm:text-xl">{item.question}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop collecting questions. Start mastering concepts.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From &quot;I&apos;ve heard of closures&quot; to &quot;I can explain it in an interview.&quot;
            </p>
            <Button size="lg" className="mt-8 cursor-pointer rounded-full px-10" asChild>
              <Link href="/learn/javascript">
                Start learning — free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Elite Interview Prep</p>
          <div className="flex gap-6">
            <Link href="/learn/javascript" className="cursor-pointer hover:text-foreground">
              Learn
            </Link>
            <Link href="/login" className="cursor-pointer hover:text-foreground">
              Sign in
            </Link>
            <a href={`${siteUrl}/sitemap.xml`} className="cursor-pointer hover:text-foreground">
              Sitemap
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
