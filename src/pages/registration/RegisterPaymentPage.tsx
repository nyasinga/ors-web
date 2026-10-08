import { Link, useNavigate } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { fees } from "../../data/event";
import { participationTypes } from "../../data/registration";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";

/** Registration step 3 — structure & CSS from HTML package */
export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const { participationType, feeKes, feeUsd, feeLabelKey } = useRegistration();
  const typeLabel =
    participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";

  return (
    <div className="register-page">
      <RegisterHero current={3} />

      <main className="rg-main">
        <div className="home-container rg-pay-layout">
          <section className="rg-card rg-section">
            <h2>3. Payment</h2>
            <p className="rg-subtitle">
              Complete your registration by making the payment using the eCitizen platform.
            </p>

            <div className="rg-pay-top">
              <div className="rg-side-price">
                <div className="rg-price-label">🏷 Registration Fee</div>
                <b>{t(feeLabelKey)}</b>
                <div className="rg-period">{t(fees.earlyBird.untilKey)}</div>
                <div className="rg-price">{formatMoney(feeKes, "KES")}</div>
                <div className="rg-price-sub">{formatMoney(feeUsd, "USD")} (Approx.)</div>
              </div>
              <div className="rg-info-box">
                <div className="rg-info-title">▣ Registration Periods</div>
                <p>
                  <b>{t(fees.earlyBird.labelKey)}</b>
                  <br />
                  {t(fees.earlyBird.untilKey)} &nbsp; <b>{formatMoney(fees.earlyBird.kes, "KES")}</b>
                  <br />
                  <br />
                  <b>{t(fees.late.labelKey)}</b>
                  <br />
                  {t(fees.late.untilKey)} &nbsp; <b>{formatMoney(fees.late.kes, "KES")}</b>
                </p>
              </div>
            </div>

            <h3 className="rg-pay-heading">Payment Method</h3>
            <div className="rg-payment-method">
              <span className="rg-radio-blue" aria-hidden />
              <img className="rg-ecitizen" src="/assets/ecitizen.png" alt="eCitizen" />
              <div>
                <strong>Pay via eCitizen (Default)</strong>
                <p>
                  You will be redirected to the eCitizen payment platform to complete your payment
                  securely.
                </p>
              </div>
            </div>

            <div className="rg-notice">
              <strong>ⓘ &nbsp; Important Information</strong>
              <br />
              • You will be redirected to the official eCitizen payment platform.
              <br />
              • Complete your payment and you will be returned to this portal automatically.
              <br />• After successful payment, you will receive a confirmation and your electronic
              ticket via email.
            </div>

            <div className="rg-actions">
              <Link className="rg-btn" to="/register/details">
                ← Back to Details
              </Link>
              <button
                type="button"
                className="rg-btn primary"
                onClick={() => navigate("/register/confirmation")}
              >
                Proceed to eCitizen Payment{" "}
                <span className="rg-arrow" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </section>

          <aside className="rg-sidebar">
            <div className="rg-summary">
              <h3>Registration Summary</h3>
              <div className="rg-summary-row">
                <span>Event</span>
                <b>{event.name}</b>
              </div>
              <div className="rg-summary-row">
                <span>Dates</span>
                <span>{event.datesShort}</span>
              </div>
              <div className="rg-summary-row">
                <span>Venue</span>
                <span>{event.venueShort}</span>
              </div>
              <div className="rg-summary-row">
                <span>Participation Type</span>
                <b>{typeLabel}</b>
              </div>
              <div className="rg-summary-row">
                <span>Registration Fee</span>
                <span>{formatMoney(feeKes, "KES")}</span>
              </div>
              <div className="rg-summary-row total">
                <span>Total Amount</span>
                <strong>{formatMoney(feeKes, "KES")}</strong>
              </div>
            </div>
            <div className="rg-info-box">
              <div className="rg-info-title">🎧 Need Assistance?</div>
              <p>
                For registration support, please contact us:
                <br />
                <b>{event.supportEmail}</b>
                <br />
                <b>{event.supportPhone}</b>
              </p>
            </div>
          </aside>
        </div>
      </main>

      <PrivacyBar />
    </div>
  );
}
