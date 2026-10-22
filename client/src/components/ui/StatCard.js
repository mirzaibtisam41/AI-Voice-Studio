import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({ label, value, icon: Icon, note, trend }) {
  const TrendIcon = trend?.startsWith('-') ? TrendingDown : TrendingUp;

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="truncate font-serif text-[28px] leading-none font-semibold tracking-tight">
        {value}
      </div>
      {trend ? (
        <p
          className={cn(
            'flex items-center gap-1 text-[12px]',
            trend.startsWith('-') ? 'text-danger' : 'text-success',
          )}
        >
          <TrendIcon className="size-3.5" aria-hidden="true" />
          {trend}
        </p>
      ) : (
        <p className="truncate text-[12px] text-ink-3">{note ?? ' '}</p>
      )}
    </div>
  );
}
