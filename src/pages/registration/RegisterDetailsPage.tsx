import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { IMAGE_KEY, IMAGE_PERSIST_KEY } from "../../contexts/registrationShared";
import { useRegistration } from "../../hooks/useRegistration";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { useToast } from "../../components/ui/Toast";
import { COUNTRY_NAME_OPTIONS } from "../../data/countries";
import { participationTypes } from "../../data/registration";
import { formatMoney } from "../../i18n/format";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import { createRegistrationInvoice } from "../../lib/pesaflow";
import { engagementToPublicSponsors } from "../../lib/publicEvent";
import { usePublicEngagement } from "../../hooks/usePublicEngagement";
import * as r from "../../components/registration/registerStyles";
import ImagePicker from "../../components/ui/ImagePicker";
import { languages } from "../../components/i18n/LanguageButton";

const defaultInclusions = [
  "Access to all plenary and parallel sessions",
  "Conference materials (digital)",
  "Lunch and refreshments",
  "Networking opportunities",
  "Certificate of participation",
];

/** Registration step 2 — structure & CSS from HTML package */
export function RegisterDetailsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const event = useEventCopy();
  const { engagement } = usePublicEngagement();
  const [submitting, setSubmitting] = useState(false);

  const {
    files,
    setFiles,
    profilePicturePreview,
    setProfilePicturePreview,
    details,
    setDetails,
    earlyBird,
    late,
    selectedSponsorPackage,
    selectSponsorPackage,
    sponsorEntrySource,
    participationType,
    feeKes,
    reference,
    setInvoice,
    setPaymentPhase,
  } = useRegistration();

  const engagementID = engagement?.engagementID ? String(engagement.engagementID) : null;
  const isSponsor = participationType === "sponsor" || Boolean(selectedSponsorPackage);

  const backTo =
    sponsorEntrySource === "sponsorship"
      ? "/sponsorship"
      : sponsorEntrySource === "register"
        ? "/sponsorship"
        : "/register";
  const [errors, setErrors] = useState<Record<string, string>>({});

  const packages = useMemo(() => engagementToPublicSponsors(engagement), [engagement]);

  useEffect(() => {
    const type = searchParams.get("type");
    const packageId = searchParams.get("package");
    if (type !== "sponsor" || !packageId || !packages.length) return;
    const pkg = packages.find((p) => p.id === packageId || p.tierKey === packageId);
    if (pkg) selectSponsorPackage(pkg, "sponsorship");
    const next = new URLSearchParams(searchParams);
    next.delete("type");
    next.delete("package");
    setSearchParams(next, { replace: true });
  }, [packages, searchParams, selectSponsorPackage, setSearchParams]);

  const inclusions =
    selectedSponsorPackage?.benefits?.length
      ? selectedSponsorPackage.benefits
      : participationTypes.find((t) => t.id === participationType)?.includes ||
        defaultInclusions;

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

  const amountKes =
    selectedSponsorPackage && selectedSponsorPackage.kes > 0
      ? selectedSponsorPackage.kes
      : feeKes;

  const submitDetailsAndCreateInvoice = async () => {
    if (!validate()) return;
    if (!amountKes || amountKes <= 0) {
      toast.error("Registration fee is not available yet. Please try again later.");
      return;
    }
    if (isSponsor && !selectedSponsorPackage?.id) {
      toast.error("Select a sponsorship package before continuing.");
      return;
    }

    setSubmitting(true);
    toast.info("Creating your invoice…");
    try {
      const invoice = await createRegistrationInvoice(
        {
          title: details.title,
          fullName: details.fullName.trim(),
          email: details.email.trim(),
          phoneNo: details.phone.trim(),
          country: details.country,
          city: details.city.trim(),
          userType: isSponsor ? "sponsor" : participationType,
          extraData: {
            language: details.language,
            otherLanguage: details.otherLanguage,
            dietary: details.dietary,
            accessibility: details.accessibility,
            jobTitle: details.jobTitle.trim(),
            organisation: details.organisation.trim(),
            engagementID,
            sponsorPackage: isSponsor && selectedSponsorPackage
              ? {
                  id: selectedSponsorPackage.id,
                  name: selectedSponsorPackage.name,
                  amount: amountKes,
                  price: amountKes,
                }
              : {},
            ticket: {
              amount: amountKes,
              currency: "KES",
            },
          },
        },
        files,
        reference,
      );

      const ticket = invoice.ticket || {};
      setInvoice({
        url: invoice.url,
        reference: invoice.reference,
        amount: invoice.amount ?? amountKes,
        currency: invoice.currency || "KES",
        ticketID: invoice.ticketID,
        token: invoice.token,
        isBlobUrl: invoice.isBlobUrl,
      });
      setDetails({
        reference: invoice.reference,
        passCode: ticket.passCode ? String(ticket.passCode) : details.passCode,
        status: ticket.status ? String(ticket.status) : details.status,
        engagementID: ticket.engagementID
          ? String(ticket.engagementID)
          : engagementID || details.engagementID,
      });
      setPaymentPhase("invoice");
      toast.success("Invoice ready — you can download it on the next step.");
      navigate("/register/payment");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create invoice. Please try again.",
        6000,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={r.registerPage}>
      <RegisterHero current={2} />

      <main className={r.main}>
        <div className={cn(r.container, r.layout)}>
          <section className={cn(r.card, r.section)}>
            <h2 className={r.sectionTitle}>2. Details</h2>
            <p className={r.subtitle}>Please provide your information to register for {event.name}.</p>

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
                    className={r.fieldSelect}
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
                    <select className={r.fieldSelect} defaultValue="+254" aria-label="Country code">
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
                  <SearchableSelect
                    compact
                    aria-label="Country"
                    value={details.country}
                    onChange={(country) => setDetails({ country })}
                    placeholder="Select country"
                    searchPlaceholder="Search countries…"
                    options={COUNTRY_NAME_OPTIONS.map((name) => ({
                      value: name,
                      label: name,
                    }))}
                  />
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
                <div>
                  <label className={r.fieldLabel}>
                    Preferred Language
                  </label>
                  <SearchableSelect
                    compact
                    aria-label="Preferred Language"
                    value={details.language || ""}
                    onChange={(language) => {
                      setDetails({
                        language,
                        ...(language !== "other" ? { otherLanguage: "" } : {}),
                      });
                    }}
                    placeholder="Select preferred language"
                    searchPlaceholder="Search languages..."
                    options={languages.map((language) => ({
                      value: language.code,
                      label: `${language.flag} ${language.label}`,
                    }))}
                  />
                  {details.language === "other" && (
                    <input
                      className={`${r.fieldControl} mt-2`}
                      value={details.otherLanguage || ""}
                      onChange={(e) =>
                        setDetails({ otherLanguage: e.target.value })
                      }
                      placeholder="Specify your preferred language"
                    />
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4">
                <label className={r.fieldLabel}>
                  { sponsorEntrySource === "sponsorship"? 'Organization Logo' : 'Profile Picture'} 
                  <span className="text-gray-400">(Optional)</span>
                </label>

                <p className="mb-3 text-xs text-[#60708b]">
                  Choose a picture and crop it before saving. The file will be uploaded
                  later with your registration.
                </p>

                <ImagePicker
                  imageKey={IMAGE_KEY}
                  value={profilePicturePreview}
                  onChange={(file) => {
                    if (!file) {
                      setFiles((prev) => prev.filter((f) => f.name !== IMAGE_KEY));
                      setProfilePicturePreview("");
                      localStorage.removeItem(IMAGE_PERSIST_KEY);
                      return;
                    }

                    const renamedFile = new File([file], IMAGE_KEY, {
                      type: file.type,
                      lastModified: file.lastModified,
                    });

                    // Update the preview immediately using the new file.
                    const previewUrl = URL.createObjectURL(renamedFile);
                    setProfilePicturePreview(previewUrl);

                    setFiles((prev) => [
                      ...prev.filter((f) => f.name !== IMAGE_KEY),
                      renamedFile,
                    ]);
                  }}
                />
                
              </div>
            </div>

            <div className={r.optional}>
              <div className={r.formTitle}>▣ &nbsp; Additional Information (Optional)</div>
              <div className={r.optionalGrid}>
                <div>
                  <label className={r.fieldLabel}>Dietary Requirements</label>
                  <select
                    className={r.fieldSelect}
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
                    className={r.fieldSelect}
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
              <Link className={r.btn} to={backTo}>
                ← Back
              </Link>
              <button
                type="button"
                className={r.btnPrimary}
                disabled={submitting}
                onClick={() => {
                  void submitDetailsAndCreateInvoice();
                }}
              >
                {submitting ? "Creating invoice…" : "Next: Payment"}{" "}
                {!submitting ? (
                  <span className={r.arrow} aria-hidden>
                    →
                  </span>
                ) : null}
              </button>
            </div>
          </section>

          <aside className={r.sidebar}>
            {selectedSponsorPackage ? (
              <>
                <div className={r.sidePrice}>
                  <div className={r.priceLabel}>🏷 Selected Package</div>
                  <div className={r.period}>
                    {selectedSponsorPackage.name} &nbsp; <b>Sponsorship</b>
                  </div>
                  <div className={r.price}>
                    {selectedSponsorPackage.kes > 0
                      ? formatMoney(selectedSponsorPackage.kes, "KES")
                      : selectedSponsorPackage.price}
                  </div>
                  {selectedSponsorPackage.usd > 0 ? (
                    <div className={r.priceSub}>
                      {formatMoney(selectedSponsorPackage.usd, "USD")} (Approx.)
                    </div>
                  ) : null}
                  <div className={r.period}>{selectedSponsorPackage.description}</div>
                </div>
              </>
            ) : (
              <>
                <div className={r.sidePrice}>
                  <div className={r.priceLabel}>🏷 Registration Fee</div>
                  <div className={r.period}>
                    {earlyBird.label} &nbsp; <b>Current Period</b>
                  </div>
                  <div className={r.price}>{formatMoney(earlyBird.kes, "KES")}</div>
                  <div className={r.priceSub}>
                    {formatMoney(earlyBird.usd, "USD")} (Approx.)
                  </div>
                  <div className={r.period}>{earlyBird.until}</div>
                </div>
                <div className={r.late}>
                  <b>{late.label}</b>
                  <br />
                  <span className="text-[11px] text-[#61708a]">{late.until}</span>
                  <br />
                  <strong>{formatMoney(late.kes, "KES")}</strong>
                </div>
              </>
            )}
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
