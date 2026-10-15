import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaymentModal from "../../components/registration/PaymentModal";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { participationTypes } from "../../data/registration";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import {
  checkPesaflowStatus,
  createPesaflowInvoice,
  signupAfterPayment,
} from "../../lib/pesaflow";
import type { ECitizenPayload } from "../../types/registration";
import * as r from "../../components/registration/registerStyles";

/** Registration step 3 — eCitizen payment via Pesaflow. */
export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const event = useEventCopy();
  const {
    participationType,
    details,
    reference,
    feeKes,
    feeUsd,
    feeLabel,
    feeUntil,
    earlyBird,
    late,
  } = useRegistration();
  const typeLabel =
    participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<ECitizenPayload | null>(null);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = async () => {
    if (!feeKes || feeKes <= 0) {
      setError("Registration fee is not available yet. Please try again once ticket prices are published.");
      return;
    }
    if (!details.email || !details.fullName || !details.phone) {
      setError("Complete your registration details before paying.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await createPesaflowInvoice({
        amount: String(feeKes),
        email: details.email,
        idNumber: details.phone.replace(/\D/g, "") || reference,
        phone: details.phone,
        name: details.fullName,
        itemDescription: `${event.name || "Event"} registration fee`,
      });
      setInvoiceRef(data.billRefNumber);
      setPaymentPayload(data);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start eCitizen payment.");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndFinalize = async () => {
    if (!invoiceRef) {
      setError("Missing invoice reference. Please start payment again.");
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const statusData = await checkPesaflowStatus(invoiceRef);
      const ok =
        statusData?.status === "Success" ||
        statusData?.status === "COMPLETED" ||
        statusData?.status === "completed";
      if (!ok) {
        setError(
          "Payment still pending. Complete checkout in the eCitizen window, then confirm again.",
        );
        return;
      }

      setIsModalOpen(false);
      await signupAfterPayment({
        title: details.title,
        fullName: details.fullName,
        email: details.email,
        phone: details.phone,
        organisation: details.organisation,
        jobTitle: details.jobTitle,
        country: details.country,
        city: details.city,
        dietary: details.dietary,
        accessibility: details.accessibility,
        reference,
        feeKes,
        feeLabel,
        userType: participationType,
        invoiceRef,
      });
      navigate("/register/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify payment.");
    } finally {
      setIsVerifying(false);
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

            {error ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <div className={r.payTop}>
              <div className={r.sidePrice}>
                <div className={r.priceLabel}>🏷 Registration Fee</div>
                <b>{feeLabel}</b>
                <div className={r.period}>{feeUntil}</div>
                <div className={r.price}>{formatMoney(feeKes, "KES")}</div>
                <div className={r.priceSub}>{formatMoney(feeUsd, "USD")} (Approx.)</div>
              </div>
              <div className={r.infoBox}>
                <div className={r.infoTitle}>▣ Registration Periods</div>
                <p className={r.infoText}>
                  <b>{earlyBird.label}</b>
                  <br />
                  {earlyBird.until} &nbsp; <b>{formatMoney(earlyBird.kes, "KES")}</b>
                  <br />
                  <br />
                  <b>{late.label}</b>
                  <br />
                  {late.until} &nbsp; <b>{formatMoney(late.kes, "KES")}</b>
                </p>
              </div>
            </div>

            <h3 className={r.payHeading}>Payment Method</h3>
            <div className={r.paymentMethod}>
              <span className={r.radioBlue} aria-hidden />
              <img className={r.ecitizen} src="/assets/ecitizen.png" alt="eCitizen" />
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
              <div className={r.summaryRow()}>
                <span>Registration Fee</span>
                <span>{formatMoney(feeKes, "KES")}</span>
              </div>
              <div className={r.summaryRow(true)}>
                <span>Total Amount</span>
                <strong className={r.summaryTotalAmount}>{formatMoney(feeKes, "KES")}</strong>
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
        payload={paymentPayload}
        onClose={() => setIsModalOpen(false)}
        onPaymentComplete={verifyAndFinalize}
        isVerifying={isVerifying}
      />
    </div>
  );
}
