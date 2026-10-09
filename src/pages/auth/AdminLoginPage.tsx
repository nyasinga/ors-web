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

/* ── Shared Tailwind class groups (values ported 1:1 from the former login.css) ── */

/** Hero background: white fade over the skyline photo; re-composed on tablet / phone. */
const heroBg = cn(
  "absolute inset-0",
  "[background:linear-gradient(90deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.98)_32%,rgba(255,255,255,0.76)_49%,rgba(255,255,255,0)_68%),url('/assets/login-hero.jpg')_center/cover_no-repeat]",
  "min-[1600px]:left-[max(0px,calc(50%_-_720px))] min-[1600px]:right-[max(0px,calc(50%_-_720px))]",
  "max-[900px]:[background:linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.88)_52%,rgba(255,255,255,0.1)_100%),url('/assets/login-hero.jpg')_center/cover_no-repeat]",
  "max-[600px]:[background:linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.94)_44%,rgba(255,255,255,0.22)_100%),url('/assets/login-hero.jpg')_center/auto_75%_no-repeat]",
);

const heroBtn = cn(
  "inline-flex h-[54px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-[#075fe5] px-[35px] text-[16px] font-bold no-underline",
  "max-[600px]:h-[46px] max-[600px]:px-[10px] max-[600px]:text-[12px]",
);

const eventIcon = cn(
  "block h-[39px] w-[39px]",
  "max-[600px]:h-[29px] max-[600px]:w-[29px]",
);

const inputBase = cn(
  "h-[47px] w-full rounded-[6px] border border-[#c8d6e9] bg-white py-0 pl-[50px] pr-[45px] text-[14px] text-[#172348] [outline:none]",
  "focus:border-[#075fe5] focus:shadow-[0_0_0_3px_#075fe51a]",
  "disabled:cursor-not-allowed disabled:opacity-70",
  "max-[600px]:h-[43px] max-[600px]:pl-[43px] max-[600px]:text-[12px]",
);

const fieldLabel = cn(
  "mb-[7px] block text-[13px] font-semibold text-[#0b1643]",
  "max-[600px]:text-[11px]",
);

const fieldWrap = "mb-5 max-[600px]:mb-[14px]";

/** Admin login — Tailwind port of the former login.css (lg-* / login-page) */
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
      <section className="relative min-h-[566px] overflow-hidden bg-white max-[900px]:min-h-[auto]">
        <div className={heroBg} aria-hidden />
        <div
          className={cn(
            cn(pageContainer, "relative z-[1] flex min-h-[566px] items-start"),
            "max-[900px]:block max-[900px]:min-h-[auto] max-[900px]:pb-[25px]",
          )}
        >
          <div
            className={cn(
              "w-[calc(100%_-_430px)] pt-[68px]",
              "max-[1180px]:w-[55%]",
              "max-[900px]:w-full max-[900px]:pt-[35px]",
              "max-[600px]:pt-[27px]",
            )}
          >
            <div
              className="mb-5 h-[6px] w-[135px] max-[600px]:mb-[13px] max-[600px]:h-[4px] max-[600px]:w-[80px]"
              style={{ background: "linear-gradient(90deg, #ed1c24 50%, #078047 50%)" }}
              aria-hidden
            />
            <div className="mb-[15px] text-[13px] uppercase tracking-[5px] text-[#50638b] max-[600px]:mb-[10px] max-[600px]:text-[9px] max-[600px]:tracking-[3px]">
              3rd International Symposium on
            </div>
            <h1
              className={cn(
                "mb-4 max-w-[600px] text-[56px] font-black leading-[0.96] tracking-[-2.6px] text-[#080f38]",
                "max-[1180px]:text-[48px]",
                "max-[900px]:text-[46px]",
                "max-[640px]:text-[length:clamp(1.75rem,8vw,2.4rem)]",
                "max-[600px]:max-w-[370px] max-[600px]:leading-[0.98] max-[600px]:tracking-[-1.5px]",
              )}
            >
              Intellectual Property
              <br />
              Protection and
              <br />
              Enforcement
            </h1>
            <p className="mb-[25px] max-w-[560px] text-[21px] leading-[1.38] text-[#11183f] max-[600px]:mb-[17px] max-[600px]:text-[15px] max-[600px]:leading-[1.3]">
              Strengthening Intellectual Property Protection
              <br className="hidden md:inline" /> across Africa and Beyond
            </p>
            <div className="mb-[27px] flex items-center gap-[18px] max-[600px]:mb-[18px] max-[600px]:block">
              <div className="flex items-center gap-3 max-[600px]:mb-2">
                <div className="h-[39px] w-[39px] shrink-0 text-[#075fe5] max-[600px]:h-[29px] max-[600px]:w-[29px]">
                  <CalendarDays className={eventIcon} size={39} strokeWidth={2} />
                </div>
                <strong className="text-[15px] text-[#0b1643] max-[600px]:text-[12px]">{event.dates}</strong>
              </div>
              <div className="h-[43px] w-px bg-[#b6c2d3] max-[600px]:hidden" aria-hidden />
              <div className="flex items-center gap-3 max-[600px]:mb-2">
                <div className="h-[39px] w-[39px] shrink-0 text-[#075fe5] max-[600px]:h-[29px] max-[600px]:w-[29px]">
                  <MapPin className={eventIcon} size={39} strokeWidth={0} fill="currentColor" />
                </div>
                <strong className="text-[15px] text-[#0b1643] max-[600px]:text-[12px]">
                  {event.city}
                  <br />
                  <small className="text-[12px] font-normal text-[#58698b]">{event.venue}</small>
                </strong>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 max-[600px]:grid max-[600px]:grid-cols-[1fr_1fr] max-[600px]:gap-2 max-[360px]:grid-cols-[1fr]">
              <Link className={cn(heroBtn, "min-w-[260px] bg-[#075fe5] text-white max-[600px]:min-w-0")} to="/register">
                {t("actions.registerNow")} &nbsp;{" "}
                <span className="text-[24px] font-normal leading-none" aria-hidden>
                  →
                </span>
              </Link>
              <Link className={cn(heroBtn, "bg-white text-[#075fe5]")} to="/programme">
                ▣ &nbsp; {t("actions.viewProgramme")}
              </Link>
            </div>
          </div>

          <aside
            className={cn(
              "absolute right-0 top-[39px] z-[3] w-[438px] rounded-[11px] border border-[#dfe7f0] bg-[rgba(255,255,255,0.97)] px-9 pb-[19px] pt-[35px] shadow-[0_10px_30px_#113a6612]",
              "max-[1180px]:w-[390px]",
              "max-[900px]:relative max-[900px]:right-auto max-[900px]:top-auto max-[900px]:mx-auto max-[900px]:mb-0 max-[900px]:mt-[25px] max-[900px]:w-full max-[900px]:max-w-[520px]",
              "max-[600px]:mt-5 max-[600px]:rounded-[9px] max-[600px]:px-[17px] max-[600px]:pb-[15px] max-[600px]:pt-[23px]",
            )}
          >
            <h2 className="mb-2 text-[30px] font-black tracking-[-1px] text-[#0b1643] max-[600px]:text-[25px]">
              Sign In
            </h2>
            <p className="mb-[25px] text-[15px] leading-[1.35] text-[#596a8e] max-[600px]:mb-[18px] max-[600px]:text-[12px]">
              Access your account to manage your registration,
              <br />
              view your profile and tickets.
            </p>
            <form onSubmit={submit} noValidate>
              {formError ? (
                <div
                  className="mb-[14px] rounded-[7px] border border-[#f7c4c8] bg-[#fff1f2] px-3 py-[10px] text-[12px] leading-[1.35] text-[#b3121a]"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}
              <div className={fieldWrap}>
                <label className={fieldLabel} htmlFor="admin-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-[15px] top-[13px] h-5 w-5 text-[#52668d]" aria-hidden>
                    <Mail size={20} strokeWidth={1.8} />
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
                  <span className="mt-[5px] block text-[11px] text-[#ed1c24]" role="alert">
                    {errors.email}
                  </span>
                ) : null}
              </div>
              <div className={fieldWrap}>
                <label className={fieldLabel} htmlFor="admin-password">
                  Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-[15px] top-[13px] h-5 w-5 text-[#52668d]" aria-hidden>
                    <Lock size={20} strokeWidth={1.8} />
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
                    className="absolute right-[14px] top-3 cursor-pointer bg-transparent p-[2px] text-[#52668d] disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff size={20} strokeWidth={1.8} /> : <Eye size={20} strokeWidth={1.8} />}
                  </button>
                </div>
                {errors.password ? (
                  <span className="mt-[5px] block text-[11px] text-[#ed1c24]" role="alert">
                    {errors.password}
                  </span>
                ) : null}
              </div>
              <div className="-mt-[3px] mb-[18px] flex items-center justify-between gap-[10px] text-[13px] text-[#52668d] max-[600px]:text-[11px]">
                <label className="flex cursor-pointer items-center gap-[7px]">
                  <input
                    className="m-0 h-5 w-5 accent-[#075fe5] max-[600px]:h-[18px] max-[600px]:w-[18px]"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={submitting}
                  />
                  Remember me
                </label>
                <button
                  className="cursor-pointer bg-transparent p-0 text-[#075fe5] [font:inherit] disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={submitting}
                >
                  Forgot password?
                </button>
              </div>
              <button
                className="h-[50px] w-full cursor-pointer rounded-[7px] bg-[#075fe5] text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 max-[600px]:h-[45px] max-[600px]:text-[14px]"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>
            <div className="my-[14px] flex items-center gap-[15px] text-[13px] text-[#61708e] before:h-px before:flex-1 before:bg-[#dce4ef] before:content-[''] after:h-px after:flex-1 after:bg-[#dce4ef] after:content-['']">
              or
            </div>
            <button
              className="flex h-[49px] w-full cursor-pointer items-center justify-center gap-[13px] rounded-[6px] border border-[#9dafc9] bg-white text-[14px] font-semibold text-[#101a40] max-[600px]:h-[44px] max-[600px]:text-[12px]"
              type="button"
            >
              <span className="text-[21px] font-black" aria-hidden>
                G
              </span>
              Continue with Google
            </button>
            <div className="mt-5 flex items-center justify-between gap-[15px] rounded-lg bg-[#edf6ff] px-[17px] py-[18px] max-[600px]:p-[13px]">
              <div>
                <strong className="block text-[13px] text-[#10205e] max-[600px]:text-[11px]">
                  Signing in as a participant?
                </strong>
                <p className="mt-[7px] max-w-[235px] text-[12px] leading-[1.4] text-[#52678b] max-[600px]:text-[10px]">
                  Use your registration account to access your tickets and manage your details.
                </p>
              </div>
              <Link
                className="whitespace-nowrap text-[13px] font-bold text-[#075fe5] no-underline max-[600px]:text-[11px]"
                to="/participant-login"
              >
                Login as
                <br />
                Participant <span className="ml-[5px] text-[22px]">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="relative z-[4] border-b border-[#e0e7ef] bg-white pb-6 pt-[27px] max-[900px]:py-5 max-[600px]:py-2">
        <div
          className={cn(
            cn(pageContainer, "grid grid-cols-[repeat(4,1fr)]"),
            "max-[900px]:grid-cols-[1fr_1fr]",
            "max-[640px]:grid-cols-[1fr]",
          )}
        >
          {features.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex min-h-[105px] items-center justify-center gap-[15px] border-r border-[#dfe6ee] px-7 text-left last:border-r-0",
                "max-[1180px]:px-[15px]",
                "max-[900px]:min-h-[95px] max-[900px]:border-b",
                "max-[900px]:[&:nth-child(2)]:border-r-0 max-[900px]:[&:nth-child(n+3)]:border-b-0",
                "max-[600px]:min-h-[88px] max-[600px]:gap-[9px] max-[600px]:px-[9px] max-[600px]:py-3",
                "max-[360px]:px-[5px] max-[360px]:py-[10px]",
              )}
            >
              <div
                className={cn(
                  "grid h-[59px] w-[59px] flex-none place-items-center rounded-[50%] text-white",
                  "max-[600px]:h-[43px] max-[600px]:w-[43px]",
                  item.iconBg,
                )}
              >
                <item.icon
                  className="block h-8 w-8 max-[600px]:h-[23px] max-[600px]:w-[23px]"
                  size={32}
                  strokeWidth={2}
                />
              </div>
              <div>
                <h3 className="mb-[6px] text-[16px] font-extrabold text-[#0b1643] max-[600px]:mb-[3px] max-[600px]:text-[11px]">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[1.35] text-[#596a8b] max-[600px]:text-[9px]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-5 pt-[26px] max-[600px]:py-[18px]">
        <div className={pageContainer}>
          <div className="mb-5 h-px bg-[#dce4ed]" />
          <div
            className={cn(
              "grid grid-cols-[1.4fr_1.1fr_1fr_1.3fr] items-center gap-[25px]",
              "max-[900px]:grid-cols-[1fr_1fr]",
              "max-[600px]:grid-cols-[1fr]",
            )}
          >
            <div
              className="h-20 [background:url('/assets/footer-logos.png')_left_center/contain_no-repeat] max-[900px]:h-[70px] max-[600px]:h-[66px]"
              role="img"
              aria-label={t("brand.logoAlt")}
            />
            <div
              className={cn(
                "flex min-h-[58px] items-center gap-[13px] border-l border-[#d9e1eb] pl-7",
                "max-[600px]:min-h-[45px] max-[600px]:border-l-0 max-[600px]:border-t max-[600px]:border-[#e0e7ef] max-[600px]:pl-0 max-[600px]:pt-[13px]",
              )}
            >
              <CalendarDays
                className="h-[30px] w-[30px] flex-none text-[#0c1747] max-[600px]:h-[25px] max-[600px]:w-[25px]"
                size={30}
                strokeWidth={2}
              />
              <span className="text-[12px] leading-[1.35] text-[#111b3f] max-[600px]:text-[10px]">{event.dates}</span>
            </div>
            <div
              className={cn(
                "flex min-h-[58px] items-center gap-[13px] border-l border-[#d9e1eb] pl-7",
                "max-[600px]:min-h-[45px] max-[600px]:border-l-0 max-[600px]:border-t max-[600px]:border-[#e0e7ef] max-[600px]:pl-0 max-[600px]:pt-[13px]",
              )}
            >
              <MapPin
                className="h-[30px] w-[30px] flex-none text-[#0c1747] max-[600px]:h-[25px] max-[600px]:w-[25px]"
                size={30}
                strokeWidth={0}
                fill="currentColor"
              />
              <span className="text-[12px] leading-[1.35] text-[#111b3f] max-[600px]:text-[10px]">
                Kenyatta International
                <br />
                Convention Centre (KICC)
                <br />
                Nairobi, Kenya
              </span>
            </div>
            <div
              className="relative h-[95px] opacity-60 after:absolute after:bottom-0 after:right-0 after:h-[95px] after:w-[260px] after:border-b after:border-[#a9bad2] after:content-[''] max-[900px]:hidden"
              style={{ background: "linear-gradient(90deg, transparent, #eef4ff)" }}
              aria-hidden
            />
          </div>
        </div>
      </section>
    </div>
  );
}
