import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function InputWithIcon({ icon: Icon, className, trailing, ...props }) {
  return (
    <div className="relative">
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
      />
      <Input
        className={cn('pl-9', trailing && 'pr-10', className)}
        {...props}
      />
      {trailing ? (
        <div className="absolute inset-y-0 right-1 flex items-center">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
