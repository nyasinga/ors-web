import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/cn";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(targetMs: number, nowMs: number): Parts | null {
  const diff = targetMs - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86_400),
    hours: Math.floor((totalSec % 86_400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

type Props = {
  /** ISO start datetime of the event. */
  targetIso?: string | null;
  /** Compact strip for registration header (on dark backgrounds). */
  variant?: "home" | "register";
  className?: string;
  label?: string;
};

/**
 * Live countdown to the event start. Hidden when the date is missing or past.
 */
export function EventCountdown({
  targetIso,
  variant = "home",
  className,
  label = "Countdown to the event",
}: Props) {
  const targetMs = useMemo(() => {
    if (!targetIso?.trim()) return null;
    const t = new Date(targetIso).getTime();
    return Number.isNaN(t) ? null : t;
  }, [targetIso]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  const parts = targetMs == null ? null : partsUntil(targetMs, now);
  if (!parts) return null;

  const units: Array<{ value: number; unit: string }> = [
    { value: parts.days, unit: "Days" },
    { value: parts.hours, unit: "Hours" },
    { value: parts.minutes, unit: "Mins" },
    { value: parts.seconds, unit: "Secs" },
  ];

  if (variant === "register") {
    return (
      <div
        className={cn(
          "mt-4 inline-flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-[2px]",
          className,
        )}
        role="timer"
        aria-live="polite"
        aria-label={label}
      >
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
          Starts in
        </span>
        {units.map((u, i) => (
          <span key={u.unit} className="inline-flex items-baseline gap-1">
            {i > 0 ? <span className="text-white/40">:</span> : null}
            <span className="tabular-nums text-[15px] font-extrabold text-white">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-semibold uppercase text-white/70">{u.unit}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("mt-4 max-w-[500px]", className)}
      role="timer"
      aria-live="polite"
      aria-label={label}
    >
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#3F5BA9]">
        {label}
      </p>
      <div className="grid grid-cols-4 gap-2 max-[640px]:gap-1.5">
        {units.map((u) => (
          <div
            key={u.unit}
            className="rounded-lg border border-[#d7e3f5] bg-[#f5f8fd] px-2 py-2.5 text-center shadow-[0_1px_0_rgba(15,40,80,.04)]"
          >
            <div className="tabular-nums text-[1.35rem] font-black leading-none tracking-tight text-[#0b2a5b] max-[640px]:text-[1.15rem]">
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
              {u.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
