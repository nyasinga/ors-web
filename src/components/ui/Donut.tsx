import { cn } from "../../lib/cn";

type Slice = { label: string; value: number; color: string; amount?: string };

type Props = {
  slices: Slice[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  className?: string;
};

function buildArcs(slices: Slice[], circumference: number, total: number) {
  return slices.reduce<Array<Slice & { len: number; dashOffset: number }>>((acc, slice) => {
    const len = (slice.value / total) * circumference;
    const dashOffset = -acc.reduce((sum, a) => sum + a.len, 0);
    acc.push({ ...slice, len, dashOffset });
    return acc;
  }, []);
}

export function Donut({
  slices,
  centerLabel,
  centerValue,
  size = 160,
  className,
}: Props) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  const arcs = buildArcs(slices, c, total);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5",
        className,
      )}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size} aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="#E8EEF7" strokeWidth="12" />
          {arcs.map((slice) => (
            <circle
              key={slice.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="12"
              strokeDasharray={`${slice.len} ${c - slice.len}`}
              strokeDashoffset={slice.dashOffset}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center leading-tight">
          {centerValue ? (
            <div className="text-base font-extrabold text-navy sm:text-lg">{centerValue}</div>
          ) : null}
          {centerLabel ? <div className="mt-0.5 text-[11px] text-mute">{centerLabel}</div> : null}
        </div>
      </div>
      <ul className="grid w-full min-w-0 flex-1 gap-2.5 text-sm">
        {slices.map((s) => (
          <li
            key={s.label}
            className="grid grid-cols-[0.625rem_minmax(0,1fr)_auto_2.75rem] items-center gap-x-2"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="min-w-0 truncate text-mute">{s.label}</span>
            {s.amount ? (
              <span className="whitespace-nowrap text-right font-semibold text-navy">{s.amount}</span>
            ) : (
              <span />
            )}
            <span className="text-right font-semibold text-ink">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
