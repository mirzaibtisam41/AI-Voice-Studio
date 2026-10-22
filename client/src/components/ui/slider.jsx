'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Slider as SliderPrimitive } from 'radix-ui';

function Slider({ className, value, defaultValue, ...props }) {
  const values = value ?? defaultValue ?? [0];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      className={cn(
        'relative flex w-full touch-none items-center py-1.5 select-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-input">
        <SliderPrimitive.Range className="absolute h-full bg-brand" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block size-4 rounded-full border-[3px] border-brand bg-background shadow-[0_0_0_4px_var(--brand-tint)] transition-shadow outline-none focus-visible:shadow-[0_0_0_6px_var(--brand-glow)]"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
