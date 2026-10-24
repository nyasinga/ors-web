import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called with selected proof file(s). Endpoint wiring comes later. */
  onSubmit: (files: File[]) => Promise<void> | void;
  submitting?: boolean;
  invoiceReference?: string;
};

const ACCEPT = "image/*,.pdf,application/pdf";

/**
 * Attach proof of payment after bank transfer.
 * Submit endpoint will be wired when provided.
 */
export function ProofOfPaymentModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
  invoiceReference = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setError("");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proof-payment-title"
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-xl"
      >
        <header className="flex items-center gap-2 border-b border-[#e5ebf3] px-4 py-3">
          <h3
            id="proof-payment-title"
            className="m-0 flex-1 text-base font-bold text-[#10216d]"
          >
            Attach proof of payment
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-9 w-9 place-items-center rounded-md text-[#52627d] hover:bg-[#f1f5f9] disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 px-4 py-4">
          <p className="m-0 text-sm text-[#52627d]">
            Upload a bank slip, M-Pesa confirmation, or PDF showing your transfer
            {invoiceReference ? (
              <>
                {" "}
                for invoice ref{" "}
                <strong className="text-[#10216d]">{invoiceReference}</strong>
              </>
            ) : null}
            .
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              const next = Array.from(e.target.files || []);
              setFiles(next);
              setError(next.length ? "" : "Select at least one file.");
            }}
          />

          <button
            type="button"
            disabled={submitting}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c9d6ea] bg-[#f8fafc] px-4 py-8 text-center transition-colors hover:border-[#0755d2] hover:bg-[#edf6ff]",
              files.length > 0 && "border-emerald-300 bg-emerald-50",
            )}
          >
            <FileUp className="text-[#0755d2]" size={28} />
            <span className="text-sm font-semibold text-[#10216d]">
              {files.length ? "Change files" : "Choose proof of payment"}
            </span>
            <span className="text-xs text-[#64748b]">PDF or image · max ~10 MB each</span>
          </button>

          {files.length > 0 ? (
            <ul className="m-0 list-none space-y-1.5 p-0 text-sm text-[#334155]">
              {files.map((f) => (
                <li
                  key={`${f.name}-${f.size}-${f.lastModified}`}
                  className="truncate rounded-md bg-[#f1f5f9] px-3 py-2 font-medium"
                >
                  {f.name}{" "}
                  <span className="font-normal text-[#64748b]">
                    ({Math.max(1, Math.round(f.size / 1024))} KB)
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {error ? <p className="m-0 text-sm font-medium text-red-600">{error}</p> : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-[#e5ebf3] px-4 py-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={submitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => {
              if (!files.length) {
                setError("Select at least one file.");
                return;
              }
              void onSubmit(files);
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit proof"
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}
