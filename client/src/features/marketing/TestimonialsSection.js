import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';

export function TestimonialsSection() {
  return (
    <MarketingSection id="testimonials" labelledBy="testimonials-title">
      <SectionHeading
        id="testimonials-title"
        overline="Customers"
        title="Teams already shipping with AI Voice Studio"
      />
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <li key={testimonial.name}>
            <figure className="flex h-full flex-col gap-5 rounded-2xl border bg-card p-6">
              <Quote className="size-6 text-brand" aria-hidden="true" />
              <blockquote className="flex-1 font-serif text-[17px] leading-relaxed">
                {testimonial.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t pt-4">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-brand-tint text-[13px] font-semibold text-brand"
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-[14px] font-semibold">
                    {testimonial.name}
                  </p>
                  <p className="text-[12.5px] text-ink-3">{testimonial.role}</p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </MarketingSection>
  );
}
