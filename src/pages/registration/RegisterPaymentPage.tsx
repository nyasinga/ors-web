import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaymentModal from "../../components/registration/PaymentModal";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useToast } from "../../components/ui/Toast";
import { useRegistration } from "../../contexts/RegistrationContext";
import { participationTypes } from "../../data/registration";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import { initiateEcitizenCheckout, signupAfterPayment } from "../../lib/pesaflow";
import { engagementToPublicSponsors } from "../../lib/publicEvent";
import { parseKesPrice } from "../../lib/ticketAnalytics";
import type { ECitizenCheckoutSession } from "../../types/registration";
import * as r from "../../components/registration/registerStyles";

const PAYMENT_CURRENCY = "KES";

/** Registration step 3 — initiate-checkout → eCitizen iframe → signup-isippe. */
export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const event = useEventCopy();
  const { engagement } = usePublicEngagement();
  const {
    files,
    participationType,
    details,
    reference,
    feeKes,
    feeUsd,
    feeLabel,
    feeUntil,
    earlyBird,
    late,
    selectedSponsorPackage,
  } = useRegistration();
  const typeLabel = participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";
  const engagementID = engagement?.engagementID ? String(engagement.engagementID) : null;
  const isSponsor = participationType === "sponsor" || Boolean(selectedSponsorPackage);
  const liveSponsorPackages = useMemo(
    () => engagementToPublicSponsors(engagement),
    [engagement],
  );

  /**
   * Sponsors: live package price from engagement (refreshed before checkout/signup).
   * Others: registration ticket fee from context.
   */
  const resolvedTicket = useMemo(() => {
    if (!isSponsor) {
      return {
        amount: feeKes,
        sponsor: null as null | { id: string; name: string; kes: number },
      };
    }
    const live =
      liveSponsorPackages.find(
        (pkg) =>
          pkg.id === selectedSponsorPackage?.id ||
          pkg.name === selectedSponsorPackage?.name,
      ) || null;
    if (live) {
      const amount = parseKesPrice(live.price);
      if (amount > 0) {
        return { amount, sponsor: { id: live.id, name: live.name, kes: amount } };
      }
    }
    const kes = selectedSponsorPackage?.kes ?? 0;
    return {
      amount: kes,
      sponsor: selectedSponsorPackage
        ? { id: selectedSponsorPackage.id, name: selectedSponsorPackage.name, kes }
        : null,
    };
  }, [isSponsor, feeKes, liveSponsorPackages, selectedSponsorPackage]);

  const displayKes = resolvedTicket.amount > 0 ? resolvedTicket.amount : feeKes;
  const invoiceDescription = selectedSponsorPackage
    ? `${event.name || "Event"} — ${selectedSponsorPackage.name}`
    : `${event.name || "Event"} registration fee`;

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkout, setCheckout] = useState<ECitizenCheckoutSession | null>(null);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);

  const startPayment = async () => {
    const amount = resolvedTicket.amount;
    if (!amount || amount <= 0) {
      toast.error(
        isSponsor
          ? "Sponsorship package price is not available yet. Select a package with a published price."
          : "Registration fee is not available yet. Please try again once ticket prices are published.",
      );
      return;
    }
    if (isSponsor && !resolvedTicket.sponsor) {
      toast.error("Select a sponsorship package before paying.");
      return;
    }
    if (!details.email || !details.fullName || !details.phone) {
      toast.error("Complete your registration details before paying.");
      return;
    }

    setLoading(true);
    toast.info("Starting eCitizen payment…");
    try {
      const session = await initiateEcitizenCheckout({
        amount: String(amount),
        email: details.email,
        idNumber: details.phone.replace(/\D/g, "") || reference,
        phone: details.phone,
        name: details.fullName,
        itemDescription: invoiceDescription,
        currency: PAYMENT_CURRENCY,
        callbackURL: window.location.href,
      });

      setInvoiceRef(String(session.fields.billRefNumber));
      setCheckout(session);
      setIsModalOpen(true);
      toast.success("Invoice ready — complete payment in the eCitizen window.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start eCitizen payment.", 6000);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAfterPayment = async () => {
    if (!invoiceRef) {
      toast.error("Missing invoice reference. Please start payment again.");
      return;
    }
    setIsFinalizing(true);
    toast.info("Completing registration…");
    try {
      // Re-read live sponsor price immediately before signup-isippe.
      const livePackages = engagementToPublicSponsors(engagement);
      const live =
        livePackages.find(
          (pkg) =>
            pkg.id === selectedSponsorPackage?.id ||
            pkg.name === selectedSponsorPackage?.name,
        ) || null;
      const amount = isSponsor
        ? parseKesPrice(live?.price) || selectedSponsorPackage?.kes || 0
        : feeKes;
      const sponsor = isSponsor
        ? {
            id: live?.id || selectedSponsorPackage?.id || "",
            name: live?.name || selectedSponsorPackage?.name || "",
            kes: amount,
          }
        : null;

      if (!amount || amount <= 0) {
        throw new Error(
          isSponsor
            ? "Sponsorship package price is missing. Cannot complete registration."
            : "Registration fee is missing. Cannot complete registration.",
        );
      }
      if (isSponsor && !sponsor?.id) {
        throw new Error("Sponsorship package is missing. Cannot complete registration.");
      }

      await signupAfterPayment(
        {
          title: details.title,
          fullName: details.fullName,
          email: details.email,
          phoneNo: details.phone,
          country: details.country,
          city: details.city,
          userType: isSponsor ? "sponsor" : participationType,
          extraData: {
            dietary: details.dietary,
            accessibility: details.accessibility,
            jobTitle: details.jobTitle,
            organisation: details.organisation,
            engagementID,
            sponsorPackage: sponsor
              ? {
                  id: sponsor.id,
                  name: sponsor.name,
                  amount,
                  price: amount,
                }
              : {},
            ticket: {
              amount,
              currency: PAYMENT_CURRENCY,
            },
            eCitizen: {
              reference,
              currency: PAYMENT_CURRENCY,
              invoiceRef,
            },
          },
        },
        files,
      );

      setIsModalOpen(false);
      toast.success("Payment confirmed — registration complete.");
      navigate("/register/confirmation");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not complete registration after payment.",
        6000,
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className={r.registerPage}>
      <RegisterHero current={3} />
      <main className={r.main}>
        <div className={cn(r.container, r.payLayout)}>
          <section className={cn(r.card, r.section)}>
            <h2 className={r.sectionTitle}>3. Payment</h2>
            <p className={r.subtitle}>
              Complete your registration by making the payment using the eCitizen platform.
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
              <img className={r.ecitizen} src="/assets/ecitizen.svg" alt="eCitizen" />
              <div>
                <strong className={r.paymentMethodTitle}>Pay via eCitizen (Default)</strong>
                <p className={r.paymentMethodText}>
                  You will be redirected to the eCitizen payment platform to complete your payment
                  securely.
                </p>
              </div>
            </div>

            <div className={r.notice}>
              <strong className={r.noticeStrong}>ⓘ &nbsp; Important Information</strong>
              <br />
              • You will open the official eCitizen payment platform in a secure window.
              <br />
              • Complete your payment, then confirm below to finish registration.
              <br />• After successful payment, you will receive a confirmation and your electronic
              ticket via email.
            </div>

            <div className={r.actions}>
              <Link className={r.btn} to="/register/details">
                ← Back to Details
              </Link>
              <button
                type="button"
                className={r.btnPrimary}
                disabled={loading}
                onClick={() => void startPayment()}
              >
                {loading ? "Starting eCitizen…" : "Proceed to eCitizen"}{" "}
                <span className={r.arrow} aria-hidden>
                  →
                </span>
              </button>
            </div>
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

      <PaymentModal
        isOpen={isModalOpen}
        checkout={checkout}
        onClose={() => setIsModalOpen(false)}
        onPaymentComplete={finalizeAfterPayment}
        isVerifying={isFinalizing}
      />
    </div>
  );
}
