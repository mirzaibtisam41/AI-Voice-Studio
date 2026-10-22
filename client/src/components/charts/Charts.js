import { formatCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

export const SERIES_COLORS = {
  brand: 'var(--brand)',
  teal: 'var(--teal)',
  blue: 'var(--blue)',
  amber: 'var(--amber)',
  success: 'var(--success)',
};

const CHART_HEIGHT = 200;

function niceMax(values) {
  const highest = Math.max(1, ...values);

  if (highest <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(highest));
  const step = magnitude / 2;

  return Math.ceil(highest / step) * step;
}

function Gridlines({ max, ticks = 4 }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
      {Array.from({ length: ticks + 1 }, (_, index) => {
        const value = max - (max / ticks) * index;

        return (
          <div key={index} className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-right font-mono text-[10.5px] text-ink-3">
              {formatCompact(value)}
            </span>
            <span className="h-px flex-1 border-t border-dashed border-border" />
          </div>
        );
      })}
    </div>
  );
}

function XLabels({ labels }) {
  return (
    <div className="ml-11 flex justify-between pt-2">
      {labels.map((label) => (
        <span key={label} className="font-mono text-[10.5px] text-ink-3">
          {label}
        </span>
      ))}
    </div>
  );
}

function buildPath(values, max, width, height) {
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((value, index) => [
    index * step,
    height - (value / max) * height,
  ]);

  return points
    .map(([x, y], index) => {
      if (index === 0) return `M ${x} ${y}`;

      const [prevX, prevY] = points[index - 1];
      const midX = (prevX + x) / 2;

      return `C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
    })
    .join(' ');
}

export function LineChart({
  labels,
  series,
  area = false,
  height = CHART_HEIGHT,
  label,
}) {
  const max = niceMax(series.flatMap((line) => line.values));
  const width = 600;

  return (
    <figure aria-label={label} className="flex flex-col">
      <div className="relative" style={{ height }}>
        <Gridlines max={max} />
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-y-0 right-0 left-11 h-full w-[calc(100%-2.75rem)] overflow-visible"
          role="img"
          aria-label={label}
        >
          {series.map((line) => {
            const path = buildPath(line.values, max, width, height);
            const color = SERIES_COLORS[line.color] ?? SERIES_COLORS.brand;
            const lastX =
              line.values.length > 1
                ? (width / (labels.length - 1)) * (line.values.length - 1)
                : width;

            return (
              <g key={line.name}>
                {area ? (
                  <path
                    d={`${path} L ${lastX} ${height} L 0 ${height} Z`}
                    fill={color}
                    opacity="0.14"
                  />
                ) : null}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
      </div>
      <XLabels labels={labels} />
    </figure>
  );
}

export function BarChart({
  labels,
  values,
  color = 'teal',
  height = CHART_HEIGHT,
  label,
}) {
  const max = niceMax(values);

  return (
    <figure aria-label={label} className="flex flex-col">
      <div className="relative" style={{ height }}>
        <Gridlines max={max} />
        <div className="absolute inset-y-0 right-0 left-11 flex items-end gap-2 sm:gap-3">
          {values.map((value, index) => (
            <div
              key={labels[index]}
              title={`${labels[index]}: ${value.toLocaleString()}`}
              className="flex h-full flex-1 items-end"
            >
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${(value / max) * 100}%`,
                  background: SERIES_COLORS[color],
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-11 flex gap-2 pt-2 sm:gap-3">
        {labels.map((item) => (
          <span
            key={item}
            className="flex-1 text-center font-mono text-[10.5px] text-ink-3"
          >
            {item}
          </span>
        ))}
      </div>
    </figure>
  );
}

export function HorizontalBars({ items, unit = '%' }) {
  const max = niceMax(items.map((item) => item.value));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[96px_1fr_44px] items-center gap-3"
        >
          <span className="truncate text-right text-[12px] text-muted-foreground">
            {item.label}
          </span>
          <span className="h-6 overflow-hidden rounded-md bg-field">
            <span
              className="block h-full rounded-md"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: SERIES_COLORS[item.color],
              }}
            />
          </span>
          <span className="font-mono text-[11.5px] text-ink-3">
            {item.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ items, centerLabel, centerValue }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const segments = items.map((item, index) => {
    const before = items
      .slice(0, index)
      .reduce((sum, previous) => sum + previous.value, 0);

    return {
      ...item,
      length: total ? (item.value / total) * circumference : 0,
      offset: total ? (before / total) * circumference : 0,
    };
  });

  return (
    <div className="relative mx-auto size-44">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="12"
          className="stroke-field"
        />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="12"
            stroke={SERIES_COLORS[segment.color]}
            strokeDasharray={`${Math.max(0, segment.length - 1.5)} ${circumference}`}
            strokeDashoffset={-segment.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[22px] font-semibold">
          {centerValue}
        </span>
        <span className="text-[11px] text-ink-3">{centerLabel}</span>
      </div>
    </div>
  );
}

export function Legend({ items, className }) {
  return (
    <ul
      className={cn(
        'flex flex-wrap justify-center gap-x-4 gap-y-1.5',
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"
        >
          <span
            className="size-2 rounded-[3px]"
            style={{ background: SERIES_COLORS[item.color] }}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
