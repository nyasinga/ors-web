import { cn } from "../../lib/cn";

export type TabItem = { id: string; label: string; count?: number };

type Props = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ items, value, onChange, className }: Props) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-slate-200 pb-px",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-blue text-blue"
                : "border-transparent text-mute hover:text-ink",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span className="ml-1.5 rounded-full bg-soft px-1.5 text-xs text-blue">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
