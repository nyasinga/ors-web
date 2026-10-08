import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  icon?: LucideIcon;
  className?: string;
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  icon: Icon,
  className,
}: Props) {
  const toggleId = id ?? `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-soft text-blue">
            <Icon size={16} />
          </span>
        ) : null}
        <div className="min-w-0">
          <label htmlFor={toggleId} className="text-sm font-medium text-ink">
            {label}
          </label>
          {description ? <p className="mt-0.5 text-xs text-mute">{description}</p> : null}
        </div>
      </div>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-pressed={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-blue" : "bg-slate-300",
          disabled && "opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
