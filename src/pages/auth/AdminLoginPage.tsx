import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { useEventCopy } from "../../i18n/useEventCopy";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../lib/api";
import { login, saveAuthSession } from "../../lib/auth";

const features = [
  {
    icon: Users,
    title: "Participant Registration",
    text: "Register as a delegate, speaker or exhibitor",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    text: "Pay online in KES or USD via secure channels",
  },
  {
    icon: Ticket,
    title: "Electronic Tickets",
    text: "Receive QR-coded tickets instantly after registration",
  },
  {
    icon: BarChart3,
    title: "Manage & Track",
    text: "Access your profile, payments and confirmations",
  },
] as const;

/** Admin login — structure & CSS from HTML package */
export function AdminLoginPage() {
  const { t } = useTranslation("common");
  const event = useEventCopy();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.includes("@")) next.email = "Enter a valid email address";
    if (password.length < 5) next.password = "Password must be at least 5 characters";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const session = await login({ email, password });
      if (!session.token) throw new Error("Login succeeded but no token was returned.");
      const { token, ...user } = session;
      saveAuthSession(user, token, remember);
      navigate("/admin");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to sign in. Please try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="lg-hero">
        <div className="lg-hero-bg" aria-hidden />
        <div className="home-container lg-hero-inner">
          <div className="lg-hero-copy">
            <div className="lg-redline" aria-hidden />
            <div className="lg-eyebrow">3rd International Symposium on</div>
            <h1 className="lg-hero-title">
              Intellectual Property
              <br />
              Protection and
              <br />
              Enforcement
            </h1>
            <p>
              Strengthening Intellectual Property Protection
              <br className="hidden md:inline" /> across Africa and Beyond
            </p>
            <div className="lg-event-row">
              <div className="lg-event">
                <div className="lg-event-icon">
                  <CalendarDays size={39} strokeWidth={2} />
                </div>
                <strong>{event.dates}</strong>
              </div>
              <div className="lg-event-divider" aria-hidden />
              <div className="lg-event">
                <div className="lg-event-icon">
                  <MapPin size={39} strokeWidth={0} fill="currentColor" />
                </div>
                <strong>
                  {event.city}
                  <br />
                  <small>{event.venue}</small>
                </strong>
              </div>
            </div>
            <div className="lg-hero-buttons">
              <Link className="lg-btn primary" to="/register">
                {t("actions.registerNow")} &nbsp;{" "}
                <span className="lg-arrow" aria-hidden>
                  →
                </span>
              </Link>
              <Link className="lg-btn" to="/programme">
                ▣ &nbsp; {t("actions.viewProgramme")}
              </Link>
            </div>
          </div>

          <aside className="lg-login-panel">
            <h2>Sign In</h2>
            <p className="lg-intro">
              Access your account to manage your registration,
              <br />
              view your profile and tickets.
            </p>
            <form onSubmit={submit} noValidate>
              {formError ? (
                <div className="lg-form-error" role="alert">
                  {formError}
                </div>
              ) : null}
              <div className="lg-field">
                <label htmlFor="admin-email">Email Address</label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon" aria-hidden>
                    <Mail size={20} strokeWidth={1.8} />
                  </span>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="Enter your email address"
                    autoComplete="username"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.email) || undefined}
                  />
                </div>
                {errors.email ? (
                  <span className="lg-field-error" role="alert">
                    {errors.email}
                  </span>
                ) : null}
              </div>
              <div className="lg-field">
                <label htmlFor="admin-password">Password</label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon" aria-hidden>
                    <Lock size={20} strokeWidth={1.8} />
                  </span>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.password) || undefined}
                  />
                  <button
                    className="lg-eye"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff size={20} strokeWidth={1.8} /> : <Eye size={20} strokeWidth={1.8} />}
                  </button>
                </div>
                {errors.password ? (
                  <span className="lg-field-error" role="alert">
                    {errors.password}
                  </span>
                ) : null}
              </div>
              <div className="lg-login-options">
                <label className="lg-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={submitting}
                  />
                  Remember me
                </label>
                <button className="lg-forgot" type="button" disabled={submitting}>
                  Forgot password?
                </button>
              </div>
              <button className="lg-signin" type="submit" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>
            <div className="lg-or">or</div>
            <button className="lg-google" type="button">
              <span className="lg-google-icon" aria-hidden>
                G
              </span>
              Continue with Google
            </button>
            <div className="lg-participant">
              <div>
                <strong>Signing in as a participant?</strong>
                <p>Use your registration account to access your tickets and manage your details.</p>
              </div>
              <Link to="/participant-login">
                Login as
                <br />
                Participant <span className="lg-p-arrow">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="lg-features">
        <div className="home-container lg-feature-grid">
          {features.map((item) => (
            <div key={item.title} className="lg-feature">
              <div className="lg-feature-icon">
                <item.icon size={32} strokeWidth={2} />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lg-identity">
        <div className="home-container">
          <div className="lg-identity-line" />
          <div className="lg-identity-content">
            <div className="lg-identity-logos" role="img" aria-label={t("brand.logoAlt")} />
            <div className="lg-identity-item">
              <CalendarDays size={30} strokeWidth={2} />
              <span>{event.dates}</span>
            </div>
            <div className="lg-identity-item">
              <MapPin size={30} strokeWidth={0} fill="currentColor" />
              <span>
                Kenyatta International
                <br />
                Convention Centre (KICC)
                <br />
                Nairobi, Kenya
              </span>
            </div>
            <div className="lg-cityline" aria-hidden />
          </div>
        </div>
      </section>
    </div>
  );
}
