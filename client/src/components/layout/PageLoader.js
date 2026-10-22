import { Spinner } from '@/components/ui/Spinner';

export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-dvh items-center justify-center text-ink-3"
    >
      <Spinner className="size-5" />
    </div>
  );
}
