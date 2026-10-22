import { cn } from '@/lib/utils';

export function Overline({ className, children }) {
  return (
    <p
      className={cn(
        'text-[12px] font-semibold tracking-[0.14em] text-brand uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  overline,
  title,
  description,
  align = 'center',
  className,
}) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {overline ? <Overline>{overline}</Overline> : null}
      <h2
        id={id}
        className="font-serif text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="text-[15px] text-pretty text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function MarketingSection({ id, labelledBy, className, children }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24', className)}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
