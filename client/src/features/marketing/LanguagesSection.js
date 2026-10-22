import { Languages } from 'lucide-react';
import { LANGUAGES } from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

export function LanguagesSection() {
  return (
    <MarketingSection labelledBy="languages-title">
      <div className="relative overflow-hidden rounded-3xl border bg-card px-5 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-40 size-105 rounded-full bg-[radial-gradient(circle,var(--brand-glow),transparent_65%)] opacity-50"
        />
        <div className="relative">
          <SectionHeading
            id="languages-title"
            overline="Localization"
            title="One script. Every market."
            description="Write once and generate natural speech in more than 50 languages, with transcription that detects the language automatically."
          />
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {LANGUAGES.map((language) => (
              <li
                key={language}
                className="inline-flex h-9 items-center gap-2 rounded-full border bg-field px-4 text-[13.5px]"
              >
                <Languages className="size-3.5 text-brand" aria-hidden="true" />
                {language}
              </li>
            ))}
            <li className="inline-flex h-9 items-center rounded-full border border-dashed px-4 font-mono text-[12.5px] text-ink-3">
              +36 more
            </li>
          </ul>
        </div>
      </div>
    </MarketingSection>
  );
}
