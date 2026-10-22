'use client';

import { Switch } from '@/components/ui/switch';

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-[13px] font-medium">{label}</span>
        {description ? (
          <span className="block text-[12px] text-ink-3">{description}</span>
        ) : null}
      </label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
