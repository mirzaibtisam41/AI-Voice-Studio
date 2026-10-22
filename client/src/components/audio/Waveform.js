import { cn } from '@/lib/utils';

function seededHeights(seed, count) {
  let state = 0;

  for (const char of String(seed)) {
    state = (state * 31 + char.charCodeAt(0)) >>> 0;
  }

  return Array.from({ length: count }, (_, index) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    const noise = (state % 1000) / 1000;
    const envelope = 0.55 + 0.45 * Math.sin((index / count) * Math.PI);

    return Math.max(0.18, Math.min(1, noise * 0.7 * envelope + 0.25));
  });
}

export function Waveform({
  seed = 'wave',
  bars = 48,
  progress = 0,
  animated = false,
  className,
  barClassName,
}) {
  const heights = seededHeights(seed, bars);
  const playedBars = Math.round(progress * bars);

  return (
    <div
      aria-hidden="true"
      className={cn('flex h-8 min-w-0 items-center gap-[3px]', className)}
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className={cn(
            'min-w-[2px] flex-1 origin-center rounded-full transition-colors',
            index < playedBars ? 'bg-brand' : 'bg-ink-3/40',
            animated && 'animate-wave',
            barClassName,
          )}
          style={{
            height: `${(height * 100).toFixed(2)}%`,
            animationDelay: animated ? `${(index % 12) * 70}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}
