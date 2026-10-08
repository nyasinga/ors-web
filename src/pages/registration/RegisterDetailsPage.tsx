import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { fees } from "../../data/event";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";

const inclusions = [
  "Access to all plenary and parallel sessions",
  "Conference materials (digital)",
  "Lunch and refreshments",
  "Networking opportunities",
  "Certificate of participation",
];

/** Registration step 2 — structure & CSS from HTML package */
export function RegisterDetailsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const { details, setDetails } = useRegistration();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!details.title) next.title = "Select a title";
    if (!details.fullName.trim()) next.fullName = "Full name is required";
    if (!details.email.trim() || !details.email.includes("@")) next.email = "Valid email is required";
    if (!details.phone.trim()) next.phone = "Phone number is required";
    if (!details.organisation.trim()) next.organisation = "Organisation is required";
    if (!details.jobTitle.trim()) next.jobTitle = "Job title is required";
    if (!details.country) next.country = "Select a country";
    if (!details.city.trim()) next.city = "City is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div className="register-page">
      <RegisterHero current={2} />

      <main className="rg-main">
        <div className="home-container rg-layout">
          <section className="rg-card rg-section">
            <h2>2. Details</h2>
            <p className="rg-subtitle">Please provide your information to register for ISIPPE-3.</p>

            <div className="rg-card rg-form-card">
              <div className="rg-form-title">
                <span className="rg-dot">●</span>
                Personal Information
              </div>
              <div className="rg-form-grid">
                <div className="rg-field">
                  <label>
                    Title <span className="rg-required">*</span>
                  </label>
                  <select
                    value={details.title}
                    onChange={(e) => setDetails({ title: e.target.value })}
                  >
                    <option value="">Select title</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </select>
                  {errors.title ? <span className="rg-field-error">{errors.title}</span> : null}
                </div>
                <div className="rg-field">
                  <label>
                    Full Name <span className="rg-required">*</span>
                  </label>
                  <input
                    value={details.fullName}
                    onChange={(e) => setDetails({ fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName ? (
                    <span className="rg-field-error">{errors.fullName}</span>
                  ) : null}
                </div>
                <div className="rg-field">
                  <label>
                    Email Address <span className="rg-required">*</span>
                  </label>
                  <input
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                  {errors.email ? <span className="rg-field-error">{errors.email}</span> : null}
                </div>
                <div className="rg-field">
                  <label>
                    Phone Number <span className="rg-required">*</span>
                  </label>
                  <div className="rg-phone">
                    <select defaultValue="+254" aria-label="Country code">
                      <option value="+254">🇰🇪 +254</option>
                    </select>
                    <input
                      value={details.phone}
                      onChange={(e) => setDetails({ phone: e.target.value })}
                      placeholder="712 345 678"
                    />
                  </div>
                  {errors.phone ? <span className="rg-field-error">{errors.phone}</span> : null}
                </div>
                <div className="rg-field">
                  <label>
                    Organisation <span className="rg-required">*</span>
                  </label>
                  <input
                    value={details.organisation}
                    onChange={(e) => setDetails({ organisation: e.target.value })}
                    placeholder="Enter your organisation"
                  />
                  {errors.organisation ? (
                    <span className="rg-field-error">{errors.organisation}</span>
                  ) : null}
                </div>
                <div className="rg-field">
                  <label>
                    Job Title <span className="rg-required">*</span>
                  </label>
                  <input
                    value={details.jobTitle}
                    onChange={(e) => setDetails({ jobTitle: e.target.value })}
                    placeholder="Enter your job title"
                  />
                  {errors.jobTitle ? (
                    <span className="rg-field-error">{errors.jobTitle}</span>
                  ) : null}
                </div>
                <div className="rg-field">
                  <label>
                    Country <span className="rg-required">*</span>
                  </label>
                  <select
                    value={details.country}
                    onChange={(e) => setDetails({ country: e.target.value })}
                  >
                    <option value="">Select country</option>
                    <option value="Kenya">Kenya</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.country ? <span className="rg-field-error">{errors.country}</span> : null}
                </div>
                <div className="rg-field">
                  <label>
                    City <span className="rg-required">*</span>
                  </label>
                  <input
                    value={details.city}
                    onChange={(e) => setDetails({ city: e.target.value })}
                    placeholder="Enter your city"
                  />
                  {errors.city ? <span className="rg-field-error">{errors.city}</span> : null}
                </div>
              </div>
            </div>

            <div className="rg-optional">
              <div className="rg-form-title">▣ &nbsp; Additional Information (Optional)</div>
              <div className="rg-optional-grid">
                <div className="rg-field">
                  <label>Dietary Requirements</label>
                  <select
                    value={details.dietary}
                    onChange={(e) => setDetails({ dietary: e.target.value })}
                  >
                    <option value="">Select option</option>
                    <option value="None">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Halal">Halal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="rg-field">
                  <label>Accessibility Needs</label>
                  <select
                    value={details.accessibility}
                    onChange={(e) => setDetails({ accessibility: e.target.value })}
                  >
                    <option value="">Select option</option>
                    <option value="None">None</option>
                    <option value="Mobility">Mobility support</option>
                    <option value="Hearing">Hearing support</option>
                    <option value="Vision">Vision support</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rg-actions">
              <Link className="rg-btn" to="/register">
                ← Back
              </Link>
              <button
                type="button"
                className="rg-btn primary"
                onClick={() => {
                  if (validate()) navigate("/register/payment");
                }}
              >
                Next: Payment{" "}
                <span className="rg-arrow" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </section>

          <aside className="rg-sidebar">
            <div className="rg-side-price">
              <div className="rg-price-label">🏷 Registration Fee</div>
              <div className="rg-period">
                {t(fees.earlyBird.labelKey)} &nbsp; <b>Current Period</b>
              </div>
              <div className="rg-price">{formatMoney(fees.earlyBird.kes, "KES")}</div>
              <div className="rg-price-sub">
                {formatMoney(fees.earlyBird.usd, "USD")} (Approx.)
              </div>
              <div className="rg-period">{t(fees.earlyBird.untilKey)}</div>
            </div>
            <div className="rg-late">
              <b>{t(fees.late.labelKey)}</b>
              <br />
              <span style={{ fontSize: 11, color: "#61708a" }}>{t(fees.late.untilKey)}</span>
              <br />
              <strong>{formatMoney(fees.late.kes, "KES")}</strong>
            </div>
            <div className="rg-info-box">
              <div className="rg-info-title">👥 What&apos;s Included?</div>
              <p>
                {inclusions.map((item) => (
                  <span key={item}>
                    ✓ {item}
                    <br />
                  </span>
                ))}
              </p>
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
