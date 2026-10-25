import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { EventPassPreviewModal } from "../../components/tickets/EventPassPreviewModal";
import { useToast } from "../../components/ui/Toast";
import { useRegistration } from "../../hooks/useRegistration";
import { participationTypes } from "../../data/registration";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import * as r from "../../components/registration/registerStyles";
import { fetchEventPassPdfUrl } from "../../lib/printParticipantTicket";
import { canIssueEventPass } from "../../lib/paymentVerification";

/** Registration step 4 — pending verification until admin confirms payment. */
export function RegisterConfirmationPage() {
  const event = useEventCopy();
  const toast = useToast();
  const { details, participationType, feeKes, feeLabel, reference } = useRegistration();
  const typeLabel = participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";
  const displayName = [details.title, details.fullName].filter(Boolean).join(" ").trim();
  const displayEmail = details.email.trim();
  const displayOrg = details.organisation.trim();
  const totalPaid = feeKes > 0 ? feeKes + 50 : 0;
  const { googleCalendarURL, passCodeQR, passCode } = details;
  const [passLoading, setPassLoading] = useState(false);
  const [passPreview, setPassPreview] = useState<{ url: string; passCode: string } | null>(null);

  const verified =
    details.verificationStatus === "confirmed" ||
    details.verificationStatus === "waived" ||
    canIssueEventPass({
      status: details.status,
      transactionReference: details.paymentReference || details.reference,
      paymentMode: details.verificationStatus === "waived" ? "waived" : undefined,
    });

  // Proof just submitted → always pending until admin verifies (even if passCode exists).
  const pendingVerification =
    details.verificationStatus === "pending_verification" ||
    details.status === "pending_verification" ||
    (!verified && Boolean(details.paymentReference || details.status === "registered"));

  const passAllowed = verified && !pendingVerification;

  const closePassPreview = () => {
    setPassPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  useEffect(() => {
    return () => {
      if (passPreview?.url) URL.revokeObjectURL(passPreview.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEventPass = async () => {
    if (!passAllowed) {
      toast.info("Your event pass will be available after an administrator verifies your payment.");
      return;
    }
    if (!passCode) {
      toast.error("No pass code available for this ticket.");
      return;
    }
    setPassLoading(true);
    try {
      closePassPreview();
      const { url, passCode: code } = await fetchEventPassPdfUrl(passCode);
      setPassPreview({ url, passCode: code });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load event pass.");
    } finally {
      setPassLoading(false);
    }
  };

  const submittedAt = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!displayName || !displayEmail) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className={r.registerPage}>
      <RegisterHero current={4} />

      <main className={r.main}>
        <div className={r.container}>
          <div className={r.confirmLayout}>
            <section className={r.success}>
              <div className={r.successMark}>{passAllowed ? "✓" : "…"}</div>
              <h2 className={r.successTitle}>
                {passAllowed ? "Registration verified" : "Registration received"}
              </h2>
              <p className={r.successText}>
                {passAllowed ? (
                  <>
                    Your registration for {event.name || "the event"} has been verified.
                    <br />
                    You can download your event pass below.
                  </>
                ) : (
                  <>
                    Thank you — your registration and payment proof for {event.name || "the event"}{" "}
                    have been received and are <strong>pending admin verification</strong>.
                    <br />
                    Your event pass and entry QR will be available only after an administrator
                    confirms your payment. You will be able to access them from your participant
                    account once verified.
                  </>
                )}
              </p>

              <div className={r.detailColumns}>
                <div className={r.detailBox}>
                  <h4 className={r.detailTitle}>Registration Details</h4>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Full Name</b>
                      {displayName}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Email Address</b>
                      {displayEmail}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Organisation</b>
                      {displayOrg || "—"}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Participation Type</b>
                      {typeLabel}
                    </span>
                  </div>
                </div>

                <div className={r.detailBox}>
                  <h4 className={r.detailTitle}>Payment Details</h4>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Registration reference</b>
                      {reference || details.reference || "—"}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Payment reference submitted</b>
                      {details.paymentReference || "—"}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Submitted</b>
                      {submittedAt}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Amount</b>
                      {feeKes > 0 ? (
                        <>
                          {formatMoney(totalPaid, "KES")}
                          <br />
                          ({formatMoney(feeKes, "KES")} {feeLabel} + KES 50 eCitizen fee)
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Status</b>
                      <span className={passAllowed ? "text-[#078047]" : "text-[#b45309]"}>
                        {passAllowed ? "Verified" : "Pending verification"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={r.confirmActions}>
                <button
                  type="button"
                  className={r.smallBtn}
                  disabled={!passAllowed || !passCode || passLoading}
                  title={
                    passAllowed
                      ? "Download event pass"
                      : "Available after admin verifies your payment"
                  }
                  onClick={() => {
                    void openEventPass();
                  }}
                >
                  {passLoading
                    ? "Loading…"
                    : passAllowed
                      ? "Download QR Ticket"
                      : "Pass locked until verified"}
                </button>
                {googleCalendarURL && (
                  <a
                    href={googleCalendarURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={r.smallBtn}
                  >
                    Add to Calendar
                  </a>
                )}
                <Link to="/participant-login" className={r.smallBtnLink}>
                  Access Event
                </Link>
              </div>
            </section>

            <aside>
              <div className={r.pass}>
                <h3 className={r.passTitle}>
                  {passAllowed ? "Your Event Pass" : "Event pass pending"}
                </h3>
                <p className={r.passText}>
                  {passAllowed
                    ? "Present this QR code at the registration counter to collect your badge."
                    : "Your QR code and entry tag will appear here after an administrator verifies your payment proof."}
                </p>
                {passAllowed && passCodeQR ? (
                  <img
                    className={r.qr}
                    src={passCode ? `data:image/png;base64,${passCodeQR}` : "/assets/qr-ticket.png"}
                    alt="Event pass QR code"
                  />
                ) : (
                  <div
                    className={r.qr}
                    style={{
                      display: "grid",
                      placeItems: "center",
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                      padding: 16,
                    }}
                  >
                    QR reserved until verification
                  </div>
                )}
                <div className={r.passId}>
                  Pass Code
                  <br />
                  {passAllowed ? passCode || "—" : "Issued after verification"}
                </div>
              </div>

              <div className={r.next}>
                <h3 className={r.nextTitle}>{"What's Next?"}</h3>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>
                    {"\u2709"}
                  </span>
                  <div>
                    <strong className={r.nextRowTitle}>Check your email</strong>
                    <p className={r.nextRowText}>
                      We will notify you when your payment has been verified.
                    </p>
                  </div>
                </div>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>
                    {"\u25A3"}
                  </span>
                  <div>
                    <strong className={r.nextRowTitle}>
                      {passAllowed ? "Collect your badge" : "Wait for verification"}
                    </strong>
                    <p className={r.nextRowText}>
                      {passAllowed
                        ? "Present your QR code at the registration desk on arrival."
                        : "Admin will review your proof. Your pass unlocks once confirmed."}
                    </p>
                  </div>
                </div>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>
                    {"\u265F"}
                  </span>
                  <div>
                    <strong className={r.nextRowTitle}>Join the event</strong>
                    <p className={r.nextRowText}>
                      Attend the sessions and networking events
                      {event.datesShort ? ` (${event.datesShort})` : ""}.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className={r.helpful}>
            <b className={r.helpfulLabel}>Helpful Links</b>
            <Link to="/programme" className={r.helpfulLink}>
              View Programme →
            </Link>
            <Link to="/venue" className={r.helpfulLink}>
              Venue Information →
            </Link>
            <Link to="/faq" className={r.helpfulLink}>
              Travel & Accommodation →
            </Link>
            <Link to="/faq" className={r.helpfulLink}>
              Contact Support →
            </Link>
          </div>
        </div>
      </main>

      <PrivacyBar />

      <EventPassPreviewModal
        open={Boolean(passPreview)}
        url={passPreview?.url ?? null}
        passCode={passPreview?.passCode}
        onClose={closePassPreview}
        onError={(message) => toast.error(message)}
      />
    </div>
  );
}
