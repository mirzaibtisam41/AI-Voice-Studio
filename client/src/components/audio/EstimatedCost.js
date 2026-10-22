import { Zap } from 'lucide-react';

export function EstimatedCost({ credits, label = 'Estimated cost' }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-field px-4 py-3">
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 font-mono text-[14px] font-semibold text-brand">
        <Zap className="size-3.5" aria-hidden="true" />
        {credits.toLocaleString()} credits
      </span>
    </div>
  );
}
