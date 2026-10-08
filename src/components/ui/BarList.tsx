import { cn } from "../../lib/cn";

type Item = { label: string; value: number; max?: number };

type Props = {
  items: Item[];
  className?: string;
  barClassName?: string;
};

export function BarList({ items, className, barClassName }: Props) {
  const max = Math.max(...items.map((i) => i.max ?? i.value), 1);
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((item) => {
        const pct = Math.round(((item.value) / max) * 100);
        return (
          <li key={item.label} className="grid gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{item.label}</span>
              <span className="text-mute">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full bg-blue", barClassName)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
