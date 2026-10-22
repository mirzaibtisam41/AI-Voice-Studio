'use client';

import { cn } from '@/lib/utils';

export function Chip({ selected, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        selected
          ? 'border-brand/60 bg-brand-tint text-brand'
          : 'border-transparent bg-field text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ChoiceChips({ label, options, value, onChange, className }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => {
        const optionValue = option.value ?? option;
        const optionLabel = option.label ?? option;

        return (
          <Chip
            key={optionValue}
            selected={value === optionValue}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </Chip>
        );
      })}
    </div>
  );
}
