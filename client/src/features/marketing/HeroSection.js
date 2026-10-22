import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroDemo } from '@/features/marketing/HeroDemo';
import { HERO_STATS } from '@/features/marketing/landingContent';
import { Overline } from '@/features/marketing/SectionHeading';

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-160 rounded-full bg-[radial-gradient(circle,var(--brand-glow),transparent_65%)] opacity-70"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <Overline>AI voice platform</Overline>
          <h1
            id="hero-title"
            className="font-serif text-[42px] leading-[1.05] font-medium tracking-tight text-balance sm:text-6xl"
          >
            Give every word a voice worth listening to.
          </h1>
          <p className="max-w-xl text-[16px] text-pretty text-muted-foreground sm:text-[17px]">
            Generate lifelike speech, transcribe meetings, clone voices and run
            real-time voice agents from one studio with one credit balance.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start free — 10,000 credits
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#demo">
                <Play className="fill-current" />
                Hear a demo
              </a>
            </Button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <dt className="order-2 text-[12px] text-ink-3">{stat.label}</dt>
                <dd className="order-1 font-mono text-[17px] font-medium">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}
