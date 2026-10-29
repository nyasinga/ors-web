import type { ReactNode } from "react";
import { ACA_BANK_DETAILS, ACA_MPESA_PAYBILL, mpesaAccountNumber } from "../../lib/bankPaymentDetails";
import { formatMoney } from "../../i18n/format";
import { cn } from "../../lib/cn";

type Props = {
  /** Ticket / invoice reference used as M-Pesa account number. */
  paymentReference?: string;
  amountKes?: number;
  className?: string;
  /** Extra note under the amount (optional). */
  footerNote?: ReactNode;
};

/**
 * Shared “Make all payments to” card: KCB bank details + M-Pesa Paybill 522522.
 */
export function BankPaymentDetailsCard({
  paymentReference = "",
  amountKes = 0,
  className,
  footerNote,
}: Props) {
  const accountNo = mpesaAccountNumber(paymentReference);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-[#e8eef5] bg-white",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-10 h-28 w-40 rotate-[28deg]"
        aria-hidden
      >
        <div className="absolute inset-x-0 top-0 h-[10px] bg-[#1a9b4a]" />
        <div className="absolute inset-x-0 top-[12px] h-[10px] bg-[#c8102e]" />
        <div className="absolute inset-x-0 top-[24px] h-[10px] bg-[#0056a4]" />
      </div>

      <div className="relative px-5 pb-6 pt-5 sm:px-7 sm:pt-6">
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/assets/aca-logo.png"
            alt="Anti Counterfeit Authority"
            className="h-14 w-auto object-contain sm:h-16"
          />
        </div>

        <h5 className="m-0 mb-4 text-sm font-extrabold uppercase tracking-wide text-[#111827] sm:text-[15px]">
          Make all payments to:
        </h5>

        <dl className="m-0 grid gap-2.5 text-[13px] leading-snug text-[#111827] sm:text-sm">
          {ACA_BANK_DETAILS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[7.5rem_1fr] gap-x-2 sm:grid-cols-[9rem_1fr]"
            >
              <dt className="text-[#374151]">{row.label}</dt>
              <dd className="m-0 font-bold tracking-wide text-[#0f172a]">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-md border border-[#dbeafe] bg-[#f8fbff] px-3 py-3">
          <p className="m-0 mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#1e3a8a]">
            Or pay via M-Pesa
          </p>
          <dl className="m-0 grid gap-2 text-[13px] leading-snug text-[#111827] sm:text-sm">
            <div className="grid grid-cols-[7.5rem_1fr] gap-x-2 sm:grid-cols-[9rem_1fr]">
              <dt className="text-[#374151]">Paybill:</dt>
              <dd className="m-0 font-bold tracking-wide text-[#0f172a]">{ACA_MPESA_PAYBILL}</dd>
            </div>
            <div className="grid grid-cols-[7.5rem_1fr] gap-x-2 sm:grid-cols-[9rem_1fr]">
              <dt className="text-[#374151]">Account Number:</dt>
              <dd className="m-0 font-bold tracking-wide text-[#0f172a]">{accountNo}</dd>
            </div>
          </dl>
          <p className="mt-2 mb-0 text-xs text-[#64748b]">
            Use your ticket / invoice reference as the M-Pesa account number so we can match your
            payment.
          </p>
        </div>

        {amountKes > 0 ? (
          <p className="mt-5 mb-0 rounded-md bg-[#f0f6ff] px-3 py-2.5 text-sm text-[#1e3a8a]">
            Amount due:{" "}
            <strong className="tabular-nums">{formatMoney(amountKes, "KES")}</strong>
          </p>
        ) : null}

        {footerNote ? <div className="mt-3 text-xs text-[#64748b]">{footerNote}</div> : null}
      </div>
    </div>
  );
}
