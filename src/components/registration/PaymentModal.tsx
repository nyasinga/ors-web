import { useEffect, useRef } from "react";
import type { ECitizenPayload } from "../../types/registration";

interface PaymentModalProps {
  isOpen: boolean;
  payload: ECitizenPayload | null;
  onClose: () => void;
  onPaymentComplete: () => Promise<void>;
  isVerifying?: boolean;
}

export default function PaymentModal({
  isOpen,
  payload,
  onClose,
  onPaymentComplete,
  isVerifying = false,
}: PaymentModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && payload && formRef.current) {
      formRef.current.submit();
    }
  }, [isOpen, payload]);

  if (!isOpen || !payload) return null;

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

        <form
          ref={formRef}
          action="https://test.pesaflow.com"
          method="POST"
          target="ecitizen_iframe"
          className="hidden"
        >
          {Object.entries(payload).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value?.toString() ?? ""} />
          ))}
        </form>

        <iframe
          name="ecitizen_iframe"
          className="h-[600px] w-full rounded border border-[#eee]"
          title="eCitizen Gateway"
        />

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={() => void onPaymentComplete()}
            disabled={isVerifying}
            className="cursor-pointer rounded border-0 bg-[#28a745] px-5 py-2.5 text-white disabled:opacity-60"
          >
            {isVerifying ? "Verifying payment…" : "I Have Completed Payment ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
