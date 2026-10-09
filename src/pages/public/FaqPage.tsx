import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Handshake,
  Headset,
  MapPin,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { faqCategories, faqsByCategory } from "../../data/publicContent";

const icons = {
  FileText,
  User,
  CreditCard,
  Handshake,
  Users,
  Ticket,
  MapPin,
  Headset,
} as const;

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const heroBg =
  "[background:linear-gradient(90deg,#fff_0%,#fff_28%,rgba(255,255,255,0.92)_40%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_72%),url('/assets/faq-hero.jpg')_96%_center/auto_108%_no-repeat]";
const heroBgTablet =
  "max-[1100px]:[background:linear-gradient(180deg,#fff_0%,#fff_51%,rgba(255,255,255,0.15)_100%),url('/assets/faq-hero.jpg')_center_bottom/auto_62%_no-repeat]";
const heroBgMobile =
  "max-[760px]:[background:linear-gradient(180deg,#fff_0%,#fff_55%,rgba(255,255,255,0.08)_100%),url('/assets/faq-hero.jpg')_center_bottom/auto_43%_no-repeat]";

const icon =
  "h-8 w-8 shrink-0 grow-0 basis-8 text-[#075fd8] max-[760px]:h-[27px] max-[760px]:w-[27px] [&_svg]:block [&_svg]:h-8 [&_svg]:w-8 max-[760px]:[&_svg]:h-[27px] max-[760px]:[&_svg]:w-[27px]";
const eventItem =
  "flex items-center gap-2.5 text-[13px] text-[#10182a] max-[760px]:mb-2 max-[760px]:text-[11px]";
const eventStrong = "text-[14px] font-extrabold max-[760px]:text-xs";

const panel = "rounded-[10px] border border-[#dbe5ef] bg-white";

/** FAQ — Tailwind port of isippe3-faq-pure-html-responsive */
export function FaqPage() {
  const { t } = useTranslation("common");
  const [category, setCategory] = useState<(typeof faqCategories)[number]["id"]>("general");
  const [openId, setOpenId] = useState<string | null>(null);

  const active = faqCategories.find((c) => c.id === category) ?? faqCategories[0];
  const items = useMemo(() => faqsByCategory[category] ?? [], [category]);

  return (
    <div className="bg-white text-[#10182a]">
      <section className="relative min-h-[307px] overflow-hidden bg-white max-[1100px]:min-h-[410px] max-[760px]:min-h-[430px]">
        <div
          className={cn(
            container,
            "grid min-h-[307px] grid-cols-[47%_53%] max-[1100px]:block max-[1100px]:min-h-[410px] max-[760px]:min-h-[430px]",
            heroBg,
            heroBgTablet,
            heroBgMobile,
            "min-[1600px]:[background-size:auto,auto_110%]",
          )}
        >
          <div className="relative z-[2] pt-[25px]">
            <div
              className="mb-[18px] flex h-1.5 w-[132px] max-[760px]:mb-[15px] max-[760px]:h-1 max-[760px]:w-[68px]"
              aria-hidden
            >
              <span className="block h-full w-1/2 bg-[#ed1c24]" />
              <span className="block h-full w-1/2 bg-[#08713f]" />
            </div>
            <h1 className="max-w-[600px] text-[58px] font-black leading-[0.98] tracking-[-3px] text-[#10182a] max-[760px]:text-[42px] max-[760px]:tracking-[-2px] max-[640px]:text-[clamp(1.85rem,8vw,2.75rem)] max-[640px]:leading-[1.05] max-[640px]:tracking-[-0.04em]">
              Frequently Asked Questions
            </h1>
            <p className="mb-[19px] mt-3 max-w-[630px] text-[18px] leading-[1.3] text-[#202733] max-[760px]:mb-3.5 max-[760px]:mt-2.5 max-[760px]:max-w-[420px] max-[760px]:text-[13px] max-[760px]:leading-[1.35]">
              Find answers to common questions about ISIPPE-3 registration, payments, participation
              and more.
            </p>
            <div className="flex items-center gap-4 max-[760px]:block">
              <div className={eventItem}>
                <div className={icon}>
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong className={eventStrong}>{t("event.datesShort")}</strong>
              </div>
              <div className="h-[42px] w-px bg-[#b8c2cc] max-[760px]:hidden" aria-hidden />
              <div className={eventItem}>
                <div className={icon}>
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
                  <strong className={eventStrong}>{t("event.city")}</strong>
                  <small className="block text-[11px] text-[#52617a] max-[760px]:text-[9px]">
                    {t("event.venue")}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-[50px] pt-7 max-[760px]:pb-[35px] max-[760px]:pt-[18px]" id="faq">
        <div
          className={cn(
            container,
            "grid grid-cols-[360px_minmax(0,1fr)] items-start gap-[18px] max-[1100px]:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-3.5",
          )}
        >
          <aside
            className={cn(panel, "p-4 max-[900px]:w-full max-[760px]:p-2.5")}
            aria-label="FAQ categories"
          >
            {faqCategories.map((cat) => {
              const Icon = icons[cat.icon];
              const isActive = cat.id === category;
              const count = faqsByCategory[cat.id]?.length ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={cn(
                    "grid min-h-[59px] w-full cursor-pointer grid-cols-[36px_1fr_32px_18px] items-center gap-2 border-b px-1 text-left last:border-b-0 max-[760px]:min-h-[52px] max-[760px]:grid-cols-[30px_1fr_30px_15px]",
                    isActive
                      ? "rounded-[7px] border-b-transparent bg-[#e3efff] text-[#075fd8]"
                      : "border-[#e3e9f0] bg-white text-[#1d2a42]",
                  )}
                  onClick={() => {
                    setCategory(cat.id);
                    setOpenId(null);
                  }}
                >
                  <span className="grid h-[27px] w-[27px] place-items-center [&_svg]:block [&_svg]:h-[25px] [&_svg]:w-[25px]">
                    <Icon size={25} strokeWidth={1.75} />
                  </span>
                  <span
                    className={cn(
                      "text-[14px] max-[760px]:text-xs",
                      isActive ? "font-bold" : "font-medium",
                    )}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={cn(
                      "grid h-[30px] w-[30px] place-items-center rounded-full text-xs font-medium max-[760px]:h-[27px] max-[760px]:w-[27px] max-[760px]:text-[11px]",
                      isActive ? "bg-white" : "bg-[#eef3f8]",
                    )}
                  >
                    {count}
                  </span>
                  <span className="text-[24px] leading-none text-[#183b76]" aria-hidden>
                    ›
                  </span>
                </button>
              );
            })}
          </aside>

          <section
            className={cn(
              panel,
              "px-6 pb-[25px] pt-[21px] max-[760px]:px-3 max-[760px]:pb-[18px] max-[760px]:pt-[17px]",
            )}
          >
            <h2 className="text-[36px] font-black leading-[1.02] tracking-[-1.7px] text-[#10182a] max-[760px]:text-[25px] max-[760px]:tracking-[-1px]">
              {active.label}
            </h2>
            <p className="mb-[26px] mt-2 text-base leading-[1.35] text-[#53627a] max-[760px]:mb-[17px] max-[760px]:mt-[7px] max-[760px]:text-xs">
              {active.intro}
            </p>
            <div>
              {items.map((item, index) => {
                const id = String(index);
                const open = openId === id;
                return (
                  <div key={item.q} className="mb-2.5">
                    <button
                      type="button"
                      className={cn(
                        "flex min-h-[64px] w-full cursor-pointer items-center justify-between gap-3 border border-[#dfe8f1] px-[22px] text-left text-[#10182a] max-[760px]:min-h-[56px] max-[760px]:px-[15px]",
                        open ? "rounded-t-[7px] bg-[#fbfdff]" : "rounded-[7px] bg-white",
                      )}
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : id)}
                    >
                      <span className="text-base font-bold max-[760px]:text-xs">{item.q}</span>
                      <span
                        className="shrink-0 text-[28px] font-normal leading-none max-[760px]:text-[23px]"
                        aria-hidden
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      className={cn(
                        "rounded-b-[7px] border border-t-0 border-[#dfe8f1] bg-white px-[22px] pb-[17px] text-[13px] leading-[1.5] text-[#53627a] max-[760px]:px-[15px] max-[760px]:pb-[13px] max-[760px]:text-[11px]",
                        open ? "block" : "hidden",
                      )}
                    >
                      {item.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
