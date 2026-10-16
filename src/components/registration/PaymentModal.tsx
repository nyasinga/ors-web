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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5">
      <div className="relative flex max-h-[95dvh] w-full max-w-[800px] flex-col overflow-hidden rounded-xl bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <h4 className="m-0 text-base font-bold leading-6 text-[#10216d] sm:text-lg">
            eCitizen Payment
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-sm font-semibold text-[#52627d] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isVerifying}
          >
            ✕ Close
          </button>
        </div>

        <iframe
          name={FRAME_NAME}
          id={FRAME_NAME}
          title="eCitizen Payment"
          className="min-h-[300px] w-full flex-1 rounded-lg border border-[#eee] sm:min-h-[400px]"
          style={{ height: "min(500px, 60dvh)" }}
        />

        <div className="mt-4 w-full shrink-0">
          <button
            type="button"
            onClick={() => void onPaymentComplete()}
            disabled={isVerifying}
            className="w-full cursor-pointer rounded-lg border-0 bg-[#28a745] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#218838] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {isVerifying
              ? "Completing registration…"
              : "I Have Completed Payment ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}