import { cn } from '@/lib/utils';

const TONES = {
  success: 'bg-success/12 text-success',
  brand: 'bg-brand-tint text-brand',
  info: 'bg-blue/12 text-blue',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  neutral: 'bg-field text-muted-foreground',
};

export function StatusBadge({
  tone = 'neutral',
  dot = true,
  className,
  children,
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}

export function Tag({ className, children }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full bg-field px-2.5 text-[11.5px] text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
