import { Link, useNavigate } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { fees } from "../../data/event";
import { participationTypes } from "../../data/registration";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import * as r from "../../components/registration/registerStyles";

/** Registration step 3 — structure & CSS from HTML package */
export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const { participationType, feeKes, feeUsd, feeLabelKey } = useRegistration();
  const typeLabel =
    participationTypes.find((item) => item.id === participationType)?.title ?? "Delegate";

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
                <div className={r.priceLabel}>🏷 Registration Fee</div>
                <b>{t(feeLabelKey)}</b>
                <div className={r.period}>{t(fees.earlyBird.untilKey)}</div>
                <div className={r.price}>{formatMoney(feeKes, "KES")}</div>
                <div className={r.priceSub}>{formatMoney(feeUsd, "USD")} (Approx.)</div>
              </div>
              <div className={r.infoBox}>
                <div className={r.infoTitle}>▣ Registration Periods</div>
                <p className={r.infoText}>
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
              • You will be redirected to the official eCitizen payment platform.
              <br />
              • Complete your payment and you will be returned to this portal automatically.
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
                onClick={() => navigate("/register/confirmation")}
              >
                Proceed to eCitizen {" "}
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
