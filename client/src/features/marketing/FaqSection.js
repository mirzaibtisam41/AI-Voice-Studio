'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '@/features/marketing/landingContent';
import {
  MarketingSection,
  SectionHeading,
} from '@/features/marketing/SectionHeading';
import { cn } from '@/lib/utils';

function FaqItem({ index, item, isOpen, onToggle }) {
  const buttonId = `faq-question-${index}`;
  const panelId = `faq-answer-${index}`;

  return (
    <li className="border-b last:border-b-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium transition-colors outline-none hover:text-brand focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          {item.question}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-ink-3 transition-transform',
              isOpen && 'rotate-180 text-brand',
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="px-5 pb-5 text-[14px] text-muted-foreground"
      >
        {item.answer}
      </div>
    </li>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <MarketingSection id="faq" labelledBy="faq-title">
      <SectionHeading
        id="faq-title"
        overline="FAQ"
        title="Questions, answered"
      />
      <ul className="mx-auto mt-12 max-w-3xl rounded-2xl border bg-card">
        {FAQS.map((item, index) => (
          <FaqItem
            key={item.question}
            index={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex((current) => (current === index ? null : index))
            }
          />
        ))}
      </ul>
    </MarketingSection>
  );
}
