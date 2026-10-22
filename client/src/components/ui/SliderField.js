'use client';

import { Slider } from '@/components/ui/slider';

export function SliderField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (current) => current,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[12.5px] text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-[12px] font-semibold">
          {format(value)}
        </span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        disabled={disabled}
      />
    </div>
  );
}
