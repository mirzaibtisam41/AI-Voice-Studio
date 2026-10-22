export function StatValue({ value, isLoading }) {
  if (isLoading || value === undefined) {
    return (
      <span
        aria-label="Loading"
        className="inline-block h-7 w-16 animate-pulse rounded-md bg-accent align-middle"
      />
    );
  }

  return value.toLocaleString();
}
