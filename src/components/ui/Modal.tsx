import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Prefer bottom sheet on small screens (default true) */
  bottomSheetOnMobile?: boolean;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  bottomSheetOnMobile = true,
  className,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 flex max-h-[90dvh] w-full flex-col bg-white shadow-card",
          bottomSheetOnMobile
            ? "rounded-t-2xl md:max-w-lg md:rounded-lg"
            : "mx-4 max-w-lg rounded-lg",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="modal-title" className="text-base font-bold text-ink">
            {title}
          </h2>
          <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-slate-200 px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

/** Alias matching the design system name */
export const BottomSheet = Modal;
