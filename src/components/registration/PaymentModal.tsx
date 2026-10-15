import { useEffect, useRef } from "react";
import { submitCheckoutToFrame } from "../../lib/pesaflow";
import type { ECitizenCheckoutSession } from "../../types/registration";

const FRAME_NAME = "paymentFrame";

interface PaymentModalProps {
  isOpen: boolean;
  checkout: ECitizenCheckoutSession | null;
  onClose: () => void;
  onPaymentComplete: () => Promise<void>;
  isVerifying?: boolean;
}

/**
 * Renders the payment iframe, then POSTs checkout `{ url, fields }` into it
 * via a temporary form (create → append → submit → remove).
 */
export default function PaymentModal({
  isOpen,
  checkout,
  onClose,
  onPaymentComplete,
  isVerifying = false,
}: PaymentModalProps) {
  const submittedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !checkout?.url || !checkout.fields) return;

    const sessionKey = `${checkout.url}:${checkout.fields.billRefNumber}`;
    if (submittedFor.current === sessionKey) return;

    // Ensure the named iframe is mounted before targeting it.
    const timer = window.setTimeout(() => {
      submittedFor.current = sessionKey;
      submitCheckoutToFrame(checkout.url, checkout.fields, FRAME_NAME);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isOpen, checkout]);

  useEffect(() => {
    if (!isOpen) submittedFor.current = null;
  }, [isOpen]);

  if (!isOpen || !checkout?.url || !checkout.fields) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-[800px] rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="m-0 text-[16px] font-bold text-[#10216d]">eCitizen Secure Payment Portal</h4>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent text-[16px] font-bold text-[#52627d]"
            disabled={isVerifying}
          >
            ✕ Close
          </button>
        </div>

        <iframe
          name={FRAME_NAME}
          id={FRAME_NAME}
          title="eCitizen Payment"
          className="h-[500px] w-full rounded border border-[#eee]"
        />

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={() => void onPaymentComplete()}
            disabled={isVerifying}
            className="cursor-pointer rounded border-0 bg-[#28a745] px-5 py-2.5 text-white disabled:opacity-60"
          >
            {isVerifying ? "Completing registration…" : "I Have Completed Payment ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
