import { Link, useNavigate } from "react-router-dom";
import { Handshake, Mic2, Monitor, Users } from "lucide-react";
import { PrivacyBar, RegisterHero } from "../../components/registration/RegisterChrome";
import { useRegistration } from "../../contexts/RegistrationContext";
import { participationTypes, type ParticipationType } from "../../data/registration";

const icons = {
  delegate: Users,
  speaker: Mic2,
  sponsor: Handshake,
  virtual: Monitor,
} as const;

const iconColor = {
  delegate: "#075fe5",
  speaker: "#ed1c24",
  sponsor: "#078047",
  virtual: "#10216d",
} as const;

const includedLabel: Record<ParticipationType, string> = {
  delegate: "Delegates",
  speaker: "Speakers",
  sponsor: "Sponsors / Exhibitors",
  virtual: "Virtual Participants",
};

/** Registration step 1 — structure & CSS from HTML package */
export function RegisterParticipationPage() {
  const navigate = useNavigate();
  const { participationType, setParticipationType } = useRegistration();
  const selected = participationTypes.find((t) => t.id === participationType)!;
  const SelectedIcon = icons[selected.id];

  return (
    <div className="register-page">
      <RegisterHero current={1} />

      <main className="rg-main">
        <div className="home-container rg-layout">
          <section className="rg-card rg-section">
            <h2>1. Participation</h2>
            <p className="rg-subtitle">Select how you will participate in ISIPPE-3.</p>

            <div className="rg-option-grid">
              {participationTypes.map((type) => {
                const Icon = icons[type.id];
                const active = participationType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={`rg-option${active ? " selected" : ""}`}
                    onClick={() => setParticipationType(type.id)}
                  >
                    <span className="rg-check" aria-hidden>
                      ✓
                    </span>
                    <div className="rg-option-icon" style={{ color: iconColor[type.id] }}>
                      <Icon size={55} strokeWidth={1.7} />
                    </div>
                    <div>
                      <h3>{type.title}</h3>
                      <p>{type.description}</p>
                    </div>
                    <span className="rg-radio" aria-hidden />
                  </button>
                );
              })}
            </div>

            <div className="rg-included">
              <div className="rg-included-icon">
                <SelectedIcon size={54} strokeWidth={1.7} />
              </div>
              <div>
                <h3>{`What's included for ${includedLabel[selected.id]}?`}</h3>
                <div className="rg-include-grid">
                  {selected.includes.map((item) => (
                    <span key={item} className="rg-include">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rg-actions">
              <Link className="rg-btn" to="/">
                ← Back to Home
              </Link>
              <button
                type="button"
                className="rg-btn primary"
                onClick={() => navigate("/register/details")}
              >
                Next: Personal Details{" "}
                <span className="rg-arrow" aria-hidden>
                  →
                </span>
              </button>
            </div>
          </section>

          <aside className="rg-sidebar">
            <div className="rg-info-box">
              <div className="rg-info-title">
                <span className="rg-info-icon">i</span>
                Registration Information
              </div>
              <p>
                Please select the option that best describes how you will participate. You can update
                your selection before the payment step.
              </p>
            </div>
            <div className="rg-categories">
              <h3>Participation Categories</h3>
              {participationTypes.map((type) => {
                const Icon = icons[type.id];
                return (
                  <div key={type.id} className="rg-cat">
                    <div className="rg-cat-icon" style={{ color: iconColor[type.id] }}>
                      <Icon size={38} strokeWidth={1.7} />
                    </div>
                    <div>
                      <strong>{type.title}</strong>
                      <p>{type.categoryBlurb}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      <PrivacyBar />
    </div>
  );
}
