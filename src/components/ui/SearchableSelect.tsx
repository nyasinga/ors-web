import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  /** Match registration field height / border when true. */
  compact?: boolean;
  "aria-label"?: string;
};

/** Combobox-style select with typeahead search (avoids native long option lists). */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled,
  className,
  buttonClassName,
  compact,
  "aria-label": ariaLabel,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = filtered[activeIndex];
      if (hit) pick(hit.value);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel || placeholder}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-[4px] border border-[#ccd9e8] bg-white text-left text-[12px] text-[#687894]",
          compact ? "h-9 px-[11px] max-[760px]:h-[35px] max-[760px]:text-[11px]" : "min-h-10 px-3 py-2",
          "focus:border-[#075fe5] focus:outline-none focus:ring-2 focus:ring-[#075fe5]/20",
          disabled && "cursor-not-allowed opacity-60",
          buttonClassName,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-[#9aa8bd]")}>
          {selected?.label || placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={-1}
            className="grid h-5 w-5 shrink-0 place-items-center rounded text-[#687894] hover:bg-slate-100 hover:text-[#10216d]"
            aria-label="Clear selection"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            <X size={14} />
          </span>
        ) : null}
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-[#687894] transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#ccd9e8] bg-white shadow-[0_12px_28px_rgba(16,33,109,0.14)]"
          role="presentation"
        >
          <div className="flex items-center gap-2 border-b border-[#e8eef5] px-3 py-2">
            <Search size={14} className="shrink-0 text-[#9aa8bd]" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[#10216d] outline-none placeholder:text-[#9aa8bd]"
              aria-autocomplete="list"
              aria-controls={listId}
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-[220px] overflow-y-auto py-1 [scrollbar-width:thin]"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-[12px] text-[#9aa8bd]">No matches</li>
            ) : (
              filtered.map((opt, index) => {
                const active = index === activeIndex;
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center px-3 py-2 text-left text-[12px]",
                        active || isSelected
                          ? "bg-[#eef5ff] font-semibold text-[#075fe5]"
                          : "text-[#10216d] hover:bg-[#f5f9ff]",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(opt.value)}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
