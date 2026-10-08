import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

type Props = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, pageCount, onChange, className }: Props) {
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-3", className)}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} /> Prev
      </Button>
      <span className="text-sm text-mute">
        Page <strong className="text-ink">{page}</strong> of {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        Next <ChevronRight size={16} />
      </Button>
    </nav>
  );
}
