import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { PageHero } from "../../components/public/PageHero";
import { cn } from "../../lib/cn";
import { programmeDays, programmeSessions } from "../../data/publicContent";

const dayMeta: Record<1 | 2 | 3, { date: string; weekday: string }> = {
  1: { date: "12 November 2026", weekday: "Thursday" },
  2: { date: "13 November 2026", weekday: "Friday" },
  3: { date: "14 November 2026", weekday: "Saturday" },
};

const container =
  "mx-auto box-border w-[min(calc(100%-clamp(28px,5vw,80px)),1440px)] max-w-full max-[1200px]:w-[min(calc(100%-48px),1440px)] max-[640px]:w-[calc(100%-32px)] max-[380px]:!w-[calc(100%-24px)]";

function tagClass(tone: (typeof programmeSessions)[number]["tone"]) {
  const base = "inline-block rounded px-[9px] py-1 text-[10px] font-semibold";
  if (tone === "red") return cn(base, "bg-[#ffe6e8] text-[#e21d2a]");
  if (tone === "green") return cn(base, "bg-[#dff4e8] text-[#168046]");
  if (tone === "purple") return cn(base, "bg-[#eee5ff] text-[#6631e9]");
  if (tone === "orange") return cn(base, "bg-[#fff0d4] text-[#c87000]");
  return cn(base, "bg-[#e4eef8] text-[#1462d4]");
}

const thBase = "bg-[#edf4f9] px-[17px] py-[7px] text-left";
const tdBase =
  "h-[43px] border-t border-[#edf1f5] px-[17px] py-[5px] align-middle max-[700px]:block max-[700px]:h-auto max-[700px]:border-0 max-[700px]:p-0";

const th = {
  time: "w-[12%] font-bold text-[#53627a]",
  session: "w-[32%] text-xs font-semibold text-[#101827]",
  type: "w-[11%] font-bold text-[#101827]",
  speakers: "w-[21%] font-bold text-[#53627a]",
  venue: "w-[24%] font-bold text-[#101827]",
} as const;

const td = {
  time: "w-[12%] text-[#53627a] max-[700px]:absolute max-[700px]:left-2.5 max-[700px]:top-2.5 max-[700px]:w-12 max-[700px]:text-[9px] max-[700px]:leading-[1.35]",
  session:
    "w-[32%] text-xs font-semibold text-[#101827] max-[700px]:mb-1 max-[700px]:w-auto max-[700px]:text-[10px] max-[700px]:leading-[1.25]",
  type: "w-[11%] text-[#101827] max-[700px]:mb-1 max-[700px]:w-auto",
  speakers: "w-[21%] text-[#53627a] max-[700px]:mb-[3px] max-[700px]:w-auto max-[700px]:text-[9px]",
  venue: "w-[24%] text-[#101827] max-[700px]:w-auto",
} as const;

/** Programme — Tailwind port of isippe3-programme-pure-html-responsive */
export function ProgrammePage() {
  const [dayFilter, setDayFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openDays, setOpenDays] = useState<Record<1 | 2 | 3, boolean>>({
    1: true,
    2: false,
    3: false,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programmeSessions.filter((s) => {
      const dayOk = dayFilter === "all" || String(s.day) === dayFilter;
      const haystack = `${s.title} ${s.speakers} ${s.type} ${s.venue}`.toLowerCase();
      return dayOk && (!q || haystack.includes(q));
    });
  }, [dayFilter, query]);

  const byDay = ([1, 2, 3] as const)
    .filter((d) => dayFilter === "all" || dayFilter === String(d))
    .map((d) => ({
      day: d,
      sessions: filtered.filter((s) => s.day === d),
    }));

  return (
    <div className="bg-white text-[#101827]">
      <PageHero
        title="Programme"
        subtitle={
          <>
            ISIPPE-3 International Symposium on
            <br />
            Intellectual Property Protection and Enforcement
          </>
        }
        image="/assets/programme-hero.jpg"
        imageAlt="Nairobi skyline and Kenyatta International Convention Centre"
      />

      <section className="pb-3.5 pt-3 max-[700px]:pt-2.5">
        <div className={container}>
          <div
            className={cn(
              "flex flex-wrap items-center gap-2.5",
              "max-[1100px]:gap-2",
              "max-[700px]:grid max-[700px]:grid-cols-2 max-[700px]:gap-2",
            )}
          >
            {programmeDays.map((d, idx) => {
              const active = dayFilter === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  className={cn(
                    "h-[51px] shrink-0 cursor-pointer rounded-[7px] border px-[31px] text-[14px] leading-[1.1]",
                    "max-[1100px]:px-4 max-[1100px]:text-[13px]",
                    "max-[700px]:h-12 max-[700px]:w-full max-[700px]:px-2.5 max-[700px]:text-[11px]",
                    active
                      ? "border-[#0964df] bg-[#0964df] text-center font-bold text-white"
                      : "border-[#d4dfeb] bg-white text-left text-[#17243a]",
                    idx === 0 && "max-[700px]:col-span-full",
                  )}
                  onClick={() => {
                    setDayFilter(d.id);
                    if (d.id === "all") setOpenDays({ 1: true, 2: false, 3: false });
                    else
                      setOpenDays({
                        1: d.id === "1",
                        2: d.id === "2",
                        3: d.id === "3",
                      });
                  }}
                >
                  {d.sub ? (
                    <>
                      <strong className="block text-base font-extrabold max-[1100px]:text-[14px] max-[700px]:text-[13px]">
                        {d.label}
                      </strong>
                      {d.sub}
                    </>
                  ) : (
                    d.label
                  )}
                </button>
              );
            })}
            <label
              className={cn(
                "ml-auto flex h-[38px] w-[min(293px,100%)] min-w-[200px] flex-1 items-center gap-[9px] rounded-[7px] border border-[#d4dfeb] bg-white px-[11px]",
                "max-[1100px]:ml-0 max-[1100px]:basis-full",
                "max-[700px]:col-span-full max-[700px]:min-w-0 max-[700px]:w-full",
                "[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0 [&_svg]:text-[#53627a]",
              )}
            >
              <Search size={18} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search sessions</span>
              <input
                className="w-full border-0 bg-transparent text-[11px] text-[#53627a] outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sessions, topics or speakers..."
              />
            </label>
          </div>
        </div>
      </section>

      <main className="pb-7 max-[700px]:pb-5">
        <div className={container}>
          {byDay.map(({ day, sessions }) => {
            const open = openDays[day];
            const meta = dayMeta[day];
            return (
              <section
                key={day}
                className={cn(
                  "mb-[13px] overflow-hidden rounded-[9px] border border-[#dbe6f0] bg-white shadow-[0_1px_4px_#0b4a7510] max-[700px]:mb-2",
                  open
                    ? "max-[1100px]:overflow-x-auto max-[700px]:overflow-visible"
                    : "h-[53px] max-[700px]:h-[52px]",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-pointer items-center border-0 bg-white px-4 text-left text-inherit before:absolute before:left-3.5 before:top-[5px] before:h-[5px] before:w-[102px] before:bg-[linear-gradient(90deg,#ed1c24_50%,#08713f_50%)] before:content-[''] max-[700px]:px-2.5 max-[700px]:before:left-2.5 max-[700px]:before:w-[70px]",
                    open ? "h-12 max-[700px]:h-[54px]" : "h-[53px] max-[700px]:h-[52px]",
                  )}
                  aria-expanded={open}
                  onClick={() => setOpenDays((s) => ({ ...s, [day]: !s[day] }))}
                >
                  <div
                    className={cn(
                      "ml-2 border-l-4 border-[#ed1c24] pl-[9px] font-black text-[#101827] max-[700px]:ml-0.5",
                      open ? "text-[25px] max-[700px]:text-[22px]" : "text-[23px] max-[700px]:text-[20px]",
                    )}
                  >
                    Day {day}
                  </div>
                  <div className="ml-6 text-[13px] font-semibold text-[#101827] max-[700px]:ml-3.5 max-[700px]:text-[10px]">
                    {meta.date}, {meta.weekday}
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-[11px] text-[#101827] max-[700px]:hidden [&_svg]:h-[19px] [&_svg]:w-[19px] [&_svg]:shrink-0 [&_svg]:text-[#0964df]">
                    <MapPin size={19} strokeWidth={0} fill="currentColor" />
                    Kenyatta International Convention Centre (KICC), Nairobi
                  </div>
                  <span
                    className="ml-[18px] text-[22px] leading-none text-[#0964df] max-[700px]:ml-auto"
                    aria-hidden
                  >
                    {open ? "⌃" : "⌄"}
                  </span>
                </button>

                {open ? (
                  sessions.length === 0 ? (
                    <p className="border-t border-[#edf1f5] px-[17px] py-7 text-center text-xs text-[#53627a]">
                      No sessions match your filters.
                    </p>
                  ) : (
                    <table className="w-full table-fixed border-collapse text-[11px] max-[1100px]:min-w-[900px] max-[700px]:block max-[700px]:min-w-0">
                      <thead className="max-[700px]:hidden">
                        <tr>
                          <th className={cn(thBase, th.time)}>Time</th>
                          <th className={cn(thBase, th.session)}>Session</th>
                          <th className={cn(thBase, th.type)}>Type</th>
                          <th className={cn(thBase, th.speakers)}>Speakers</th>
                          <th className={cn(thBase, th.venue)}>Venue</th>
                        </tr>
                      </thead>
                      <tbody className="max-[700px]:block">
                        {sessions.map((s, rowIdx) => {
                          const stripe = rowIdx % 2 === 0 ? "bg-[#f7fafc] max-[700px]:bg-transparent" : "";
                          return (
                            <tr
                              key={s.id}
                              className="max-[700px]:relative max-[700px]:block max-[700px]:border-t max-[700px]:border-[#e6edf4] max-[700px]:bg-white max-[700px]:py-[9px] max-[700px]:pl-[66px] max-[700px]:pr-2.5"
                            >
                              <td className={cn(tdBase, td.time, stripe)}>{s.time}</td>
                              <td className={cn(tdBase, td.session, stripe)}>{s.title}</td>
                              <td className={cn(tdBase, td.type, stripe)}>
                                <span className={tagClass(s.tone)}>{s.type}</span>
                              </td>
                              <td className={cn(tdBase, td.speakers, stripe)}>
                                {s.speakerLines
                                  ? s.speakerLines.map((line) => (
                                      <span key={line}>
                                        {line}
                                        <br />
                                      </span>
                                    ))
                                  : s.speakers}
                              </td>
                              <td className={cn(tdBase, td.venue, stripe)}>
                                <div className="flex items-center gap-2.5">
                                  <img
                                    className="block h-[33px] w-[51px] shrink-0 rounded object-cover max-[700px]:h-[29px] max-[700px]:w-[45px]"
                                    src={s.venueImage}
                                    alt=""
                                  />
                                  <div className="text-[10px] font-semibold leading-[1.2] text-[#15223a] max-[700px]:text-[9px]">
                                    {s.venue}
                                    <br />
                                    <span className="font-medium text-[#53627a]">{s.venueSub ?? "KICC"}</span>
                                  </div>
                                  <span
                                    className="ml-auto shrink-0 text-[22px] leading-none text-[#0964df] max-[700px]:text-lg"
                                    aria-hidden
                                  >
                                    ›
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )
                ) : null}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
