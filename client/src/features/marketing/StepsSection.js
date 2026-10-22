import { STEPS } from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

export function StepsSection() {
  return (
    <MarketingSection id="how-it-works" labelledBy="steps-title">
      <SectionHeading
        id="steps-title"
        overline="How it works"
        title="From idea to finished audio in four steps"
      />
      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
          >
            <span className="font-mono text-[13px] text-brand">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-serif text-xl font-medium">{step.title}</h3>
            <p className="text-[13.5px] text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </MarketingSection>
  );
}
