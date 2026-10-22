'use client';

import Link from 'next/link';
import { Check, CircleAlert, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicPlatformQuery } from '@/features/marketing/platformApi';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

const UNIT_LABELS = {
  per_100_characters: 'per 100 characters',
  per_minute: 'per minute',
  per_message: 'per message',
};

const INCLUDED = [
  'Every tool in the studio',
  'All built-in voices',
  'No card, no subscription',
  'Your usage history',
];

function formatRate(rate) {
  const credits = `${rate.creditsPerUnit} ${rate.creditsPerUnit === 1 ? 'credit' : 'credits'}`;
  const unit = UNIT_LABELS[rate.unit] ?? rate.unit.replaceAll('_', ' ');

  return `${credits} ${unit}`;
}

function RatesList({ rates, isLoading, isError }) {
  if (isLoading) {
    return (
      <ul className="mt-2 flex flex-col gap-4" aria-label="Loading rates">
        {[0, 1, 2, 3].map((index) => (
          <li key={index} className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-32" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError || rates.length === 0) {
    return (
      <p className="mt-2 flex items-start gap-2 rounded-xl border bg-field/50 p-3 text-[13px] text-muted-foreground">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Current rates are not available right now. You will see the exact cost
        in the studio before you run anything.
      </p>
    );
  }

  return (
    <ul className="mt-2 flex flex-col divide-y">
      {rates.map((rate) => (
        <li
          key={rate.capability}
          className="flex items-center justify-between gap-4 py-3 text-[13.5px]"
        >
          <span className="flex min-w-0 flex-col">
            <span>{rate.label}</span>
            {rate.modelName ? (
              <span className="text-[12px] text-ink-3">{rate.modelName}</span>
            ) : null}
          </span>
          <span className="shrink-0 text-right font-mono text-[12.5px] font-semibold text-brand">
            {formatRate(rate)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CreditsSection() {
  const { data, isLoading, isError } = usePublicPlatformQuery();
  const signupCredits = data?.settings?.signupCredits;
  const rates = data?.rates ?? [];

  return (
    <MarketingSection id="credits" labelledBy="credits-title">
      <SectionHeading
        id="credits-title"
        overline="Credits"
        title="Free to try, no subscription"
        description={
          signupCredits
            ? `This is a demo project. Sign up and you get ${signupCredits} credits once, enough to try every tool. There are no plans and nothing to pay.`
            : 'This is a demo project. Sign up and you get free credits once, enough to try every tool. There are no plans and nothing to pay.'
        }
      />
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-2xl border border-brand/60 bg-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Zap className="size-5" aria-hidden="true" />
          </span>
          <div>
            {isLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <p className="font-serif text-5xl font-medium">
                {signupCredits ?? 'Free'}
              </p>
            )}
            <p className="mt-1 text-[13px] text-muted-foreground">
              {signupCredits || isLoading
                ? 'free credits when you sign up'
                : 'credits when you sign up'}
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px]">
                <Check className="size-4 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-auto">
            <Link href="/register">Create free account</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
          <h3 className="text-[15px] font-semibold">What a credit buys</h3>
          <p className="text-[13px] text-muted-foreground">
            Current rates and the model behind each tool. You always see the
            cost before you run anything.
          </p>
          <RatesList rates={rates} isLoading={isLoading} isError={isError} />
        </div>
      </div>
    </MarketingSection>
  );
}
