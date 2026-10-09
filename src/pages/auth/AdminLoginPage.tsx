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
import { cn } from "../../lib/cn";
import { pageContainer } from "../../lib/pageContainer";

const features = [
  {
    icon: Users,
    title: "Participant Registration",
    text: "Register as a delegate, speaker or exhibitor",
    iconBg: "bg-[#078047]",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    text: "Pay online in KES or USD via secure channels",
    iconBg: "bg-[#075fe5]",
  },
  {
    icon: Ticket,
    title: "Electronic Tickets",
    text: "Receive QR-coded tickets instantly after registration",
    iconBg: "bg-[#f51f2e]",
  },
  {
    icon: BarChart3,
    title: "Manage & Track",
    text: "Access your profile, payments and confirmations",
    iconBg: "bg-[#14204e]",
  },
] as const;

const inputBase = cn(
  "h-11 w-full rounded-md border border-[#c8d6e9] bg-white py-0 pl-11 pr-11 text-[14px] text-[#172348] outline-none",
  "placeholder:text-[#8a97b3]",
  "focus:border-[#075fe5] focus:shadow-[0_0_0_3px_#075fe51a]",
  "disabled:cursor-not-allowed disabled:opacity-70",
  "max-[600px]:h-10 max-[600px]:pl-10 max-[600px]:text-[13px]",
);

const fieldLabel = cn(
  "mb-1.5 block text-[13px] font-semibold text-[#0b1643]",
  "max-[600px]:text-[12px]",
);

/** Admin login — modest two-column hero + sign-in card */
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
    <div className="bg-white text-[#0b1643]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* Skyline only on the right — avoids baked-in copy from the old composite asset */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[min(52%,640px)]",
            "bg-[url('/assets/login-hero-skyline.jpg')] bg-cover bg-[center_30%] bg-no-repeat",
            "min-[901px]:block",
          )}
          aria-hidden
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[1] hidden",
            "bg-[linear-gradient(90deg,#fff_0%,#fff_46%,rgba(255,255,255,.92)_54%,rgba(255,255,255,.45)_64%,transparent_76%)]",
            "min-[901px]:block",
          )}
          aria-hidden
        />
        {/* Mobile/tablet photo band */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[220px]",
            "bg-[linear-gradient(180deg,rgba(255,255,255,.2)_0%,rgba(255,255,255,.75)_55%,#fff_100%),url('/assets/login-hero-skyline.jpg')_center_28%/cover_no-repeat]",
            "max-[900px]:block",
          )}
          aria-hidden
        />

        <div
          className={cn(
            pageContainer,
            "relative z-[2] grid items-start gap-10 py-12",
            "min-[901px]:grid-cols-[minmax(0,1.15fr)_minmax(340px,400px)] min-[901px]:gap-12 min-[901px]:py-14",
            "max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:pb-10 max-[900px]:pt-8",
            "max-[600px]:gap-6 max-[600px]:py-7",
          )}
        >
          {/* Left copy */}
          <div className="min-w-0 max-[900px]:pt-16">
            <div
              className="mb-4 flex h-1.5 w-[112px] max-[600px]:mb-3 max-[600px]:h-1 max-[600px]:w-[72px]"
              aria-hidden
            >
              <i className="block h-full w-1/2 bg-[#ed1c24]" />
              <i className="block h-full w-1/2 bg-[#078047]" />
            </div>

            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#50638b] max-[600px]:mb-2 max-[600px]:text-[10px] max-[600px]:tracking-[0.18em]">
              3rd International Symposium on
            </p>

            <h1
              className={cn(
                "m-0 max-w-[34rem] text-[clamp(2rem,4.2vw,3.15rem)] font-black leading-[1.05] tracking-[-0.04em] text-[#080f38]",
                "max-[600px]:max-w-none",
              )}
            >
              Intellectual Property Protection and Enforcement
            </h1>

            <p className="mt-4 max-w-[32rem] text-[17px] leading-[1.45] text-[#3a4668] max-[600px]:mt-3 max-[600px]:text-[15px]">
              Strengthening Intellectual Property Protection across Africa and Beyond
            </p>

            <div
              className={cn(
                "mt-6 flex flex-wrap items-center gap-x-5 gap-y-3",
                "max-[600px]:mt-5 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-2.5",
              )}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-7 w-7 shrink-0 text-[#075fe5]" size={28} strokeWidth={1.8} />
                <strong className="text-[14px] font-semibold text-[#0b1643] max-[600px]:text-[13px]">
                  {event.dates}
                </strong>
              </div>
              <div className="hidden h-9 w-px bg-[#c9d4e4] sm:block" aria-hidden />
              <div className="flex items-center gap-2.5">
                <MapPin
                  className="h-7 w-7 shrink-0 text-[#075fe5]"
                  size={28}
                  strokeWidth={0}
                  fill="currentColor"
                />
                <div className="text-[14px] leading-[1.35] text-[#0b1643] max-[600px]:text-[13px]">
                  <strong className="block font-semibold">{event.city}</strong>
                  <span className="text-[12px] font-normal text-[#58698b]">{event.venue}</span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "mt-7 flex flex-wrap gap-3",
                "max-[600px]:mt-5 max-[600px]:grid max-[600px]:grid-cols-1",
              )}
            >
              <Link
                className={cn(
                  "inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-lg bg-[#075fe5] px-6 text-[14px] font-bold text-white no-underline",
                  "hover:bg-[#0550c9]",
                  "max-[600px]:min-w-0 max-[600px]:w-full",
                )}
                to="/register"
              >
                {t("actions.registerNow")}
                <span className="text-[20px] font-normal leading-none" aria-hidden>
                  →
                </span>
              </Link>
              <Link
                className={cn(
                  "inline-flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-lg border border-[#075fe5] bg-white px-6 text-[14px] font-bold text-[#075fe5] no-underline",
                  "hover:bg-[#f3f8ff]",
                  "max-[600px]:min-w-0 max-[600px]:w-full",
                )}
                to="/programme"
              >
                {t("actions.viewProgramme")}
              </Link>
            </div>
          </div>

          {/* Sign-in card */}
          <aside
            className={cn(
              "w-full rounded-xl border border-[#dfe7f0] bg-white/95 p-7 shadow-[0_12px_40px_rgba(17,58,102,0.10)] backdrop-blur-[2px]",
              "max-[900px]:mx-auto max-[900px]:max-w-[440px]",
              "max-[600px]:p-5",
            )}
          >
            <h2 className="m-0 text-[26px] font-black tracking-[-0.03em] text-[#0b1643] max-[600px]:text-[22px]">
              Sign In
            </h2>
            <p className="mt-2 mb-6 text-[14px] leading-[1.45] text-[#596a8e] max-[600px]:mb-5 max-[600px]:text-[13px]">
              Access your account to manage registrations, profile and tickets.
            </p>

            <form onSubmit={submit} noValidate className="space-y-4">
              {formError ? (
                <div
                  className="rounded-md border border-[#f7c4c8] bg-[#fff1f2] px-3 py-2.5 text-[12px] leading-[1.4] text-[#b3121a]"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

              <div>
                <label className={fieldLabel} htmlFor="admin-email">
                  Email Address
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52668d]"
                    aria-hidden
                  >
                    <Mail size={18} strokeWidth={1.8} />
                  </span>
                  <input
                    className={inputBase}
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
                  <span className="mt-1 block text-[11px] text-[#ed1c24]" role="alert">
                    {errors.email}
                  </span>
                ) : null}
              </div>

              <div>
                <label className={fieldLabel} htmlFor="admin-password">
                  Password
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52668d]"
                    aria-hidden
                  >
                    <Lock size={18} strokeWidth={1.8} />
                  </span>
                  <input
                    className={inputBase}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent p-0.5 text-[#52668d] disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <span className="mt-1 block text-[11px] text-[#ed1c24]" role="alert">
                    {errors.password}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5 text-[13px] text-[#52668d] max-[600px]:text-[12px]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    className="m-0 h-4 w-4 accent-[#075fe5]"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={submitting}
                  />
                  Remember me
                </label>
                <button
                  className="cursor-pointer bg-transparent p-0 text-[#075fe5] [font:inherit] hover:underline disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={submitting}
                >
                  Forgot password?
                </button>
              </div>

              <button
                className="mt-1 h-11 w-full cursor-pointer rounded-lg bg-[#075fe5] text-[15px] font-bold text-white hover:bg-[#0550c9] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[12px] text-[#61708e] before:h-px before:flex-1 before:bg-[#dce4ef] before:content-[''] after:h-px after:flex-1 after:bg-[#dce4ef] after:content-['']">
              or
            </div>

            <button
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[#9dafc9] bg-white text-[14px] font-semibold text-[#101a40] hover:bg-[#f7faff] max-[600px]:text-[13px]"
              type="button"
            >
              <span className="text-[18px] font-black leading-none" aria-hidden>
                G
              </span>
              Continue with Google
            </button>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-[#edf6ff] px-4 py-3.5 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-2.5">
              <div className="min-w-0">
                <strong className="block text-[13px] text-[#10205e]">Signing in as a participant?</strong>
                <p className="mt-1 text-[12px] leading-[1.4] text-[#52678b]">
                  Use your registration account for tickets and details.
                </p>
              </div>
              <Link
                className="shrink-0 whitespace-nowrap text-[13px] font-bold text-[#075fe5] no-underline hover:underline"
                to="/participant-login"
              >
                Participant login →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#e0e7ef] bg-white">
        <div
          className={cn(
            pageContainer,
            "grid grid-cols-4",
            "max-[900px]:grid-cols-2",
            "max-[640px]:grid-cols-1",
          )}
        >
          {features.map((item, i) => (
            <div
              key={item.title}
              className={cn(
                "flex min-h-[96px] items-center gap-3.5 px-5 py-5",
                i < features.length - 1 && "border-r border-[#dfe6ee]",
                "max-[900px]:min-h-[88px] max-[900px]:border-b max-[900px]:[&:nth-child(2)]:border-r-0 max-[900px]:[&:nth-child(n+3)]:border-b-0",
                "max-[640px]:min-h-0 max-[640px]:border-r-0 max-[640px]:border-b max-[640px]:px-0 max-[640px]:last:border-b-0",
              )}
            >
              <div
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-full text-white",
                  "max-[600px]:h-10 max-[600px]:w-10",
                  item.iconBg,
                )}
              >
                <item.icon className="h-5 w-5" size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="m-0 text-[14px] font-extrabold text-[#0b1643] max-[600px]:text-[13px]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[12px] leading-[1.4] text-[#596a8b] max-[600px]:text-[11px]">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logos / meta strip */}
      <section className="bg-white py-7 max-[600px]:py-5">
        <div className={pageContainer}>
          <div
            className={cn(
              "grid grid-cols-[1.4fr_1fr_1.2fr] items-center gap-8",
              "max-[900px]:grid-cols-2 max-[900px]:gap-5",
              "max-[600px]:grid-cols-1 max-[600px]:gap-4",
            )}
          >
            <div
              className="h-16 [background:url('/assets/footer-logos.png')_left_center/contain_no-repeat] max-[600px]:h-14"
              role="img"
              aria-label={t("brand.logoAlt")}
            />
            <div className="flex items-center gap-3 border-l border-[#d9e1eb] pl-6 max-[600px]:border-l-0 max-[600px]:border-t max-[600px]:pl-0 max-[600px]:pt-4">
              <CalendarDays className="h-6 w-6 shrink-0 text-[#0c1747]" size={24} strokeWidth={1.8} />
              <span className="text-[13px] leading-[1.4] text-[#111b3f]">{event.dates}</span>
            </div>
            <div className="flex items-center gap-3 border-l border-[#d9e1eb] pl-6 max-[900px]:col-span-2 max-[600px]:col-span-1 max-[600px]:border-l-0 max-[600px]:border-t max-[600px]:pl-0 max-[600px]:pt-4">
              <MapPin
                className="h-6 w-6 shrink-0 text-[#0c1747]"
                size={24}
                strokeWidth={0}
                fill="currentColor"
              />
              <span className="text-[13px] leading-[1.4] text-[#111b3f]">
                {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
