import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { useRegistration } from "../../hooks/useRegistration";
import { participationTypes } from "../../data/registration";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import * as r from "../../components/registration/registerStyles";
import { API_BASE_URL, TENANT_ID } from "../../lib/api";
import { fetchEventPassPdfUrl } from "../../lib/printParticipantTicket";
import type { EngagementTicketStatus } from "../../types/ticket";

/** Registration step 4 — structure & CSS from HTML package */
export function RegisterConfirmationPage() {
  const event = useEventCopy();
  const toast = useToast();
  const { details, participationType, feeKes, feeLabel, reference } = useRegistration();
  const typeLabel = participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";
  const displayName = [details.title, details.fullName].filter(Boolean).join(" ").trim();
  const displayEmail = details.email.trim();
  const displayOrg = details.organisation.trim();
  const totalPaid = feeKes > 0 ? feeKes + 50 : 0;
  const { googleCalendarURL, passCodeQR, passCode, status: paymentStatus } = details;
  const [passLoading, setPassLoading] = useState(false);
  const [passPreview, setPassPreview] = useState<{ url: string; passCode: string } | null>(null);
  const passIframeRef = useRef<HTMLIFrameElement>(null);

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

  const downloadEventPass = () => {
    if (!passPreview) return;
    const link = document.createElement("a");
    link.href = passPreview.url;
    link.download = `ticket-${passPreview.passCode}.pdf`;
    link.click();
  };

  const printEventPass = () => {
    const frame = passIframeRef.current;
    try {
      frame?.contentWindow?.focus();
      frame?.contentWindow?.print();
    } catch {
      toast.error("Unable to print from preview. Try downloading the PDF.");
    }
  };

  const paidAt = new Date().toLocaleString("en-GB", {
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
              <div className={r.successMark}>✓</div>
              <h2 className={r.successTitle}>Registration Successful!</h2>
              <p className={r.successText}>
                Your registration for {event.name || "the event"} has been confirmed and payment has
                been received.
                <br />
                A confirmation email with your registration details has been sent to your email
                address.
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
                      <b className={r.drowLabel}>Transaction Reference</b>
                      {reference || "—"}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Payment Date</b>
                      {paidAt}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Amount Paid</b>
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
                      <b className={r.drowLabel}>Payment Status</b>
                      <span className="text-[#078047]">{paymentStatus as EngagementTicketStatus}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={r.confirmActions}>
                <button
                  type="button"
                  className={`${r.smallBtn} hidden`}
                  onClick={() => {
                    if (!passCode) return;
                    const link = document.createElement("a");
                    link.href = `${API_BASE_URL}/ticketing/${passCode}/ecitizen?tenant-id=${TENANT_ID}`;
                    link.target = "_blank";
                    link.download = `receipt-${passCode}.pdf`;
                    link.click();
                  }}
                >
                  Download Receipt
                </button>
                <button
                  type="button"
                  className={r.smallBtn}
                  disabled={!passCode || passLoading}
                  onClick={() => {
                    void openEventPass();
                  }}
                >
                  {passLoading ? "Loading…" : "Download QR Ticket"}
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
                <h3 className={r.passTitle}>Your Event Pass</h3>
                <p className={r.passText}>
                  Present this QR code at the registration counter to collect your badge.
                </p>
                {passCodeQR && (
                  <img
                    className={r.qr}
                    src={passCode ? `data:image/png;base64,${passCodeQR}` : "/assets/qr-ticket.png"}
                    alt="Event pass QR code"
                  />
                )}
                <div className={r.passId}>
                  Pass Code
                  <br />
                  {passCode || "—"}
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
                      We have sent a confirmation email with event details and updates.
                    </p>
                  </div>
                </div>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>
                    {"\u25A3"}
                  </span>
                  <div>
                    <strong className={r.nextRowTitle}>Collect your badge</strong>
                    <p className={r.nextRowText}>
                      Present your QR code at registration desk on arrival.
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

      <Modal
        open={Boolean(passPreview)}
        onClose={closePassPreview}
        title="Your Event Pass"
        bottomSheetOnMobile={false}
        className="!max-w-3xl md:!max-w-3xl"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={closePassPreview}>
              Close
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={downloadEventPass}>
              <Download size={14} className="mr-1.5" />
              Download
            </Button>
            <Button type="button" size="sm" onClick={printEventPass}>
              <Printer size={14} className="mr-1.5" />
              Print
            </Button>
          </div>
        }
      >
        {passPreview ? (
          <iframe
            ref={passIframeRef}
            title={`Event pass ${passPreview.passCode}`}
            src={passPreview.url}
            className="h-[min(70vh,640px)] w-full rounded-md border border-[#e0e9f3] bg-slate-50"
          />
        ) : null}
      </Modal>
    </div>
  );
}
