import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Headphones,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ScanLine,
} from "lucide-react";
import { useEventCopy } from "../../i18n/useEventCopy";
import { useTranslation } from "react-i18next";

/** Participant login — structure & CSS from HTML package */
export function ParticipantLoginPage() {
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [scanned, setScanned] = useState(false);

  const login = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.trim().length < 6 && !scanned) {
      setError("Enter the 6-digit pass code from your email");
      return;
    }
    setError("");
    navigate("/me");
  };

  const focusPass = () => {
    document.getElementById("pass")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("passcode")?.focus();
  };

  return (
    <div className="participant-login-page">
      <section className="pl-hero">
        <div className="pl-hero-bg" aria-hidden />
        <div className="home-container pl-hero-inner">
          <div className="pl-hero-copy">
            <div className="pl-crumb">
              <Link to="/">{t("nav.home")}</Link>
              &nbsp;›&nbsp; <span>{t("nav.participantLogin")}</span>
            </div>
            <div className="pl-redline" aria-hidden />
            <h1 className="pl-hero-title">{t("nav.participantLogin")}</h1>
            <p>Access your ISIPPE-3 registration, ticket and event information.</p>
            <div className="pl-event-row">
              <div className="pl-event">
                <CalendarDays size={34} strokeWidth={2} />
                <strong>{event.dates}</strong>
              </div>
              <div className="pl-divider" aria-hidden />
              <div className="pl-venue">
                <MapPin size={34} strokeWidth={0} fill="currentColor" />
                <div>
                  <strong>
                    Kenyatta International
                    <br />
                    Convention Centre (KICC)
                  </strong>
                  <small>{event.city}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="pl-login-area">
        <div className="home-container">
          <div className="pl-login-grid">
            <section className="pl-method">
              <div className="pl-method-head">
                <div className="pl-method-icon">
                  <QrCode size={42} strokeWidth={1.8} />
                </div>
                <div>
                  <h2>Login with QR Code</h2>
                  <p className="pl-method-desc">
                    Present the QR code from your confirmation email or registration receipt.
                  </p>
                </div>
              </div>
              <div className="pl-qr-area">
                <div className="pl-qr-frame">
                  <span className="pl-qr-corners" aria-hidden />
                  <div className="pl-qr-code" aria-label="QR code placeholder" />
                </div>
                <button
                  type="button"
                  className="pl-scan-box"
                  onClick={() => {
                    setScanned(true);
                    setError("");
                  }}
                >
                  <ScanLine size={31} strokeWidth={1.8} />
                  <div>
                    <strong>{scanned ? "QR image ready — click Login" : "Click to scan QR code"}</strong>
                    <span>{scanned ? "Pass code optional when QR is ready" : "or drag and drop an image"}</span>
                  </div>
                </button>
                <div className="pl-trouble">
                  Having trouble?{" "}
                  <button type="button" onClick={focusPass}>
                    Enter your pass code instead
                  </button>
                </div>
              </div>
            </section>

            <div className="pl-method-divider" aria-hidden>
              <span className="pl-or">OR</span>
            </div>

            <section className="pl-method" id="pass">
              <div className="pl-method-head">
                <div className="pl-method-icon">
                  <Mail size={42} strokeWidth={1.8} />
                </div>
                <div>
                  <h2>Login with Pass Code</h2>
                  <p className="pl-method-desc">
                    Enter the pass code sent to your registered email address.
                  </p>
                </div>
              </div>
              <form className="pl-pass-form" onSubmit={login}>
                <div className="pl-field">
                  <label htmlFor="passcode">
                    Pass Code <sup className="pl-required">*</sup>
                  </label>
                  <input
                    id="passcode"
                    className="pl-pass-input pl-code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="Enter 6-digit pass code"
                    required={!scanned}
                    aria-invalid={Boolean(error) || undefined}
                  />
                  {error ? (
                    <span className="pl-field-error" role="alert">
                      {error}
                    </span>
                  ) : null}
                </div>
                <button className="pl-login-btn" type="submit">
                  Login &nbsp; →
                </button>
              </form>
              <div className="pl-info">
                <div className="pl-info-icon">i</div>
                <div>
                  <strong>Can&apos;t find your pass code?</strong>
                  <ul>
                    <li>Check your inbox (including spam folder) for the email from ISIPPE-3.</li>
                    <li>Use the QR code from your registration receipt.</li>
                    <li>If you still can&apos;t access your account, contact support.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <section className="pl-support">
            <Headphones className="pl-support-icon" size={53} strokeWidth={1.7} />
            <div>
              <h3>Need Assistance?</h3>
              <p>For login support, please contact us:</p>
            </div>
            <div className="pl-support-details">
              <a className="pl-support-item" href={`mailto:${event.supportEmail}`}>
                <Mail size={22} fill="currentColor" strokeWidth={0} />
                {event.supportEmail}
              </a>
              <a className="pl-support-item" href={`tel:${event.supportPhone}`}>
                <Phone size={22} fill="currentColor" strokeWidth={0} />
                {event.supportPhone}
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
