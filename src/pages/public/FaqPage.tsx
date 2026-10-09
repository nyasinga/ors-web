import { useMemo, useState } from "react";
import {
  CreditCard,
  FileText,
  Handshake,
  Headset,
  MapPin,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
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

const panel = "rounded-[10px] border border-[#dbe5ef] bg-white";

/** FAQ — Tailwind port of isippe3-faq-pure-html-responsive */
export function FaqPage() {
  const [category, setCategory] = useState<(typeof faqCategories)[number]["id"]>("general");
  const [openId, setOpenId] = useState<string | null>(null);

  const active = faqCategories.find((c) => c.id === category) ?? faqCategories[0];
  const items = useMemo(() => faqsByCategory[category] ?? [], [category]);

  return (
    <div className="bg-white text-[#10182a]">
      <PageHero
        title="Frequently Asked Questions"
        description="Find answers to common questions about ISIPPE-3 registration, payments, participation and more."
        image="/assets/faq-hero.jpg"
        imageAlt="ISIPPE frequently asked questions"
      />

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
