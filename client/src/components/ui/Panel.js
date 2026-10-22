import { cn } from '@/lib/utils';

export function Panel({ title, description, action, className, children }) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5',
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[14px] font-semibold">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-[12.5px] text-ink-3">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
