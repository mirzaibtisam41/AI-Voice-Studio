import { AudioLines, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandMark({ admin = false, className }) {
  const Icon = admin ? ShieldCheck : AudioLines;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-[9px] text-white shadow-sm',
        admin
          ? 'bg-linear-to-br from-slate-400 to-slate-600'
          : 'bg-linear-to-br from-brand to-teal',
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

export function BrandName({ admin = false, className }) {
  return (
    <span className={cn('font-serif text-[15px] font-semibold', className)}>
      {admin ? 'Admin Console' : 'AI Voice Studio'}
    </span>
  );
}
