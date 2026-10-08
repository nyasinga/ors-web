import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Item = { label: string; value: ReactNode };

type Props = {
  items: Item[];
  className?: string;
  columns?: 1 | 2;
};

export function KV({ items, className, columns = 1 }: Props) {
  return (
    <dl
      className={cn(
        "grid gap-3 text-sm",
        columns === 2 && "sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="grid gap-0.5">
          <dt className="text-mute">{item.label}</dt>
          <dd className="font-medium text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
