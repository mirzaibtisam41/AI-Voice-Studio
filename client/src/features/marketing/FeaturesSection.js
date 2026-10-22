import { FEATURES } from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

export function FeaturesSection() {
  return (
    <MarketingSection id="features" labelledBy="features-title">
      <SectionHeading
        id="features-title"
        overline="Features"
        title="One studio for every voice workflow"
        description="Everything you need to create, understand and converse with audio, sharing one library and one credit balance."
      />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <li
              key={feature.title}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-brand/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-[15px] font-semibold">{feature.title}</h3>
              <p className="text-[13.5px] text-muted-foreground">
                {feature.description}
              </p>
            </li>
          );
        })}
      </ul>
    </MarketingSection>
  );
}
