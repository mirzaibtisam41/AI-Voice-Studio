import { CtaSection } from '@/features/marketing/CtaSection';
import { FaqSection } from '@/features/marketing/FaqSection';
import { FeaturesSection } from '@/features/marketing/FeaturesSection';
import { HeroSection } from '@/features/marketing/HeroSection';
import { LanguagesSection } from '@/features/marketing/LanguagesSection';
import { MarketingFooter } from '@/features/marketing/MarketingFooter';
import { MarketingNav } from '@/features/marketing/MarketingNav';
import { PricingSection } from '@/features/marketing/PricingSection';
import { ShowcaseSection } from '@/features/marketing/ShowcaseSection';
import { StepsSection } from '@/features/marketing/StepsSection';
import { TestimonialsSection } from '@/features/marketing/TestimonialsSection';
import { UseCasesSection } from '@/features/marketing/UseCasesSection';

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <MarketingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ShowcaseSection />
        <LanguagesSection />
        <StepsSection />
        <UseCasesSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
