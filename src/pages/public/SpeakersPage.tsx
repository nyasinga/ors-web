import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { SpeakerCardGrid, type SpeakerCardData } from "../../components/speakers/SpeakerCard";
import { cn } from "../../lib/cn";
import { speakers, type SpeakerCategory } from "../../data/publicContent";

const filters: { id: "all" | SpeakerCategory; label: string }[] = [
  { id: "all", label: "All Speakers" },
  { id: "keynote", label: "Keynote Speakers" },
  { id: "panelist", label: "Panelists" },
  { id: "moderator", label: "Moderators" },
  { id: "government", label: "Government Representatives" },
];

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

const heroBg =
  "[background:linear-gradient(90deg,#fff_0%,#fff_28%,rgba(255,255,255,0.92)_40%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_72%),url('/assets/speakers-hero.jpg')_96%_center/auto_108%_no-repeat]";
const heroBgTablet =
  "max-[960px]:[background:linear-gradient(180deg,#fff_0%,rgba(255,255,255,0.94)_47%,rgba(255,255,255,0.12)_100%),url('/assets/speakers-hero.jpg')_center_bottom/auto_65%_no-repeat]";
const heroBgMobile =
  "max-[640px]:[background:linear-gradient(180deg,#fff_0%,#fff_53%,rgba(255,255,255,0.08)_100%),url('/assets/speakers-hero.jpg')_center_bottom/auto_43%_no-repeat]";

const eventItem =
  "flex items-center gap-2.5 text-[13px] text-[#101620] max-[640px]:mb-2 max-[640px]:gap-[9px] max-[640px]:text-[11px]";
const eventStrong = "text-[14px] font-extrabold max-[640px]:text-xs";
const eventIcon =
  "h-8 w-8 shrink-0 grow-0 basis-8 text-[#075fd8] max-[640px]:h-[27px] max-[640px]:w-[27px] [&_svg]:block [&_svg]:h-8 [&_svg]:w-8 max-[640px]:[&_svg]:h-[27px] max-[640px]:[&_svg]:w-[27px]";

/** Speakers — Tailwind port of isippe3-speakers-pure-html-responsive */
export function SpeakersPage() {
  const { t } = useTranslation("common");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speakers
      .filter((s) => {
        const matchFilter = filter === "all" || s.category === filter;
        const haystack = `${s.name} ${s.org} ${s.role} ${s.country}`.toLowerCase();
        return matchFilter && (!q || haystack.includes(q));
      })
      .map(
        (s): SpeakerCardData => ({
          id: s.id,
          name: s.name,
          role: s.role,
          org: s.org,
          roleLines: s.roleLines,
          country: s.country,
          flag: s.flag,
          category: s.category,
          photo: s.photo,
          bio: s.bio,
        }),
      );
  }, [query, filter]);

  return (
    <div className="bg-white text-[#101620]">
      <section className="relative min-h-[248px] overflow-hidden bg-white max-[960px]:min-h-0" id="speakers">
        <div
          className={cn(
            container,
            "grid min-h-[248px] grid-cols-[44%_56%] max-[960px]:block max-[960px]:min-h-[420px] max-[640px]:min-h-[430px] max-[380px]:min-h-[425px]",
            heroBg,
            heroBgTablet,
            heroBgMobile,
            "min-[1600px]:[background-size:auto,auto_110%]",
          )}
        >
          <div className="relative z-[2] pt-[25px] max-[960px]:pt-[26px] max-[640px]:pt-[23px]">
            <div
              className="mb-3 flex h-1.5 w-[132px] max-[640px]:mb-3.5 max-[640px]:h-1 max-[640px]:w-[68px]"
              aria-hidden
            >
              <span className="block h-full w-1/2 bg-[#ed1c24]" />
              <span className="block h-full w-1/2 bg-[#08713f]" />
            </div>
            <h1 className="text-[69px] font-black leading-[0.91] tracking-[-3.5px] text-[#101620] max-[1200px]:text-[60px] max-[960px]:text-[59px] max-[640px]:text-[clamp(1.85rem,8vw,2.75rem)] max-[640px]:leading-[1.05] max-[640px]:tracking-[-0.04em]">
              Speakers
            </h1>
            <div className="mb-2.5 mt-[9px] max-w-[600px] text-[24px] font-extrabold leading-[1.12] text-[#101620] max-[1200px]:text-[21px] max-[960px]:max-w-[680px] max-[960px]:text-[20px] max-[640px]:mt-2 max-[640px]:text-base max-[640px]:leading-[1.15]">
              ISIPPE-3 International Symposium on
              <br />
              Intellectual Property Protection and Enforcement
            </div>
            <div className="flex items-center gap-4 max-[640px]:block">
              <div className={eventItem}>
                <div className={eventIcon}>
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong className={eventStrong}>{t("event.datesShort")}</strong>
              </div>
              <div className="h-[39px] w-px bg-[#b8c2cc] max-[640px]:hidden" aria-hidden />
              <div className={eventItem}>
                <div className={eventIcon}>
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
                  <strong className={eventStrong}>{t("event.city")}</strong>
                  <span className="block text-[11px] text-[#44546a] max-[640px]:text-[9px]">
                    {t("event.venue")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-3 pt-[17px] max-[640px]:pt-3">
        <div className={container}>
          <div className="flex items-center gap-2.5 max-[960px]:flex-wrap max-[640px]:grid max-[640px]:grid-cols-[1fr_1fr] max-[640px]:gap-[7px]">
            {filters.map((f, idx) => {
              const count =
                f.id === "all"
                  ? speakers.length
                  : speakers.filter((s) => s.category === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={cn(
                    "min-h-[38px] cursor-pointer whitespace-nowrap rounded-md border px-[17px] text-xs max-[640px]:w-full max-[640px]:whitespace-normal max-[640px]:px-[7px] max-[640px]:text-[10px]",
                    filter === f.id
                      ? "border-[#075fd8] bg-[#075fd8] font-bold text-white"
                      : "border-[#d7e2ef] bg-white font-medium text-[#203250]",
                    idx === 0 && "max-[640px]:col-span-full",
                  )}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label} ({count})
                </button>
              );
            })}
            <label className="ml-auto flex h-[38px] w-[223px] items-center gap-[9px] rounded-md border border-[#d7e2ef] bg-white px-[11px] max-[640px]:col-span-full max-[640px]:m-0 max-[640px]:w-full [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:flex-[0_0_18px] [&_svg]:text-[#42516a]">
              <Search size={18} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search speakers</span>
              <input
                className="w-full border-0 bg-transparent text-[11px] text-[#42516a] outline-none"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search speakers..."
              />
            </label>
          </div>
        </div>
      </section>

      <section className="pb-[30px]">
        <div className={container}>
          <SpeakerCardGrid
            speakers={filtered}
            columns={4}
            emptyMessage="No speakers match your search."
          />
        </div>
      </section>
    </div>
  );
}
