import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-4 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-1 flex size-10 items-center justify-center rounded-xl border bg-field text-ink-3">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className="text-[13.5px] font-semibold">{title}</p>
      {description ? (
        <p className="max-w-sm text-[12.5px] text-ink-3">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
