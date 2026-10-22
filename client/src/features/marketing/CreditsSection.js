import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CREDITS_PER_MINUTE,
  SIGNUP_CREDITS,
  TTS_CHARACTERS_PER_CREDIT,
} from '@/constants/pricing';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

const RATES = [
  {
    feature: 'Text to Speech',
    rate: `1 credit / ${TTS_CHARACTERS_PER_CREDIT} characters`,
  },
  {
    feature: 'Speech to Text',
    rate: `${CREDITS_PER_MINUTE.speechToText} credit / minute`,
  },
  {
    feature: 'Real-time & voice agents',
    rate: `${CREDITS_PER_MINUTE.realtime} credits / minute`,
  },
  {
    feature: 'Voice Transformation',
    rate: `${CREDITS_PER_MINUTE.voiceTransformation} credits / minute`,
  },
  {
    feature: 'Audio Enhancement',
    rate: `${CREDITS_PER_MINUTE.enhancement} credit / minute`,
  },
];

const INCLUDED = [
  'Every tool in the studio',
  'All built-in voices',
  'No card, no subscription',
  'Your usage history',
];

export function CreditsSection() {
  return (
    <MarketingSection id="credits" labelledBy="credits-title">
      <SectionHeading
        id="credits-title"
        overline="Credits"
        title="Free to try, no subscription"
        description={`This is a demo project. Sign up and you get ${SIGNUP_CREDITS} credits once, enough to try every tool. There are no plans and nothing to pay.`}
      />
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-2xl border border-brand/60 bg-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Zap className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-5xl font-medium">{SIGNUP_CREDITS}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              free credits when you sign up
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
            You always see the cost before you run anything.
          </p>
          <ul className="mt-2 flex flex-col divide-y">
            {RATES.map((item) => (
              <li
                key={item.feature}
                className="flex items-center justify-between gap-4 py-3 text-[13.5px]"
              >
                <span>{item.feature}</span>
                <span className="font-mono text-[12.5px] font-semibold text-brand">
                  {item.rate}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MarketingSection>
  );
}
