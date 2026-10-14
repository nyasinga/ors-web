import { ScrollableNav } from "./ScrollableNav";
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
    <ScrollableNav
      activeKey={value}
      aria-label="Tabs"
      className={cn("border-b border-slate-200", className)}
      trackClassName="gap-1 pb-px"
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-nav-id={item.id}
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
    </ScrollableNav>
  );
}
