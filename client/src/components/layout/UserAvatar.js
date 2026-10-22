import { cn } from '@/lib/utils';

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
}

export function UserAvatar({ name, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal text-[11px] font-semibold text-[#1a0d06]',
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
