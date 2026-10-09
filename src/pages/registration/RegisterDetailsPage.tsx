import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { fees } from "../../data/event";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import * as r from "../../components/registration/registerStyles";

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
    <div className={r.registerPage}>
      <RegisterHero current={2} />

      <main className={r.main}>
        <div className={cn(r.container, r.layout)}>
          <section className={cn(r.card, r.section)}>
            <h2 className={r.sectionTitle}>2. Details</h2>
            <p className={r.subtitle}>Please provide your information to register for ISIPPE-3.</p>

            <div className={r.formCard}>
              <div className={r.formTitle}>
                <span className={r.formDot}>●</span>
                Personal Information
              </div>
              <div className={r.formGrid}>
                <div>
                  <label className={r.fieldLabel}>
                    Title <span className={r.required}>*</span>
                  </label>
                  <select
                    className={r.fieldControl}
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
                  {errors.title ? <span className={r.fieldError}>{errors.title}</span> : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    Full Name <span className={r.required}>*</span>
                  </label>
                  <input
                    className={r.fieldControl}
                    value={details.fullName}
                    onChange={(e) => setDetails({ fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName ? (
                    <span className={r.fieldError}>{errors.fullName}</span>
                  ) : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    Email Address <span className={r.required}>*</span>
                  </label>
                  <input
                    className={r.fieldControl}
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                  {errors.email ? <span className={r.fieldError}>{errors.email}</span> : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    Phone Number <span className={r.required}>*</span>
                  </label>
                  <div className={r.phone}>
                    <select className={r.fieldControl} defaultValue="+254" aria-label="Country code">
                      <option value="+254">🇰🇪 +254</option>
                    </select>
                    <input
                    className={r.fieldControl}
                      value={details.phone}
                      onChange={(e) => setDetails({ phone: e.target.value })}
                      placeholder="712 345 678"
                    />
                  </div>
                  {errors.phone ? <span className={r.fieldError}>{errors.phone}</span> : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    Organisation <span className={r.required}>*</span>
                  </label>
                  <input
                    className={r.fieldControl}
                    value={details.organisation}
                    onChange={(e) => setDetails({ organisation: e.target.value })}
                    placeholder="Enter your organisation"
                  />
                  {errors.organisation ? (
                    <span className={r.fieldError}>{errors.organisation}</span>
                  ) : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    Job Title <span className={r.required}>*</span>
                  </label>
                  <input
                    className={r.fieldControl}
                    value={details.jobTitle}
                    onChange={(e) => setDetails({ jobTitle: e.target.value })}
                    placeholder="Enter your job title"
                  />
                  {errors.jobTitle ? (
                    <span className={r.fieldError}>{errors.jobTitle}</span>
                  ) : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    Country <span className={r.required}>*</span>
                  </label>
                  <select
                    className={r.fieldControl}
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
                  {errors.country ? <span className={r.fieldError}>{errors.country}</span> : null}
                </div>
                <div>
                  <label className={r.fieldLabel}>
                    City <span className={r.required}>*</span>
                  </label>
                  <input
                    className={r.fieldControl}
                    value={details.city}
                    onChange={(e) => setDetails({ city: e.target.value })}
                    placeholder="Enter your city"
                  />
                  {errors.city ? <span className={r.fieldError}>{errors.city}</span> : null}
                </div>
              </div>
            </div>

            <div className={r.optional}>
              <div className={r.formTitle}>▣ &nbsp; Additional Information (Optional)</div>
              <div className={r.optionalGrid}>
                <div>
                  <label className={r.fieldLabel}>Dietary Requirements</label>
                  <select
                    className={r.fieldControl}
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
                <div>
                  <label className={r.fieldLabel}>Accessibility Needs</label>
                  <select
                    className={r.fieldControl}
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

            <div className={r.actions}>
              <Link className={r.btn} to="/register">
                ← Back
              </Link>
              <button
                type="button"
                className={r.btnPrimary}
                onClick={() => {
                  if (validate()) navigate("/register/payment");
                }}
              >
                Next: Payment{" "}
                <span className={r.arrow} aria-hidden>
                  →
                </span>
              </button>
            </div>
          </section>

          <aside className={r.sidebar}>
            <div className={r.sidePrice}>
              <div className={r.priceLabel}>🏷 Registration Fee</div>
              <div className={r.period}>
                {t(fees.earlyBird.labelKey)} &nbsp; <b>Current Period</b>
              </div>
              <div className={r.price}>{formatMoney(fees.earlyBird.kes, "KES")}</div>
              <div className={r.priceSub}>
                {formatMoney(fees.earlyBird.usd, "USD")} (Approx.)
              </div>
              <div className={r.period}>{t(fees.earlyBird.untilKey)}</div>
            </div>
            <div className={r.late}>
              <b>{t(fees.late.labelKey)}</b>
              <br />
              <span className="text-[11px] text-[#61708a]">{t(fees.late.untilKey)}</span>
              <br />
              <strong>{formatMoney(fees.late.kes, "KES")}</strong>
            </div>
            <div className={r.infoBox}>
              <div className={r.infoTitle}>👥 What&apos;s Included?</div>
              <p className={r.infoText}>
                {inclusions.map((item) => (
                  <span key={item}>
                    ✓ {item}
                    <br />
                  </span>
                ))}
              </p>
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
