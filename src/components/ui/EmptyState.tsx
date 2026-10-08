import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Compact for table cells / list panels */
  compact?: boolean;
};

/** Screen X Empty — reusable empty / no-results state */
export function EmptyState({
  title = "Empty",
  description = "Nothing found. Please check again.",
  action,
  className,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-10" : "px-6 py-16",
        className,
      )}
      role="status"
    >
      <EmptyIllustration className={compact ? "h-28 w-28" : "h-40 w-40"} />
      <h3 className={cn("mt-5 font-bold text-navy", compact ? "text-lg" : "text-2xl")}>{title}</h3>
      <p className={cn("mt-1 max-w-sm text-mute", compact ? "text-sm" : "text-base")}>{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Open box illustration matching Screen X Empty */
function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 140"
      className={cn("text-blue", className)}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="80" cy="122" rx="42" ry="7" fill="#EEF3FF" />
      <circle cx="26" cy="38" r="5" fill="#EEF3FF" />
      <circle cx="134" cy="32" r="3.5" fill="#D9E4FF" />
      <circle cx="142" cy="68" r="4.5" fill="#EEF3FF" />
      <circle cx="22" cy="78" r="3" fill="#D9E4FF" />
      {/* Soft blob under box */}
      <path
        d="M40 96c8-14 22-22 40-22s32 8 40 22c3 5-1 12-10 12H50c-9 0-13-7-10-12Z"
        fill="#EEF3FF"
      />
      {/* Box body */}
      <path d="M48 72h64l-6 34H54L48 72Z" fill="#0B45E0" />
      <path d="M54 106h52l4-18H50l4 18Z" fill="#0A2A7A" />
      {/* Open flaps */}
      <path d="M48 72L36 58l28 6 12 8H48Z" fill="#93B4FF" />
      <path d="M112 72l12-14-28 6-12 8h28Z" fill="#B8CCFF" />
      <path d="M48 72h64l-8 10H56L48 72Z" fill="#D9E4FF" />
      {/* Inner open cavity */}
      <path d="M58 78h44l-4 20H62L58 78Z" fill="#EEF3FF" opacity="0.9" />
      <path d="M62 98h36l2-12H60l2 12Z" fill="#0B45E0" opacity="0.35" />
      {/* Label on front */}
      <rect x="66" y="88" width="28" height="5" rx="1.5" fill="white" opacity="0.35" />
      {/* Spark lines from open top */}
      <path d="M72 54v-12" stroke="#0B45E0" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 50v-14" stroke="#0B45E0" strokeWidth="3" strokeLinecap="round" />
      <path d="M88 54v-12" stroke="#0B45E0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
