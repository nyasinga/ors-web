import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, ExternalLink, FileText } from "lucide-react";
import { SHOW_ECITIZEN_IFRAME } from "../../components/registration/PaymentModal";
import { BankPaymentDetailsCard } from "../../components/registration/BankPaymentDetailsCard";
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
                    <strong className={r.paymentMethodTitle}>Bank transfer or M-Pesa</strong>
                    <p className={r.paymentMethodText}>
                      Pay by bank transfer to the ACA KCB account, or via M-Pesa Paybill using your
                      invoice reference as the account number.
                    </p>
                  </div>
                </div>

                <BankPaymentDetailsCard
                  className="mt-4"
                  paymentReference={invoiceRef}
                  amountKes={displayKes}
                  footerNote={
                    <>
                      Bank narration or M-Pesa account number:{" "}
                      <strong className="text-[#334155]">{invoiceRef || "—"}</strong>
                    </>
                  }
                />

                <div className={r.notice}>
                  <strong className={r.noticeStrong}>ⓘ &nbsp; Important Information</strong>
                  <br />
                  • Transfer the exact amount via bank or M-Pesa Paybill 522522.
                  <br />
                  • For M-Pesa, use your invoice reference as the account number.
                  <br />
                  • For bank transfer, use your invoice reference as the narration.
                  <br />• After paying, click below and attach your proof of payment.
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
