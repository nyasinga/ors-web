import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { submitCheckoutToFrame } from "../../lib/pesaflow";
import { SHOW_ECITIZEN_IFRAME } from "../../lib/paymentMode";
import type { ECitizenCheckoutSession } from "../../types/registration";
import { cn } from "../../lib/cn";
import { BankPaymentDetailsCard } from "./BankPaymentDetailsCard";

export { SHOW_ECITIZEN_IFRAME };

const FRAME_NAME = "paymentFrame";

interface PaymentModalProps {
  isOpen: boolean;
  checkout: ECitizenCheckoutSession | null;
  /** Amount due in KES (bank-transfer mode). */
  amountKes?: number;
  /** Registration / invoice reference shown in bank mode. */
  paymentReference?: string;
  onClose: () => void;
  onPaymentComplete: (paymentNote?: string) => Promise<void>;
  isVerifying?: boolean;
}

/**
 * Payment dialog: bank-transfer instructions by default.
 * eCitizen iframe remains in the tree but is hidden unless SHOW_ECITIZEN_IFRAME is true.
 */
export default function PaymentModal({
  isOpen,
  checkout,
  amountKes = 0,
  paymentReference = "",
  onClose,
  onPaymentComplete,
  isVerifying = false,
}: PaymentModalProps) {
  const submittedFor = useRef<string | null>(null);
  const [frameLoading, setFrameLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    if (!SHOW_ECITIZEN_IFRAME) return;
    if (!isOpen || !checkout?.url || !checkout.fields) return;

    const sessionKey = `${checkout.url}:${checkout.fields.billRefNumber}`;
    if (submittedFor.current === sessionKey) return;

    setFrameLoading(true);
    const timer = window.setTimeout(() => {
      submittedFor.current = sessionKey;
      submitCheckoutToFrame(checkout.url, checkout.fields, FRAME_NAME);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isOpen, checkout]);

  useEffect(() => {
    if (!isOpen) {
      submittedFor.current = null;
      setFrameLoading(true);
      setExpanded(true);
      setPaymentNote("");
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isVerifying) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isVerifying, onClose]);

  if (!isOpen) return null;
  if (SHOW_ECITIZEN_IFRAME && (!checkout?.url || !checkout.fields)) return null;

  const invoiceRef =
    checkout?.fields?.billRefNumber || paymentReference || "";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-stretch justify-center bg-black/65 p-0 sm:items-center sm:p-3 md:p-5"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isVerifying) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-white shadow-2xl",
          SHOW_ECITIZEN_IFRAME
            ? cn(
                "h-[100dvh] max-h-[100dvh] rounded-none",
                "sm:h-[min(92dvh,900px)] sm:max-h-[92dvh] sm:rounded-xl",
                expanded
                  ? "sm:max-w-[min(1100px,96vw)]"
                  : "sm:max-w-[min(820px,94vw)]",
              )
            : "h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[92dvh] sm:max-w-[min(560px,94vw)] sm:rounded-xl",
        )}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-[#e5ebf3] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <div className="min-w-0 flex-1">
            <h4
              id="payment-modal-title"
              className="m-0 truncate text-[15px] font-bold leading-tight text-[#10216d] sm:text-lg"
            >
              {SHOW_ECITIZEN_IFRAME ? "eCitizen Payment" : "Bank Transfer Payment"}
            </h4>
            {invoiceRef ? (
              <p className="m-0 mt-0.5 truncate text-[11px] text-[#64748b] sm:text-xs">
                Ref: <span className="font-semibold text-[#334155]">{invoiceRef}</span>
              </p>
            ) : null}
          </div>

          {SHOW_ECITIZEN_IFRAME ? (
            <>
              <button
                type="button"
                className="hidden h-9 w-9 shrink-0 place-items-center rounded-md text-[#52627d] hover:bg-[#f1f5f9] sm:grid"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Narrow payment window" : "Widen payment window"}
                title={expanded ? "Narrow" : "Widen"}
              >
                {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {checkout?.url ? (
                <a
                  href={checkout.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-[#0755d2] hover:bg-[#edf6ff] sm:inline-flex"
                  title="Open checkout URL in a new tab if the iframe is blocked"
                >
                  <ExternalLink size={14} />
                  Open tab
                </a>
              ) : null}
            </>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-2.5 text-sm font-semibold text-[#52627d] hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isVerifying}
            aria-label="Close payment window"
          >
            <X size={18} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </header>

        {/* Bank transfer UI (active while eCitizen iframe is hidden) */}
        {!SHOW_ECITIZEN_IFRAME ? (
          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 sm:px-8 sm:py-6">
            <BankPaymentDetailsCard paymentReference={invoiceRef} amountKes={amountKes} />

            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-semibold text-[#10216d]">
                Payment reference / transaction ID
              </span>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Enter bank / M-Pesa reference after you pay"
                disabled={isVerifying}
                className="box-border w-full rounded-lg border border-[#c9d6ea] bg-white px-3 py-2.5 text-sm text-[#0f172a] outline-none ring-[#0755d2] placeholder:text-[#94a3b8] focus:border-[#0755d2] focus:ring-2 disabled:opacity-60"
                autoComplete="off"
              />
              <span className="mt-1.5 block text-xs text-[#64748b]">
                For bank transfer, use ref ({invoiceRef || "—"}) as narration. For M-Pesa, use the
                same ref as the Paybill account number.
              </span>
            </label>
          </div>
        ) : null}

        {/* eCitizen iframe — only mounted when enabled */}
        {SHOW_ECITIZEN_IFRAME ? (
          <div className="relative min-h-0 flex-1 bg-[#f8fafc]">
            {frameLoading ? (
              <div
                className="absolute inset-0 z-10 grid place-items-center bg-white/90"
                role="status"
                aria-live="polite"
              >
                <div className="flex flex-col items-center gap-2 text-[#52627d]">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0755d2]" />
                  <p className="m-0 text-sm font-medium">Loading eCitizen payment…</p>
                  <p className="m-0 max-w-xs text-center text-xs text-[#94a3b8]">
                    Select a payment mode in the window below when it appears.
                  </p>
                </div>
              </div>
            ) : null}

            <iframe
              name={FRAME_NAME}
              id={FRAME_NAME}
              title="eCitizen Payment"
              className="block h-full w-full border-0 bg-white"
              style={{ minHeight: "100%" }}
              onLoad={() => setFrameLoading(false)}
              allow="payment *"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}

        <footer className="flex shrink-0 flex-col gap-2 border-t border-[#e5ebf3] bg-white px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
          <p className="m-0 flex-1 text-[11px] leading-snug text-[#64748b] sm:text-xs">
            {SHOW_ECITIZEN_IFRAME
              ? "After you finish paying on eCitizen, return here and confirm below to complete registration."
              : "After you transfer the funds, enter your payment reference above and confirm to complete registration."}
          </p>
          <button
            type="button"
            onClick={() =>
              void onPaymentComplete(
                SHOW_ECITIZEN_IFRAME ? undefined : paymentNote.trim() || undefined,
              )
            }
            disabled={
              isVerifying ||
              (!SHOW_ECITIZEN_IFRAME && paymentNote.trim().length < 3)
            }
            className="w-full shrink-0 cursor-pointer rounded-lg border-0 bg-[#28a745] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#218838] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px] sm:text-base"
          >
            {isVerifying ? "Completing registration…" : "I Have Completed Payment ✓"}
          </button>
        </footer>
      </div>
    </div>
  );
}
