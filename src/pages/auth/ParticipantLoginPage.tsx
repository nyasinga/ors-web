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
import { cn } from "../../lib/cn";
import { pageContainer } from "../../lib/pageContainer";

/* ── Shared Tailwind class groups (values ported 1:1 from the former participant-login.css) ── */

/** Hero background: navy fade over the participant photo; flat navy overlay on tablet / phone. */
const heroBg = cn(
  "absolute inset-0",
  "[background:linear-gradient(90deg,rgba(2,31,105,0.99)_0%,rgba(3,40,115,0.95)_33%,rgba(3,42,118,0.48)_53%,rgba(3,42,118,0.12)_73%),url('/assets/participant-hero.jpg')_center/cover_no-repeat]",
  "min-[1600px]:left-[max(0px,calc(50%_-_720px))] min-[1600px]:right-[max(0px,calc(50%_-_720px))]",
  "max-[850px]:[background:linear-gradient(180deg,rgba(2,31,105,0.98),rgba(3,42,118,0.78)),url('/assets/participant-hero.jpg')_center/cover_no-repeat]",
);

const methodCard = cn(
  "rounded-[10px] border border-[#e3ebf5] bg-white px-10 pb-6 pt-[27px] shadow-[0_5px_22px_#183d7110]",
  "max-[1050px]:p-[25px]",
  "max-[850px]:m-auto max-[850px]:w-full max-[850px]:max-w-[650px]",
  "max-[600px]:px-[14px] max-[600px]:py-[18px]",
);

const methodHead = "flex items-start gap-[15px] max-[600px]:gap-[10px]";

const methodIcon = cn(
  "grid h-[76px] w-[76px] flex-none place-items-center rounded-[14px] bg-[#edf6ff] text-[#075fe5]",
  "max-[600px]:h-[54px] max-[600px]:w-[54px] max-[600px]:rounded-[10px]",
);

const methodIconSvg = "block h-[42px] w-[42px] max-[600px]:h-[30px] max-[600px]:w-[30px]";

const methodTitle = "mb-[5px] mt-[2px] text-[20px] font-extrabold text-[#0b2e9e] max-[600px]:text-[16px]";

const methodDesc = "max-w-[330px] text-[14px] leading-[1.4] text-[#65769a] max-[600px]:text-[10px]";

/** Corner brackets drawn with ::before / ::after on the QR frame. */
const qrFrame = cn(
  "relative mx-auto mb-[17px] grid h-[205px] w-[205px] place-items-center border-[5px] border-transparent",
  "max-[600px]:h-[175px] max-[600px]:w-[175px]",
  "before:absolute before:-left-[3px] before:-top-[3px] before:h-6 before:w-6 before:border-solid before:border-[#122c85] before:content-[''] before:[border-width:4px_0_0_4px]",
  "after:absolute after:-bottom-[3px] after:-right-[3px] after:h-6 after:w-6 after:border-solid after:border-[#122c85] after:content-[''] after:[border-width:0_4px_4px_0]",
);

const qrCorners = cn(
  "pointer-events-none absolute -inset-[3px]",
  "before:absolute before:right-0 before:top-0 before:h-6 before:w-6 before:border-solid before:border-[#122c85] before:content-[''] before:[border-width:4px_4px_0_0]",
  "after:absolute after:bottom-0 after:left-0 after:h-6 after:w-6 after:border-solid after:border-[#122c85] after:content-[''] after:[border-width:0_0_4px_4px]",
);

const passInput = cn(
  "h-[70px] w-full rounded-[7px] border border-[#cbd9ec] bg-white py-0 pl-7 pr-4 text-center text-[22px] tracking-[19px] text-[#1d2d55] [outline:none]",
  "focus:border-[#075fe5] focus:shadow-[0_0_0_3px_#075fe514]",
  "max-[600px]:h-[51px] max-[600px]:text-[17px] max-[600px]:tracking-[12px]",
);

const eventSvg = "h-[34px] w-[34px] flex-none max-[600px]:h-[27px] max-[600px]:w-[27px]";

const supportItem = cn(
  "flex items-center gap-[11px] text-[13px] text-[#064fe0] no-underline hover:underline",
  "max-[600px]:text-[10px]",
);

const supportSvg = "h-[22px] w-[22px] flex-none max-[600px]:h-[18px] max-[600px]:w-[18px]";

/** Participant login — Tailwind port of the former participant-login.css (pl-* / participant-login-page) */
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
    <div className="bg-white text-[#08164d]">
      <section className="relative h-[285px] overflow-hidden text-white max-[850px]:h-auto max-[850px]:min-h-[330px] max-[600px]:min-h-[300px]">
        <div className={heroBg} aria-hidden />
        <div className={cn(pageContainer, "relative flex h-full items-center max-[850px]:py-[30px] max-[600px]:py-[22px]")}>
          <div className="w-[65%] pt-[2px] max-[850px]:w-full">
            <div className="mb-[15px] text-[14px] text-white max-[600px]:mb-[11px] max-[600px]:text-[11px]">
              <Link className="hover:underline" to="/">
                {t("nav.home")}
              </Link>
              &nbsp;›&nbsp; <span className="opacity-90">{t("nav.participantLogin")}</span>
            </div>
            <div className="mb-4 h-[5px] w-[44px] bg-[#ed1c24] max-[600px]:mb-3 max-[600px]:h-[4px] max-[600px]:w-[38px]" aria-hidden />
            <h1
              className={cn(
                "mb-[10px] text-[50px] font-extrabold leading-[1.03] tracking-[-2px] text-white",
                "max-[1050px]:text-[44px]",
                "max-[850px]:text-[42px]",
                "max-[640px]:text-[length:clamp(1.75rem,8vw,2.4rem)]",
                "max-[600px]:tracking-[-1px]",
              )}
            >
              {t("nav.participantLogin")}
            </h1>
            <p className="mb-[17px] max-w-[520px] text-[19px] leading-[1.35] text-white max-[600px]:text-[14px]">
              Access your ISIPPE-3 registration, ticket and event information.
            </p>
            <div className="flex items-center gap-[17px] max-[600px]:block">
              <div className="flex items-center gap-[11px] text-white max-[600px]:my-[7px]">
                <CalendarDays className={eventSvg} size={34} strokeWidth={2} />
                <strong className="text-[14px] max-[600px]:text-[11px]">{event.dates}</strong>
              </div>
              <div className="h-[43px] w-px bg-white max-[600px]:hidden" aria-hidden />
              <div className="flex items-center gap-[11px] text-white max-[600px]:text-[11px]">
                <MapPin className={eventSvg} size={34} strokeWidth={0} fill="currentColor" />
                <div>
                  <strong>
                    Kenyatta International
                    <br />
                    Convention Centre (KICC)
                  </strong>
                  <small className="mt-[3px] block text-[12px] leading-[1.35] opacity-90 max-[600px]:text-[9px]">
                    {event.city}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-[23px] pt-[30px] max-[600px]:py-[17px]">
        <div className={pageContainer}>
          <div className="grid grid-cols-[1fr_1px_1fr] items-stretch gap-[38px] max-[1050px]:gap-[22px] max-[850px]:grid-cols-[1fr] max-[850px]:gap-5">
            <section className={methodCard}>
              <div className={methodHead}>
                <div className={methodIcon}>
                  <QrCode className={methodIconSvg} size={42} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className={methodTitle}>Login with QR Code</h2>
                  <p className={methodDesc}>
                    Present the QR code from your confirmation email or registration receipt.
                  </p>
                </div>
              </div>
              <div className="pt-[18px] text-center max-[600px]:pt-3">
                <div className={qrFrame}>
                  <span className={qrCorners} aria-hidden />
                  <div
                    className="h-[160px] w-[160px] border-8 border-white mix-blend-multiply shadow-[0_0_0_1px_#ddd] [image-rendering:pixelated] max-[600px]:h-[135px] max-[600px]:w-[135px]"
                    style={{
                      background:
                        "repeating-linear-gradient(0deg, #111 0 5px, #fff 5px 10px), repeating-linear-gradient(90deg, transparent 0 5px, #000 5px 10px)",
                    }}
                    aria-label="QR code placeholder"
                  />
                </div>
                <button
                  type="button"
                  className="mb-[17px] flex h-[76px] w-full cursor-pointer items-center justify-center gap-[15px] rounded-[7px] border border-[#cfe0f3] bg-[#f1f8ff] px-3 text-inherit [font:inherit] max-[600px]:h-[62px]"
                  onClick={() => {
                    setScanned(true);
                    setError("");
                  }}
                >
                  <ScanLine className="h-[31px] w-[31px] flex-none text-[#075fe5]" size={31} strokeWidth={1.8} />
                  <div>
                    <strong className="block text-left text-[13px] text-[#082da0] max-[600px]:text-[11px]">
                      {scanned ? "QR image ready — click Login" : "Click to scan QR code"}
                    </strong>
                    <span className="mt-1 block text-left text-[11px] text-[#637397] max-[600px]:text-[9px]">
                      {scanned ? "Pass code optional when QR is ready" : "or drag and drop an image"}
                    </span>
                  </div>
                </button>
                <div className="text-center text-[12px] text-[#66769a] max-[600px]:text-[10px]">
                  Having trouble?{" "}
                  <button
                    type="button"
                    className="cursor-pointer bg-transparent p-0 text-[#064fe0] underline [font:inherit]"
                    onClick={focusPass}
                  >
                    Enter your pass code instead
                  </button>
                </div>
              </div>
            </section>

            <div className="relative my-[18px] w-px bg-[#cbd8e9] max-[850px]:hidden" aria-hidden>
              <span className="absolute left-1/2 top-1/2 grid h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[50%] border border-[#b9cae1] bg-white text-[12px] font-bold text-[#102b72]">
                OR
              </span>
            </div>

            <section className={methodCard} id="pass">
              <div className={methodHead}>
                <div className={methodIcon}>
                  <Mail className={methodIconSvg} size={42} strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className={methodTitle}>Login with Pass Code</h2>
                  <p className={methodDesc}>
                    Enter the pass code sent to your registered email address.
                  </p>
                </div>
              </div>
              <form className="pt-8 max-[600px]:pt-[19px]" onSubmit={login}>
                <div>
                  <label
                    className="mb-[7px] block text-[13px] font-semibold text-[#08164d] max-[600px]:text-[10px]"
                    htmlFor="passcode"
                  >
                    Pass Code <sup className="text-[red]">*</sup>
                  </label>
                  <input
                    id="passcode"
                    className={passInput}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="Enter 6-digit pass code"
                    required={!scanned}
                    aria-invalid={Boolean(error) || undefined}
                  />
                  {error ? (
                    <span className="mt-[6px] block text-[11px] text-[#ed1c24]" role="alert">
                      {error}
                    </span>
                  ) : null}
                </div>
                <button
                  className="mt-4 h-[47px] w-full cursor-pointer rounded-[7px] bg-[#064fe0] text-[15px] font-bold text-white max-[600px]:mt-[11px] max-[600px]:h-[43px] max-[600px]:text-[12px]"
                  type="submit"
                >
                  Login &nbsp; →
                </button>
              </form>
              <div className="mt-5 flex gap-3 rounded-lg bg-[#edf6ff] px-[17px] py-[14px] max-[600px]:mt-[13px] max-[600px]:p-[11px]">
                <div className="grid h-[25px] w-[25px] flex-none place-items-center rounded-[50%] bg-[#075fe5] text-[12px] font-extrabold text-white">
                  i
                </div>
                <div>
                  <strong className="text-[12px] text-[#08164d] max-[600px]:text-[10px]">
                    Can&apos;t find your pass code?
                  </strong>
                  <ul className="mt-[5px] pl-4 text-[11px] leading-[1.55] text-[#56698e] max-[600px]:text-[9px]">
                    <li>Check your inbox (including spam folder) for the email from ISIPPE-3.</li>
                    <li>Use the QR code from your registration receipt.</li>
                    <li>If you still can&apos;t access your account, contact support.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-[22px] flex items-center gap-7 rounded-[9px] bg-[#edf6ff] px-[30px] py-[21px] max-[850px]:flex-wrap max-[600px]:gap-[13px] max-[600px]:p-[17px]">
            <Headphones
              className="h-[53px] w-[53px] flex-none text-[#08359d] max-[600px]:h-10 max-[600px]:w-10"
              size={53}
              strokeWidth={1.7}
            />
            <div>
              <h3 className="mb-[5px] text-[16px] font-extrabold text-[#08164d] max-[600px]:text-[13px]">
                Need Assistance?
              </h3>
              <p className="text-[13px] text-[#627494] max-[600px]:text-[10px]">For login support, please contact us:</p>
            </div>
            <div
              className={cn(
                "ml-[10px] flex items-center gap-[45px]",
                "max-[1050px]:gap-5",
                "max-[850px]:ml-0",
                "max-[600px]:ml-[53px] max-[600px]:grid max-[600px]:w-full max-[600px]:grid-cols-[1fr] max-[600px]:gap-[9px]",
              )}
            >
              <a className={supportItem} href={`mailto:${event.supportEmail}`}>
                <Mail className={supportSvg} size={22} fill="currentColor" strokeWidth={0} />
                {event.supportEmail}
              </a>
              <a className={supportItem} href={`tel:${event.supportPhone}`}>
                <Phone className={supportSvg} size={22} fill="currentColor" strokeWidth={0} />
                {event.supportPhone}
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
