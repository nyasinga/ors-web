import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

type Stat = {
  label: string;
  value: string;
  note?: string;
  icon?: LucideIcon;
  tone?: "blue" | "green" | "red" | "orange" | "purple";
};

type Props = {
  items: Stat[];
  className?: string;
};

const tones = {
  blue: "bg-soft text-blue",
  green: "bg-green-50 text-green",
  red: "bg-red-50 text-red",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

export function Stats({ items, className }: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const tone = item.tone ?? "blue";
        return (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm text-mute">{item.label}</span>
              {Icon ? (
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg", tones[tone])}>
                  <Icon size={18} />
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            {item.note ? <p className="mt-1 text-xs text-mute">{item.note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
