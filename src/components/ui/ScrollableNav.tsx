import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = {
  children: ReactNode;
  /** Re-run scroll-into-view when this changes (e.g. active tab id). */
  activeKey?: string;
  className?: string;
  trackClassName?: string;
  "aria-label"?: string;
};

/** Horizontal nav strip with overflow scroll + chevron controls. */
export function ScrollableNav({
  children,
  activeKey,
  className,
  trackClassName,
  "aria-label": ariaLabel,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateOverflow = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(max > 2 && el.scrollLeft < max - 2);
  };

  const scrollByAmount = (delta: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateOverflow();
    el.addEventListener("scroll", updateOverflow, { passive: true });
    const ro = new ResizeObserver(updateOverflow);
    ro.observe(el);
    window.addEventListener("resize", updateOverflow);
    return () => {
      el.removeEventListener("scroll", updateOverflow);
      ro.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [children]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !activeKey) return;
    const safeKey = activeKey.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const active = el.querySelector<HTMLElement>(`[data-nav-id="${safeKey}"]`);
    if (!active) return;
    active.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    // Recalculate after the browser settles scroll position.
    const t = window.setTimeout(updateOverflow, 280);
    return () => window.clearTimeout(t);
  }, [activeKey]);

  return (
    <div className={cn("relative flex min-w-0 items-stretch", className)}>
      <button
        type="button"
        aria-label="Scroll navigation left"
        className={cn(
          "absolute left-0 top-0 z-[2] grid h-full w-8 place-items-center border-0 bg-gradient-to-r from-white via-white to-transparent text-[#0764e8] transition-opacity",
          canLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => scrollByAmount(-200)}
      >
        <ChevronLeft size={18} strokeWidth={2.25} />
      </button>

      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex min-w-0 flex-1 overflow-x-auto scroll-smooth [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c5d4e6]",
          trackClassName,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll navigation right"
        className={cn(
          "absolute right-0 top-0 z-[2] grid h-full w-8 place-items-center border-0 bg-gradient-to-l from-white via-white to-transparent text-[#0764e8] transition-opacity",
          canRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => scrollByAmount(200)}
      >
        <ChevronRight size={18} strokeWidth={2.25} />
      </button>
    </div>
  );
}
