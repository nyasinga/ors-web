import { useMemo, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import type { EngagementProgrammeSession } from "../../types/engagement";
import { cn } from "../../lib/cn";

type SessionTypeTone = "blue" | "red" | "green" | "purple" | "orange";

type ScheduleRow = {
  id: string;
  time: string;
  title: string;
  type: string;
  typeTone: SessionTypeTone;
  speakers: string;
  venue: string;
  venueSub?: string;
  venueThumb?: string;
};

type ProgrammeDay = {
  id: string;
  label: string;
  dateLabel: string;
  location: string;
  rows: ScheduleRow[];
};

const typeToneClass: Record<SessionTypeTone, string> = {
  blue: "bg-[#e3efff] text-[#1765d8]",
  red: "bg-[#ffe5e8] text-[#e11d32]",
  green: "bg-[#dff5e9] text-[#14864d]",
  purple: "bg-[#eee5ff] text-[#7438f6]",
  orange: "bg-[#fff0d7] text-[#c96a00]",
};

const DEFAULT_THUMB = "/assets/dashboard-venue.jpg";

function toneForBadge(badge?: string): SessionTypeTone {
  const key = (badge || "").toLowerCase();
  if (/ceremony|opening|closing/.test(key)) return "red";
  if (/keynote/.test(key)) return "green";
  if (/roundtable|workshop/.test(key)) return "purple";
  if (/presentation|case/.test(key)) return "orange";
  if (/panel/.test(key)) return "blue";
  if (/break|lunch|registration|coffee|networking/.test(key)) return "blue";
  return "blue";
}

function inferType(session: EngagementProgrammeSession): string {
  if (session.badge?.trim()) return session.badge.trim();
  const title = session.title.toLowerCase();
  if (title.includes("registration")) return "Registration";
  if (title.includes("opening") || title.includes("ceremony")) return "Ceremony";
  if (title.includes("keynote")) return "Keynote";
  if (title.includes("panel")) return "Panel";
  if (title.includes("roundtable")) return "Roundtable";
  if (title.includes("workshop")) return "Workshop";
  if (title.includes("lunch") || title.includes("break") || title.includes("coffee")) return "Break";
  if (title.includes("case") || title.includes("presentation")) return "Presentation";
  return "Session";
}

function speakersLabel(session: EngagementProgrammeSession): string {
  if (Array.isArray(session.speakerNames) && session.speakerNames.length) {
    return session.speakerNames.join("\n");
  }
  if (Array.isArray(session.speakers)) {
    return session.speakers.length ? session.speakers.join("\n") : "—";
  }
  if (typeof session.speakers === "number") {
    return session.speakers > 0 ? `${session.speakers} speakers` : "—";
  }
  return "—";
}

function sessionTime(session: EngagementProgrammeSession): string {
  if (session.time?.trim()) {
    return session.time.replace(/\s*\([^)]*\)\s*$/, "").trim();
  }
  const start = session.startTime?.trim();
  const end = session.endTime?.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end || "—";
}

function dayNumber(value: number | string | undefined, fallback: number): number {
  if (typeof value === "number" && value > 0) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/\D/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return fallback;
}

function formatDayDate(startIso: string | undefined, dayIndex: number): string {
  if (!startIso) return `Day ${dayIndex}`;
  const base = new Date(startIso);
  if (Number.isNaN(base.getTime())) return `Day ${dayIndex}`;
  const d = new Date(base);
  d.setDate(base.getDate() + (dayIndex - 1));
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

const SAMPLE_DAY1: ScheduleRow[] = [
  {
    id: "sample-1",
    time: "08:00 – 09:00",
    title: "Registration and Networking Coffee",
    type: "Registration",
    typeTone: "blue",
    speakers: "—",
    venue: "Main Lobby",
    venueSub: "(KICC)",
  },
  {
    id: "sample-2",
    time: "09:00 – 09:30",
    title: "Official Opening Ceremony",
    type: "Ceremony",
    typeTone: "red",
    speakers: "ACA Leadership\nGovernment Representatives",
    venue: "Tsavo Ballroom",
    venueSub: "(KICC)",
  },
  {
    id: "sample-3",
    time: "09:30 – 10:30",
    title: "Keynote Address: The Future of IP Protection in Africa",
    type: "Keynote",
    typeTone: "green",
    speakers: "International Expert",
    venue: "Tsavo Ballroom",
    venueSub: "(KICC)",
  },
  {
    id: "sample-4",
    time: "10:30 – 11:00",
    title: "Health Break & Networking",
    type: "Break",
    typeTone: "blue",
    speakers: "—",
    venue: "Exhibition Area",
    venueSub: "(KICC)",
  },
  {
    id: "sample-5",
    time: "11:00 – 12:30",
    title: "Panel Discussion: Combating Counterfeiting Through Regional Collaboration",
    type: "Panel",
    typeTone: "blue",
    speakers: "Industry Leaders\nPolicy Makers",
    venue: "Tsavo Ballroom",
    venueSub: "(KICC)",
  },
  {
    id: "sample-6",
    time: "12:30 – 14:00",
    title: "Lunch Break",
    type: "Break",
    typeTone: "blue",
    speakers: "—",
    venue: "Simba Restaurant",
    venueSub: "(KICC)",
  },
  {
    id: "sample-7",
    time: "14:00 – 15:30",
    title: "Roundtable: Emerging Technologies in IP Enforcement",
    type: "Roundtable",
    typeTone: "purple",
    speakers: "Experts & Stakeholders",
    venue: "Amboseli Room",
    venueSub: "(KICC)",
  },
  {
    id: "sample-8",
    time: "15:30 – 16:00",
    title: "Coffee Break",
    type: "Break",
    typeTone: "blue",
    speakers: "—",
    venue: "Exhibition Area",
    venueSub: "(KICC)",
  },
  {
    id: "sample-9",
    time: "16:00 – 17:30",
    title: "Case Studies: Successful IP Enforcement Initiatives in Africa",
    type: "Presentation",
    typeTone: "orange",
    speakers: "Regional Experts",
    venue: "Maasai Room",
    venueSub: "(KICC)",
  },
];

function toRows(sessions: EngagementProgrammeSession[]): ScheduleRow[] {
  return sessions.map((s, i) => {
    const type = inferType(s);
    const venue = s.venue || s.place || "—";
    return {
      id: s.id || `session-${i}`,
      time: sessionTime(s),
      title: s.title,
      type,
      typeTone: toneForBadge(type),
      speakers: speakersLabel(s),
      venue,
      venueSub: venue !== "—" ? undefined : undefined,
      venueThumb: DEFAULT_THUMB,
    };
  });
}

function buildDays(args: {
  programme: EngagementProgrammeSession[];
  startDate?: string;
  location: string;
  useSampleFallback: boolean;
}): ProgrammeDay[] {
  const { programme, startDate, location, useSampleFallback } = args;

  if (programme.length === 0 && useSampleFallback) {
    return [
      {
        id: "day-1",
        label: "Day 1",
        dateLabel: formatDayDate(startDate || "2026-11-12T06:00:00.000Z", 1),
        location,
        rows: SAMPLE_DAY1.map((r) => ({ ...r, venueThumb: DEFAULT_THUMB })),
      },
      {
        id: "day-2",
        label: "Day 2",
        dateLabel: formatDayDate(startDate || "2026-11-12T06:00:00.000Z", 2),
        location,
        rows: [],
      },
      {
        id: "day-3",
        label: "Day 3",
        dateLabel: formatDayDate(startDate || "2026-11-12T06:00:00.000Z", 3),
        location,
        rows: [],
      },
    ];
  }

  const grouped = new Map<number, EngagementProgrammeSession[]>();
  programme.forEach((session, index) => {
    const day = dayNumber(session.day, 1);
    const list = grouped.get(day) ?? [];
    list.push(session);
    grouped.set(day, list);
    void index;
  });

  const dayNums = [...grouped.keys()].sort((a, b) => a - b);
  if (dayNums.length === 0) {
    return [
      {
        id: "day-1",
        label: "Day 1",
        dateLabel: formatDayDate(startDate, 1),
        location,
        rows: [],
      },
    ];
  }

  const maxDay = Math.max(...dayNums, 1);
  const days: ProgrammeDay[] = [];
  for (let d = 1; d <= Math.max(maxDay, 1); d += 1) {
    const sessions = grouped.get(d) ?? [];
    days.push({
      id: `day-${d}`,
      label: `Day ${d}`,
      dateLabel: formatDayDate(startDate, d),
      location,
      rows: toRows(sessions),
    });
  }
  return days;
}

function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  return (
    <div className="overflow-x-auto max-[800px]:[-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[950px] table-fixed border-collapse text-[13px]">
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "32%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "24%" }} />
        </colgroup>
        <thead className="bg-[#edf4f9] text-left text-[#536782]">
          <tr className="h-10">
            <th className="px-5 font-semibold">Time</th>
            <th className="px-5 font-semibold text-[#172033]">Session</th>
            <th className="px-5 font-semibold text-[#172033]">Type</th>
            <th className="px-5 font-semibold">Speakers</th>
            <th className="px-5 font-semibold text-[#172033]">Venue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-[#e4edf5]",
                i % 2 === 0 ? "bg-[#f4f9fc]" : "bg-white",
              )}
            >
              <td className="whitespace-nowrap px-5 py-3 text-[#60718d]">{row.time}</td>
              <td className="px-5 py-3 font-semibold text-[#172033]">{row.title}</td>
              <td className="px-5 py-3">
                <span
                  className={cn(
                    "inline-flex items-center whitespace-nowrap rounded-[5px] px-3 py-1.5 text-[12px] font-semibold",
                    typeToneClass[row.typeTone],
                  )}
                >
                  {row.type}
                </span>
              </td>
              <td className="px-5 py-3 leading-5 text-[#60718d] whitespace-pre-line">
                {row.speakers}
              </td>
              <td className="px-5 py-2">
                <div className="flex items-center gap-3">
                  <img
                    className="h-[41px] w-[66px] shrink-0 rounded-[5px] object-cover"
                    src={row.venueThumb || DEFAULT_THUMB}
                    alt=""
                  />
                  <span className="text-[12px] font-semibold leading-[1.35] text-[#172033]">
                    {row.venue}
                    {row.venueSub ? (
                      <>
                        <br />
                        <span className="font-normal text-[#60718d]">{row.venueSub}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="ml-auto text-2xl leading-none text-blue-600" aria-hidden>
                    ›
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EventProgrammeSchedule({
  programme,
  startDate,
  location,
  fromApi = false,
}: {
  programme: EngagementProgrammeSession[];
  startDate?: string;
  location: string;
  fromApi?: boolean;
}) {
  const days = useMemo(
    () =>
      buildDays({
        programme,
        startDate,
        location,
        useSampleFallback: !fromApi,
      }),
    [programme, startDate, location, fromApi],
  );

  const [openId, setOpenId] = useState<string>(days[0]?.id ?? "day-1");

  return (
    <div className="mx-auto w-full space-y-4 text-[#172033]">
      {days.map((day) => {
        const open = openId === day.id;
        return (
          <section
            key={day.id}
            className="overflow-hidden rounded-xl border border-[#d7e4f2] bg-white shadow-sm"
          >
            <button
              type="button"
              className={cn(
                "flex min-h-[60px] w-full items-center gap-8 px-5 py-3 text-left",
                "max-[800px]:flex-wrap max-[800px]:gap-2.5",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd]",
              )}
              aria-expanded={open}
              aria-controls={`${day.id}-content`}
              onClick={() => setOpenId(open ? "" : day.id)}
            >
              <span
                className={cn(
                  "relative pl-[13px] text-[31px] font-extrabold leading-none tracking-tight",
                  "before:absolute before:left-0 before:top-[-3px] before:h-[46px] before:w-1 before:bg-[#ef233c] before:content-['']",
                  "after:absolute after:left-0 after:top-[-3px] after:h-1.5 after:w-32 after:bg-[linear-gradient(to_right,#ef233c_0_50%,#087b43_50%_100%)] after:content-['']",
                  "max-[800px]:after:w-[104px]",
                )}
              >
                {day.label}
              </span>
              <span className="text-[16px] font-semibold">{day.dateLabel}</span>
              <span
                className={cn(
                  "ml-auto flex items-center gap-3 text-[13px] font-medium",
                  "max-[800px]:ml-3 max-[800px]:w-full max-[800px]:justify-start",
                )}
              >
                <MapPin className="h-5 w-5 shrink-0 text-blue-600" size={20} fill="currentColor" strokeWidth={0} />
                {day.location}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-blue-600 transition-transform",
                  open && "rotate-180",
                )}
                size={20}
                strokeWidth={2}
              />
            </button>

            <div id={`${day.id}-content`} hidden={!open}>
              {day.rows.length > 0 ? (
                <ScheduleTable rows={day.rows} />
              ) : (
                <div className="border-t border-[#e4edf5] bg-[#f8fbfe] px-6 py-5 text-sm text-[#60718d]">
                  {fromApi
                    ? `No sessions scheduled for ${day.label} yet. Add sessions when editing this event.`
                    : `Add ${day.label} programme sessions here using the same schedule structure.`}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
