import { getLibraryTypeMeta } from '@/features/library/libraryTypes';
import { cn } from '@/lib/utils';

export function LibraryTypeIcon({ type, className }) {
  const Icon = getLibraryTypeMeta(type).icon;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg border bg-field text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}
