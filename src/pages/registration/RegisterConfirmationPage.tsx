import { Link } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { participationTypes } from "../../data/registration";
import { formatMoney } from "../../i18n/format";
import { useTranslation } from "react-i18next";
import * as r from "../../components/registration/registerStyles";

/** Registration step 4 — structure & CSS from HTML package */
export function RegisterConfirmationPage() {
  const { t } = useTranslation("common");
  const { details, participationType, feeKes, feeLabelKey, reference } = useRegistration();
  const typeLabel =
    participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";
  const displayName =
    [details.title, details.fullName].filter(Boolean).join(" ") || "Jimmy Ng'etich";
  const displayEmail = details.email || "jimmy@example.co.ke";
  const displayOrg = details.organisation || "SlickSales Limited";
  const totalPaid = feeKes + 50;

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
                Your registration for ISIPPE-3 has been confirmed and payment has been received.
                <br />
                A confirmation email with your registration details has been sent to your email
                address.
              </p>

              <div className={r.detailColumns}>
                <div className={r.detailBox}>
                  <h4 className={r.detailTitle}>Registration Details</h4>
                  <div className={r.drow}>
                    <span aria-hidden>{"\U0001F464"}</span>
                    <span>
                      <b className={r.drowLabel}>Full Name</b>
                      {displayName}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u2709"}</span>
                    <span>
                      <b className={r.drowLabel}>Email Address</b>
                      {displayEmail}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Organisation</b>
                      {displayOrg}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u265F"}</span>
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
                      {reference}
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Payment Date</b>
                      20 September 2026{" "}
                      11:42 AM
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b className={r.drowLabel}>Amount Paid</b>
                      {formatMoney(totalPaid, "KES")}
                      <br />({formatMoney(feeKes, "KES")} {t(feeLabelKey)} + KES 50 eCitizen fee)
                    </span>
                  </div>
                  <div className={r.drow}>
                    <span aria-hidden>{"\u25CF"}</span>
                    <span>
                      <b className={r.drowLabel}>Payment Status</b>
                      <span className="text-[#078047]">Successful</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={r.confirmActions}>
                <button type="button" className={r.smallBtn}>
                  Download Confirmation Letter
                </button>
                <button type="button" className={r.smallBtn}>
                  Download Receipt
                </button>
                <button type="button" className={r.smallBtn}>
                  Download QR Ticket
                </button>
                <button type="button" className={r.smallBtn}>
                  Add to Calendar
                </button>
                <Link to="/register/details" className={r.smallBtnLink}>
                  Update Registration
                </Link>
              </div>
            </section>

            <aside>
              <div className={r.pass}>
                <h3 className={r.passTitle}>Your Event Pass</h3>
                <p className={r.passText}>Present this QR code at the registration counter to collect your badge.</p>
                <img className={r.qr} src="/assets/qr-ticket.png" alt="Event pass QR code" />
                <div className={r.passId}>
                  Registration ID
                  <br />
                  {reference}
                </div>
              </div>
              <div className={r.next}>
                <h3 className={r.nextTitle}>{"What's Next?"}</h3>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>{"\u2709"}</span>
                  <div>
                    <strong className={r.nextRowTitle}>Check your email</strong>
                    <p className={r.nextRowText}>We have sent a confirmation email with event details and updates.</p>
                  </div>
                </div>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>{"\u25A3"}</span>
                  <div>
                    <strong className={r.nextRowTitle}>Collect your badge</strong>
                    <p className={r.nextRowText}>Present your QR code at registration desk on arrival.</p>
                  </div>
                </div>
                <div className={r.nextRow}>
                  <span className={r.nextIcon} aria-hidden>{"\u265F"}</span>
                  <div>
                    <strong className={r.nextRowTitle}>Join the event</strong>
                    <p className={r.nextRowText}>Attend the sessions and networking events from 12–14 November 2026.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className={r.helpful}>
            <b className={r.helpfulLabel}>Helpful Links</b>
            <Link to="/programme" className={r.helpfulLink}>View Programme →</Link>
            <Link to="/venue" className={r.helpfulLink}>Venue Information →</Link>
            <Link to="/faq" className={r.helpfulLink}>Travel & Accommodation →</Link>
            <Link to="/faq" className={r.helpfulLink}>Contact Support →</Link>
          </div>
        </div>
      </main>

      <PrivacyBar />
    </div>
  );
}
