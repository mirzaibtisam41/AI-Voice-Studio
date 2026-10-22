import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingSection } from '@/features/marketing/SectionHeading';

export function CtaSection() {
  return (
    <MarketingSection labelledBy="cta-title">
      <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-48 left-1/2 size-140 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--brand-glow),transparent_65%)]"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2
            id="cta-title"
            className="font-serif text-3xl leading-tight font-medium tracking-tight text-balance sm:text-5xl"
          >
            Your next audio project starts in seconds.
          </h2>
          <p className="text-[15px] text-muted-foreground">
            50 free credits, no card required.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/register">
              Create free account
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </MarketingSection>
  );
}
