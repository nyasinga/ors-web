import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import { pageContainer } from "../../lib/pageContainer";

const stepLabels = ["Participation", "Details", "Payment", "Confirmation"] as const;

type HeroProps = {
  current: number;
  title?: string;
  subtitle?: string;
  crumb?: string;
};

/** Registration hero + step bar — adopted from HTML package */
export function RegisterHero({
  current,
  title = "Register for ISIPPE-3",
  subtitle = "Join global experts, policymakers and industry leaders to advance intellectual property protection and enforcement.",
  crumb = "Register",
}: HeroProps) {
  const { t } = useTranslation("common");
  const event = useEventCopy();

  return (
    <>
      <section className="bg-[#021c5d] min-h-[276px] text-white overflow-hidden max-[1100px]:min-h-[390px] max-[760px]:min-h-[400px]">
        <div
          className={cn(
            cn(pageContainer, "min-h-[276px] pt-[23px]"),
            "[background:linear-gradient(90deg,rgba(3,30,98,0.99)_0%,rgba(3,32,103,0.96)_35%,rgba(3,32,103,0.45)_55%,rgba(3,32,103,0)_78%),url('/assets/registration-hero.jpg')_96%_center/auto_108%_no-repeat]",
            "max-[1100px]:min-h-[390px] max-[1100px]:[background:linear-gradient(180deg,rgba(3,30,98,0.99)_0%,rgba(3,32,103,0.88)_48%,rgba(3,32,103,0.1)_100%),url('/assets/registration-hero.jpg')_center_bottom/auto_65%_no-repeat]",
            "max-[760px]:min-h-[400px] max-[760px]:pt-[18px] max-[760px]:[background:linear-gradient(180deg,rgba(3,30,98,0.99)_0%,rgba(3,32,103,0.93)_52%,rgba(3,32,103,0.12)_100%),url('/assets/registration-hero.jpg')_center_bottom/auto_47%_no-repeat]",
            "min-[1600px]:[background-size:auto,auto_110%]",
          )}
        >
          <div className="text-[14px] mb-3 text-white max-[760px]:text-[10px]">
            <Link to="/" className="hover:underline">
              {t("nav.home")}
            </Link>{" "}
            <span className="px-2 opacity-70">›</span> {crumb}
          </div>
          <div
            className="w-[42px] h-1 bg-[#ed1c24] mb-3 max-[760px]:h-[3px] max-[760px]:w-[38px]"
            aria-hidden
          />
          <h1
            className={cn(
              "m-0 mb-[10px] text-[47px] leading-[1.02] tracking-[-1.8px] font-black text-white",
              "max-[760px]:text-[35px] max-[760px]:tracking-[-1.2px]",
              "max-[640px]:text-[clamp(1.85rem,8vw,2.75rem)] max-[640px]:tracking-[-0.04em] max-[640px]:leading-[1.05]",
            )}
          >
            {title}
          </h1>
          <p className="mb-[18px] text-[19px] leading-[1.3] max-w-[620px] text-white max-[760px]:text-[12px] max-[760px]:max-w-[390px] max-[760px]:mb-[13px]">
            {subtitle}
          </p>
          <div className="flex items-center gap-[17px] max-[760px]:block">
            <div className="flex items-center gap-[10px] text-white max-[760px]:mb-[7px]">
              <div className="w-[34px] h-[34px] shrink-0 max-[760px]:w-[26px] max-[760px]:h-[26px]">
                <CalendarDays
                  size={34}
                  strokeWidth={2}
                  className="block w-[34px] h-[34px] max-[760px]:w-[26px] max-[760px]:h-[26px]"
                />
              </div>
              <strong className="text-[14px] font-extrabold max-[760px]:text-[11px]">
                {event.dates}
              </strong>
            </div>
            <div className="w-px h-[39px] bg-[#c8d3e5] max-[760px]:hidden" aria-hidden />
            <div className="flex items-center gap-[10px] text-white max-[760px]:mb-[7px]">
              <div className="w-[34px] h-[34px] shrink-0 max-[760px]:w-[26px] max-[760px]:h-[26px]">
                <MapPin
                  size={34}
                  strokeWidth={0}
                  fill="currentColor"
                  className="block w-[34px] h-[34px] max-[760px]:w-[26px] max-[760px]:h-[26px]"
                />
              </div>
              <strong className="text-[14px] font-extrabold max-[760px]:text-[11px]">
                Kenyatta International
                <br />
                Convention Centre (KICC)
                <br />
                Nairobi, Kenya
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-5 pb-[14px] max-[760px]:pt-[13px] max-[760px]:pb-[9px]">
        <div
          className={cn(
            cn(pageContainer, "grid grid-cols-[repeat(7,1fr)] items-center gap-0"),
            "max-[760px]:grid-cols-[repeat(7,max-content)] max-[760px]:min-w-max max-[760px]:gap-[9px] max-[760px]:overflow-auto",
          )}
          aria-label="Registration steps"
        >
          {stepLabels.flatMap((label, i) => {
            const n = i + 1;
            const done = n < current;
            const active = n === current;
            const circle = done ? "✓" : String(n);
            const nodes = [
              <div
                key={label}
                className={cn(
                  "flex items-center gap-[10px] text-[13px] whitespace-nowrap max-[760px]:text-[9px]",
                  active ? "text-[#075fe5] font-bold" : "text-[#65728c]",
                )}
              >
                <span
                  className={cn(
                    "w-[34px] h-[34px] rounded-full grid place-items-center font-extrabold flex-[0_0_34px]",
                    "max-[760px]:w-[31px] max-[760px]:h-[31px] max-[760px]:basis-[31px]",
                    active && "bg-[#075fe5] text-white",
                    done && "bg-[#078047] text-white",
                    !active && !done && "bg-[#edf1f6] text-[#1d2a42]",
                  )}
                >
                  {circle}
                </span>
                <span>{label}</span>
              </div>,
            ];
            if (i < stepLabels.length - 1) {
              nodes.push(
                <span
                  key={`c-${label}`}
                  className="h-px bg-[#cfd9e6] w-full max-[760px]:w-9"
                  aria-hidden
                />,
              );
            }
            return nodes;
          })}
        </div>
      </div>
    </>
  );
}

export function PrivacyBar() {
  return (
    <div className={cn(pageContainer, "mt-[10px] px-[15px] py-[11px] bg-[#f1f8ff] rounded-[7px] flex items-center justify-between text-[#52627d] gap-3 max-[760px]:p-[10px] max-[760px]:block")}>
      <div>
        <strong className="text-[#10216d] text-[12px]">Data Privacy</strong>
        <br />
        <span className="text-[10px]">
          Your personal information will be used only for ISIPPE-3 registration and event
          communications.
        </span>
      </div>
      <a
        href="#privacy"
        className="text-[#064fd0] text-[11px] font-bold whitespace-nowrap max-[760px]:block max-[760px]:mt-[5px]"
      >
        Read our Privacy Policy →
      </a>
    </div>
  );
}
