import { USE_CASES } from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

export function UseCasesSection() {
  return (
    <MarketingSection id="use-cases" labelledBy="use-cases-title">
      <SectionHeading
        id="use-cases-title"
        overline="Use cases"
        title="Built for every team that works with audio"
      />
      <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((useCase) => {
          const Icon = useCase.icon;

          return (
            <li key={useCase.title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-field text-brand">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[14.5px] font-semibold">{useCase.title}</h3>
                <p className="text-[13px] text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </MarketingSection>
  );
}
