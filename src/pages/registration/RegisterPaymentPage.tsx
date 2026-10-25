import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, ExternalLink, FileText } from "lucide-react";
import { SHOW_ECITIZEN_IFRAME } from "../../components/registration/PaymentModal";
import {
  ProofOfPaymentModal,
  type ProofOfPaymentSubmit,
} from "../../components/registration/ProofOfPaymentModal";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useToast } from "../../components/ui/Toast";
import { useRegistration } from "../../hooks/useRegistration";
import { participationTypes } from "../../data/registration";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import { submitTicketPaymentReference } from "../../lib/pesaflow";
import { engagementToPublicSponsors } from "../../lib/publicEvent";
import { parseKesPrice } from "../../lib/ticketAnalytics";
import * as r from "../../components/registration/registerStyles";

const BANK_DETAILS = [
  { label: "Account Name:", value: "ANTI COUNTERFEIT AGENCY" },
  { label: "Bank:", value: "KENYA COMMERCIAL BANK" },
  { label: "Branch:", value: "Kipande House" },
  { label: "Account No.:", value: "1119056322" },
  { label: "Bank code:", value: "01" },
  { label: "Branch code:", value: "101" },
  { label: "Swift code:", value: "KCBLKENX005" },
] as const;

/**
 * Registration step 3:
 * 1) Invoice preview + download (from Details → create-invoice)
 * 2) Next → bank transfer instructions + “I have completed payment”
 * 3) Proof-of-payment modal → PATCH /ticketing/{ticketID}/reference
 */
export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const event = useEventCopy();
  const { engagement } = usePublicEngagement();
  const {
    participationType,
    details,
    setDetails,
    reference,
    feeKes,
    feeUsd,
    feeLabel,
    feeUntil,
    earlyBird,
    late,
    selectedSponsorPackage,
    invoice,
    paymentPhase,
    setPaymentPhase,
    setPaymentProofFiles,
    registrationHydrated,
  } = useRegistration();

  const [proofOpen, setProofOpen] = useState(false);
  const [proofSubmitting, setProofSubmitting] = useState(false);

  const typeLabel = participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";
  const isSponsor = participationType === "sponsor" || Boolean(selectedSponsorPackage);
  const liveSponsorPackages = useMemo(
    () => engagementToPublicSponsors(engagement),
    [engagement],
  );

  const resolvedTicket = useMemo(() => {
    if (!isSponsor) {
      return { amount: feeKes };
    }
    const live =
      liveSponsorPackages.find(
        (pkg) =>
          pkg.id === selectedSponsorPackage?.id ||
          pkg.name === selectedSponsorPackage?.name,
      ) || null;
    if (live) {
      const amount = parseKesPrice(live.price);
      if (amount > 0) return { amount };
    }
    return { amount: selectedSponsorPackage?.kes ?? 0 };
  }, [isSponsor, feeKes, liveSponsorPackages, selectedSponsorPackage]);

  const displayKes =
    invoice?.amount && invoice.amount > 0
      ? invoice.amount
      : resolvedTicket.amount > 0
        ? resolvedTicket.amount
        : feeKes;

  const invoiceRef = invoice?.reference || details.reference || reference;

  useEffect(() => {
    if (!registrationHydrated) return;
    if (!details.fullName || !details.email) {
      navigate("/register/details", { replace: true });
      return;
    }
    // Allow restore/re-fetch when we have ticketID but url not hydrated yet.
    if (!invoice?.url && !invoice?.ticketID) {
      navigate("/register/details", { replace: true });
    }
  }, [details.email, details.fullName, invoice, navigate, registrationHydrated]);

  const downloadInvoice = () => {
    if (!invoice?.url) return;
    const a = document.createElement("a");
    a.href = invoice.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = `invoice-${invoiceRef || "registration"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleProofSubmit = async ({ transactionReference, files }: ProofOfPaymentSubmit) => {
    const ticketID = invoice?.ticketID?.trim();
    if (!ticketID) {
      toast.error("Missing ticket ID — go back to Details and create the invoice again.");
      return;
    }

    setProofSubmitting(true);
    try {
      setPaymentProofFiles(files);
      const result = await submitTicketPaymentReference({
        ticketID,
        transactionReference,
        files,
        token: invoice?.token,
      });

      const ticket = (result.ticket || result) as Record<string, unknown>;
      setDetails({
        status: "pending_verification",
        verificationStatus: "pending_verification",
        paymentReference: transactionReference.trim(),
        reference: ticket.reference ? String(ticket.reference) : invoiceRef,
        passCode: ticket.passCode ? String(ticket.passCode) : details.passCode,
        engagementID: ticket.engagementID
          ? String(ticket.engagementID)
          : details.engagementID,
      });

      setProofOpen(false);
      toast.success("Payment proof submitted — awaiting admin verification before your pass is issued.");
      navigate("/register/confirmation");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit payment proof.",
        6000,
      );
    } finally {
      setProofSubmitting(false);
    }
  };

  if (!invoice?.url) {
    return (
      <div className={r.registerPage}>
        <RegisterHero current={3} />
        <main className={r.main}>
          <div className={cn(r.container, "py-10 text-center text-sm text-[#52627d]")}>
            {invoice?.ticketID ? "Loading invoice PDF…" : "Preparing invoice…"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={r.registerPage}>
      <RegisterHero current={3} />
      <main className={r.main}>
        <div className={cn(r.container, r.payLayout)}>
          <section className={cn(r.card, r.section)}>
            {paymentPhase === "invoice" ? (
              <>
                <h2 className={r.sectionTitle}>3. Invoice</h2>
                <p className={r.subtitle}>
                  Review and download your invoice, then continue to bank payment instructions.
                </p>

                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#d7e5f5] bg-[#f0f6ff] px-3 py-2.5 text-sm text-[#1e3a8a]">
                  <FileText size={16} className="shrink-0" />
                  <span>
                    Invoice ref: <strong>{invoiceRef}</strong>
                  </span>
                  <span className="text-[#64748b]">·</span>
                  <span>
                    Amount: <strong>{formatMoney(displayKes, "KES")}</strong>
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#e5ebf3] bg-[#f8fafc]">
                  <iframe
                    title="Registration invoice"
                    src={invoice.url}
                    className="block h-[min(70vh,560px)] w-full border-0 bg-white"
                  />
                </div>

                <div className={r.actions}>
                  <Link className={r.btn} to="/register/details">
                    ← Back to Details
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={r.btn} onClick={downloadInvoice}>
                      <Download size={14} className="mr-1 inline" />
                      Download invoice
                    </button>
                    <a
                      className={r.btn}
                      href={invoice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={14} className="mr-1 inline" />
                      Open
                    </a>
                    <button
                      type="button"
                      className={r.btnPrimary}
                      onClick={() => setPaymentPhase("bank")}
                    >
                      Next: Bank payment{" "}
                      <span className={r.arrow} aria-hidden>
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className={r.sectionTitle}>3. Payment</h2>
                <p className={r.subtitle}>
                  {SHOW_ECITIZEN_IFRAME
                    ? "Complete your registration by making the payment using the eCitizen platform."
                    : "Complete your registration by transferring the fee to the ACA bank account."}
                </p>

                <div className={r.payTop}>
                  <div className={r.sidePrice}>
                    <div className={r.priceLabel}>
                      {selectedSponsorPackage ? "🏷 Selected Package" : "🏷 Registration Fee"}
                    </div>
                    <b>{feeLabel}</b>
                    <div className={r.period}>{feeUntil}</div>
                    <div className={r.price}>{formatMoney(displayKes, "KES")}</div>
                    {!isSponsor && feeUsd > 0 ? (
                      <div className={r.priceSub}>{formatMoney(feeUsd, "USD")} (Approx.)</div>
                    ) : null}
                  </div>
                  <div className={r.infoBox}>
                    <div className={r.infoTitle}>
                      {selectedSponsorPackage ? "▣ Package Benefits" : "▣ Registration Periods"}
                    </div>
                    <p className={r.infoText}>
                      {selectedSponsorPackage ? (
                        selectedSponsorPackage.benefits.map((benefit) => (
                          <span key={benefit}>
                            ✓ {benefit}
                            <br />
                          </span>
                        ))
                      ) : (
                        <>
                          <b>{earlyBird.label}</b>
                          <br />
                          {earlyBird.until} &nbsp; <b>{formatMoney(earlyBird.kes, "KES")}</b>
                          <br />
                          <br />
                          <b>{late.label}</b>
                          <br />
                          {late.until} &nbsp; <b>{formatMoney(late.kes, "KES")}</b>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <h3 className={r.payHeading}>Payment Method</h3>
                <div className={r.paymentMethod}>
                  <span className={r.radioBlue} aria-hidden />
                  <img
                    className="h-12 w-auto object-contain"
                    src="/assets/aca-logo.png"
                    alt="Anti Counterfeit Authority"
                  />
                  <div>
                    <strong className={r.paymentMethodTitle}>Bank transfer (KCB)</strong>
                    <p className={r.paymentMethodText}>
                      Transfer the registration fee to the Anti Counterfeit Agency KCB account using
                      your invoice reference as the narration.
                    </p>
                  </div>
                </div>

                {/* Existing bank details block (same content as previous payment modal) */}
                <div className="relative mt-4 overflow-hidden rounded-lg border border-[#e8eef5] bg-white">
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
                      {BANK_DETAILS.map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[7.5rem_1fr] gap-x-2 sm:grid-cols-[9rem_1fr]"
                        >
                          <dt className="text-[#374151]">{row.label}</dt>
                          <dd className="m-0 font-bold tracking-wide text-[#0f172a]">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                    {displayKes > 0 ? (
                      <p className="mt-5 mb-0 rounded-md bg-[#f0f6ff] px-3 py-2.5 text-sm text-[#1e3a8a]">
                        Amount due:{" "}
                        <strong className="tabular-nums">{formatMoney(displayKes, "KES")}</strong>
                      </p>
                    ) : null}
                    <p className="mt-3 mb-0 text-xs text-[#64748b]">
                      Use invoice ref <strong className="text-[#334155]">{invoiceRef}</strong> as the
                      payment narration.
                    </p>
                  </div>
                </div>

                <div className={r.notice}>
                  <strong className={r.noticeStrong}>ⓘ &nbsp; Important Information</strong>
                  <br />
                  • Transfer the exact amount to the ACA KCB account above.
                  <br />
                  • Use your invoice reference as the payment narration.
                  <br />• After transferring, click below and attach your proof of payment.
                </div>

                <div className={r.actions}>
                  <button
                    type="button"
                    className={r.btn}
                    onClick={() => setPaymentPhase("invoice")}
                  >
                    ← Back to Invoice
                  </button>
                  <button
                    type="button"
                    className={r.btnPrimary}
                    onClick={() => setProofOpen(true)}
                  >
                    I have completed payment ✓
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className={r.sidebar}>
            <div className={r.summary}>
              <h3 className={r.summaryTitle}>Registration Summary</h3>
              <div className={r.summaryRow()}>
                <span>Event</span>
                <b>{event.name}</b>
              </div>
              <div className={r.summaryRow()}>
                <span>Dates</span>
                <span>{event.datesShort}</span>
              </div>
              <div className={r.summaryRow()}>
                <span>Venue</span>
                <span>{event.venueShort}</span>
              </div>
              <div className={r.summaryRow()}>
                <span>Participation Type</span>
                <b>{typeLabel}</b>
              </div>
              {selectedSponsorPackage ? (
                <div className={r.summaryRow()}>
                  <span>Package</span>
                  <b>{selectedSponsorPackage.name}</b>
                </div>
              ) : null}
              <div className={r.summaryRow()}>
                <span>Invoice ref</span>
                <b className="break-all">{invoiceRef}</b>
              </div>
              <div className={r.summaryRow()}>
                <span>{selectedSponsorPackage ? "Package Fee" : "Registration Fee"}</span>
                <span>{formatMoney(displayKes, "KES")}</span>
              </div>
              <div className={r.summaryRow(true)}>
                <span>Total Amount</span>
                <strong className={r.summaryTotalAmount}>{formatMoney(displayKes, "KES")}</strong>
              </div>
            </div>
            <div className={r.infoBox}>
              <div className={r.infoTitle}>🎧 Need Assistance?</div>
              <p className={r.infoText}>
                For registration support, please contact us:
                <br />
                <b>{event.supportEmail || "—"}</b>
                <br />
                <b>{event.supportPhone || "—"}</b>
              </p>
            </div>
          </aside>
        </div>
      </main>

      <PrivacyBar />

      <ProofOfPaymentModal
        open={proofOpen}
        onClose={() => setProofOpen(false)}
        onSubmit={handleProofSubmit}
        submitting={proofSubmitting}
        invoiceReference={invoiceRef}
      />
    </div>
  );
}
