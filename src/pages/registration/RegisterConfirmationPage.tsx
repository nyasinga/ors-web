import { Link } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { participationTypes } from "../../data/registration";
import { formatMoney } from "../../i18n/format";
import { useTranslation } from "react-i18next";

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
    <div className="register-page">
      <RegisterHero current={4} />

      <main className="rg-main">
        <div className="home-container">
          <div className="rg-confirm-layout">
            <section className="rg-card rg-success">
              <div className="rg-success-mark">✓</div>
              <h2>Registration Successful!</h2>
              <p>
                Your registration for ISIPPE-3 has been confirmed and payment has been received.
                <br />
                A confirmation email with your registration details has been sent to your email
                address.
              </p>

              <div className="rg-detail-columns">
                <div className="rg-detail-box">
                  <h4>Registration Details</h4>
                  <div className="rg-drow">
                    <span aria-hidden>{"\U0001F464"}</span>
                    <span>
                      <b>Full Name</b>
                      {displayName}
                    </span>
                  </div>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u2709"}</span>
                    <span>
                      <b>Email Address</b>
                      {displayEmail}
                    </span>
                  </div>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b>Organisation</b>
                      {displayOrg}
                    </span>
                  </div>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u265F"}</span>
                    <span>
                      <b>Participation Type</b>
                      {typeLabel}
                    </span>
                  </div>
                </div>
                <div className="rg-detail-box">
                  <h4>Payment Details</h4>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b>Transaction Reference</b>
                      {reference}
                    </span>
                  </div>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b>Payment Date</b>
                      20 September 2026{" "}
                      11:42 AM
                    </span>
                  </div>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u25A3"}</span>
                    <span>
                      <b>Amount Paid</b>
                      {formatMoney(totalPaid, "KES")}
                      <br />({formatMoney(feeKes, "KES")} {t(feeLabelKey)} + KES 50 eCitizen fee)
                    </span>
                  </div>
                  <div className="rg-drow">
                    <span aria-hidden>{"\u25CF"}</span>
                    <span>
                      <b>Payment Status</b>
                      <span style={{ color: "#078047" }}>Successful</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="rg-confirm-actions">
                <button type="button" className="rg-small-btn">
                  Download Confirmation Letter
                </button>
                <button type="button" className="rg-small-btn">
                  Download Receipt
                </button>
                <button type="button" className="rg-small-btn">
                  Download QR Ticket
                </button>
                <button type="button" className="rg-small-btn">
                  Add to Calendar
                </button>
                <Link to="/register/details" className="rg-small-btn">
                  Update Registration
                </Link>
              </div>
            </section>

            <aside>
              <div className="rg-pass">
                <h3>Your Event Pass</h3>
                <p>Present this QR code at the registration counter to collect your badge.</p>
                <img className="rg-qr" src="/assets/qr-ticket.png" alt="Event pass QR code" />
                <div className="rg-pass-id">
                  Registration ID
                  <br />
                  {reference}
                </div>
              </div>
              <div className="rg-next">
                <h3>{"What's Next?"}</h3>
                <div className="rg-next-row">
                  <span className="rg-next-icon" aria-hidden>{"\u2709"}</span>
                  <div>
                    <strong>Check your email</strong>
                    <p>We have sent a confirmation email with event details and updates.</p>
                  </div>
                </div>
                <div className="rg-next-row">
                  <span className="rg-next-icon" aria-hidden>{"\u25A3"}</span>
                  <div>
                    <strong>Collect your badge</strong>
                    <p>Present your QR code at registration desk on arrival.</p>
                  </div>
                </div>
                <div className="rg-next-row">
                  <span className="rg-next-icon" aria-hidden>{"\u265F"}</span>
                  <div>
                    <strong>Join the event</strong>
                    <p>Attend the sessions and networking events from 12–14 November 2026.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="rg-card rg-helpful">
            <b>Helpful Links</b>
            <Link to="/programme">View Programme →</Link>
            <Link to="/venue">Venue Information →</Link>
            <Link to="/faq">Travel & Accommodation →</Link>
            <Link to="/faq">Contact Support →</Link>
          </div>
        </div>
      </main>

      <PrivacyBar />
    </div>
  );
}
