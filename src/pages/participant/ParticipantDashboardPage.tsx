import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  FileText,
  Hash,
  Mail,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import {
  getParticipantSession,
  refreshParticipantSession,
  type ParticipantSession,
} from "../../lib/participantAuth";
import { getEngagement } from "../../lib/engagements";
import { ApiError } from "../../lib/api";
import type { Engagement } from "../../types/engagement";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
};

function programmeDayTabs(engagement: Engagement | null) {
  if (!engagement?.startDate) return [] as Array<{ id: string; label: string }>;
  const start = new Date(engagement.startDate);
  const end = new Date(engagement.endDate || engagement.startDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const days: Array<{ id: string; label: string }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  let i = 1;
  while (cursor <= last && i <= 14) {
    days.push({
      id: String(i),
      label: new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(cursor),
    });
    cursor.setDate(cursor.getDate() + 1);
    i += 1;
  }
  return days;
}

const formatEventDates = (engagement: Engagement | null) => {
  if (!engagement) return "—";
  const start = formatDate(engagement.startDate);
  const end = formatDate(engagement.endDate);
  return start === end ? start : `${start} – ${end}`;
};

const formatMoney = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "KES",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "KES"} ${amount.toLocaleString()}`;
  }
};

const displayValue = (value?: string | null) => value?.trim() || "—";

const whatsNext = [
  {
    icon: Mail,
    title: "Check your email",
    text: "We have sent a confirmation email with your ticket and event details.",
  },
  {
    icon: CalendarDays,
    title: "Explore the programme",
    text: "View sessions, speakers and plan your attendance.",
  },
  {
    icon: Plane,
    title: "Plan your travel",
    text: "Find venue information, hotels and travel guidance.",
  },
  {
    icon: Users,
    title: "Join the event",
    text: "Attend the sessions and networking events.",
  },
];

const quickActions = [
  {
    to: "/programme",
    title: "View Programme",
    text: "Explore sessions and schedules",
    icon: CalendarDays,
    primary: true,
  },
  {
    to: "/speakers",
    title: "Meet the Speakers",
    text: "View speaker profiles",
    icon: Users,
    primary: false,
  },
  {
    to: "/venue",
    title: "Venue Information",
    text: "Venue details and travel tips",
    icon: MapPin,
    primary: false,
  },
  {
    to: "/faq",
    title: "Download Documents",
    text: "Tickets, receipts and more",
    icon: FileText,
    primary: false,
  },
];

/* ── Shared Tailwind class groups (values ported 1:1 from the former participant-dashboard.css) ── */

const card = "rounded-lg border border-[#e2ebf5] bg-white shadow-[0_3px_15px_#0b397710]";

const cardTitle = "text-[17px] font-extrabold text-[#092c9b] max-[600px]:text-[15px]";

/** Hero background: navy fade over the dashboard photo; flat overlay on phones. */
const heroBg = cn(
  "absolute inset-0",
  "[background:linear-gradient(90deg,rgba(1,27,91,0.99)_0%,rgba(3,39,108,0.94)_32%,rgba(3,43,115,0.42)_55%,rgba(3,43,115,0.04)_76%),url('/assets/dashboard-hero.jpg')_center/cover_no-repeat]",
  "max-[600px]:[background:linear-gradient(180deg,rgba(1,27,91,0.98),rgba(3,39,108,0.8)),url('/assets/dashboard-hero.jpg')_center/cover_no-repeat]",
);

const heroEventSvg = "h-7 w-7 flex-shrink-0 max-[600px]:h-6 max-[600px]:w-6";

const infoRow = cn(
  "mb-[15px] grid grid-cols-[28px_95px_1fr] [align-items:start] gap-2 text-[10px]",
  "max-[600px]:mb-3 max-[600px]:grid-cols-[25px_80px_1fr] max-[600px]:text-[9px]",
);

const infoIcon = "h-[23px] w-[23px] flex-shrink-0 text-[#075fe5]";

const infoLabel = "text-[10px] text-[#07164d]";

const infoValue = "leading-[1.35] text-[#1e397c]";

const nextIcon = "h-[25px] w-[25px] flex-none text-[#075fe5]";

const detailLabel = "mb-[3px] block text-[10px] text-[#0a1c5b]";

const detailBox = "mb-3 max-[600px]:mb-[7px]";

/** Participant dashboard — Tailwind port of the former participant-dashboard.css (pd-*) */
export function ParticipantDashboardPage() {
  const event = useEventCopy();
  const [session, setSession] = useState<ParticipantSession | null>(() => getParticipantSession());
  const [day, setDay] = useState("1");
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dayTabs = programmeDayTabs(engagement);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const refreshed = await refreshParticipantSession();
        if (!cancelled && refreshed) setSession(refreshed);
      } catch {
        // Keep cached session if revalidation fails (offline / API blip).
        if (!cancelled) setSession(getParticipantSession());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!session?.engagementID) {
      setEngagement(null);
      setError(
        session
          ? "Your participant session does not include an event ID. Please sign in again."
          : null,
      );
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await getEngagement(session.engagementID);
        if (!cancelled) setEngagement(row);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load event";
        setError(message);
        setEngagement(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.engagementID]);

  useEffect(() => {
    if (!dayTabs.length) return;
    if (!dayTabs.some((d) => d.id === day)) setDay(dayTabs[0].id);
  }, [dayTabs, day]);

  return (
    <>
      <section className="relative h-[226px] overflow-hidden text-white max-[850px]:h-[270px] max-[600px]:h-[290px]">
        <div className={heroBg} aria-hidden />
        <div
          className={cn(
            "relative h-full px-[clamp(16px,3vw,38px)] py-[29px]",
            "max-[1120px]:pl-[25px]",
            "max-[850px]:p-6",
            "max-[600px]:px-4 max-[600px]:py-[22px]",
          )}
        >
          <div className="mb-[5px] text-[11px] opacity-95 max-[600px]:text-[9px]">Welcome,</div>
          <h1
            className={cn(
              "mb-[5px] text-[42px] font-extrabold leading-[1.03] tracking-[-1.5px] text-white",
              "max-[1120px]:text-[36px]",
              "max-[640px]:text-[length:clamp(1.6rem,7vw,2rem)]",
            )}
          >
            {session?.fullName || "Participant"}
          </h1>
          <div className="mb-[17px] text-[17px] max-[600px]:text-[13px]">{engagement?.engagementName || event.name} Participant</div>
          <div className="flex items-center gap-4 max-[600px]:block">
            <div className="flex items-center gap-[9px] text-[11px] max-[600px]:my-[7px] max-[600px]:text-[9px]">
              <CalendarDays className={heroEventSvg} size={28} strokeWidth={2} />
              <strong>{formatEventDates(engagement)}</strong>
            </div>
            <div className="h-[38px] w-px bg-white max-[600px]:hidden" aria-hidden />
            <div className="flex items-center gap-[9px] text-[11px] max-[600px]:text-[9px]">
              <MapPin
                className="h-[29px] w-[29px] flex-none max-[600px]:h-6 max-[600px]:w-6"
                size={29}
                strokeWidth={2}
              />
              <div>
                {engagement?.venue || event.venue}
                <small className="mt-[2px] block text-[9px] opacity-90 max-[600px]:text-[8px]">{engagement?.city || event.city}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-[15px] max-[850px]:p-3 max-[600px]:p-[9px]">
        {(loading || error) && (
          <div
            className={cn(
              "mb-3 rounded-lg border px-3 py-2 text-[11px]",
              error
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-[#e2ebf5] bg-white text-[#607297]",
            )}
            role={error ? "alert" : "status"}
          >
            {error || "Loading your event details…"}
          </div>
        )}
        <div className="grid grid-cols-[1.25fr_1.05fr_0.78fr] gap-[10px] max-[1120px]:grid-cols-[1fr_1fr] max-[850px]:grid-cols-[1fr]">
          <section
            className={cn(
              card,
              "min-h-[285px] px-[15px] pb-3 pt-[13px]",
              "max-[600px]:p-3",
            )}
          >
            <h2 className={cardTitle}>Your Event Pass</h2>
            <div className="mt-[13px] grid grid-cols-[155px_1fr] gap-[15px] max-[850px]:grid-cols-[145px_1fr] max-[600px]:grid-cols-[1fr] max-[600px]:gap-[10px]">
              <div>
                <div className="grid h-[137px] w-[150px] place-items-center rounded-lg border border-[#e0e9f3] bg-white max-[600px]:h-[160px] max-[600px]:w-full">
                  <img
                    className="block h-[112px] w-[112px] [image-rendering:pixelated] max-[600px]:h-[130px] max-[600px]:w-[130px]"
                    src="/assets/qr-ticket.png"
                    alt="Event QR ticket"
                  />
                </div>
                <button
                  type="button"
                  className="mt-[9px] h-[38px] w-[150px] cursor-pointer rounded-[5px] bg-[#edf6ff] text-[11px] font-semibold text-[#0755d2] [font-family:inherit] max-[600px]:w-full"
                >
                  ⇩ &nbsp; Download QR Ticket
                </button>
              </div>
              <div className="text-[11px] max-[600px]:grid max-[600px]:grid-cols-[1fr_1fr] max-[600px]:gap-[5px]">
                <div className={detailBox}>
                  <strong className={detailLabel}>Ticket Reference</strong>
                  <span className="text-[#16327e]">{displayValue(session?.reference || session?.passCode)}</span>
                </div>
                <div className={detailBox}>
                  <strong className={detailLabel}>Participant Type</strong>
                  <span className="text-[#16327e]">{displayValue(session?.participationType)}</span>
                </div>
                <div className={detailBox}>
                  <strong className={detailLabel}>Full Name</strong>
                  <span className="text-[#16327e]">{displayValue(session?.fullName)}</span>
                </div>
                <div className={detailBox}>
                  <strong className={detailLabel}>Event Contact</strong>
                  <span className="text-[#16327e]">{displayValue(engagement?.contactName)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(card, "px-4 py-[13px]", "max-[600px]:p-3")}>
            <h2 className={cardTitle}>Event Information</h2>
            <div className="mt-[13px]">
              <div className={infoRow}>
                <CalendarDays className={infoIcon} size={23} strokeWidth={2} />
                <b className={infoLabel}>Dates</b>
                <span className={infoValue}>{formatEventDates(engagement)}</span>
              </div>
              <div className={infoRow}>
                <MapPin className={infoIcon} size={23} strokeWidth={2} />
                <b className={infoLabel}>Venue</b>
                <span className={infoValue}>
                  {engagement?.venue || event.venue}, {engagement?.city || event.city}
                </span>
              </div>
              <div className={infoRow}>
                <Users className={infoIcon} size={23} strokeWidth={2} />
                <b className={infoLabel}>Your Participation</b>
                <span className={infoValue}>{displayValue(session?.participationType)}</span>
              </div>
              <div className={infoRow}>
                <Award className={infoIcon} size={23} strokeWidth={2} />
                <b className={infoLabel}>Ticket Price</b>
                <span className={infoValue}>
                  {formatMoney(session?.ticketPrice, session?.currency)}
                </span>
              </div>
              <div className={infoRow}>
                <Hash className={infoIcon} size={23} strokeWidth={2} />
                <b className={infoLabel}>Ticket Reference</b>
                <span className={infoValue}>{displayValue(session?.reference)}</span>
              </div>
              <div className={infoRow}>
                <span
                  className="grid h-[23px] w-[23px] place-items-center rounded-[50%] bg-[#078047] text-[12px] font-extrabold leading-[1.35] text-white"
                  aria-hidden
                >
                  ✓
                </span>
                <b className={infoLabel}>Ticket Status</b>
                <span className="font-bold leading-[1.35] text-[#078047]">{displayValue(session?.status)}</span>
              </div>
            </div>
          </section>

          <section className={cn(card, "p-[13px] max-[1120px]:col-[1/-1]", "max-[600px]:p-3")}>
            <h2 className={cardTitle}>What&apos;s Next?</h2>
            {whatsNext.map((item) => (
              <div key={item.title} className="my-[14px] flex gap-[11px]">
                <item.icon className={nextIcon} size={25} strokeWidth={2} />
                <div>
                  <strong className="block text-[10px]">{item.title}</strong>
                  <p className="mt-[3px] text-[9px] leading-[1.3] text-[#607297]">{item.text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="mt-[14px] grid grid-cols-[repeat(4,1fr)] gap-[9px] max-[1120px]:grid-cols-[repeat(2,1fr)] max-[850px]:grid-cols-[1fr_1fr] max-[640px]:grid-cols-[1fr] max-[600px]:gap-[7px]">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              to={a.to}
              className={cn(
                "flex min-h-[73px] items-center gap-[13px] rounded-[7px] px-[14px] py-[11px] max-[600px]:min-h-[69px] max-[600px]:p-[9px]",
                a.primary
                  ? "text-white [background:linear-gradient(135deg,#0766f0,#0750d5)]"
                  : "bg-[#edf6ff]",
              )}
            >
              <span className="grid h-[34px] w-[34px] flex-none place-items-center text-[#075fe5] max-[600px]:h-7 max-[600px]:w-7">
                <a.icon
                  className={cn("block h-7 w-7 max-[600px]:h-6 max-[600px]:w-6", a.primary && "text-white")}
                  size={28}
                  strokeWidth={1.8}
                />
              </span>
              <span>
                <strong className="block text-[10px] max-[600px]:text-[9px]">{a.title}</strong>
                <p className="mt-1 text-[8px] leading-[1.3] opacity-90 max-[600px]:text-[7px]">{a.text}</p>
              </span>
              <span className="ml-auto text-[20px]" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-[13px] grid grid-cols-[1.55fr_0.85fr] gap-3 max-[1120px]:grid-cols-[1fr]">
          <section className={cn(card, "px-[17px] py-[14px]", "max-[600px]:p-3")}>
            <div className="flex items-center justify-between gap-[10px]">
              <h2 className="text-[17px] font-extrabold text-[#092c9b] max-[600px]:text-[14px]">▣ &nbsp;Event Programme</h2>
              <Link className="whitespace-nowrap text-[10px] font-bold text-[#075fe5]" to="/programme">
                View Full Programme &nbsp;→
              </Link>
            </div>
            <div className="mb-2 mt-[11px] flex gap-2 max-[600px]:overflow-auto">
              {dayTabs.length === 0 ? (
                <span className="text-[10px] text-[#657698]">No programme days published yet.</span>
              ) : (
                dayTabs.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={cn(
                      "grid h-[31px] min-w-[125px] cursor-pointer place-items-center rounded-[7px] text-[9px] font-semibold [font-family:inherit] max-[600px]:min-w-[100px]",
                      day === d.id ? "bg-[#075fe5] text-white" : "bg-[#f1f6fc] text-[#07164d]",
                    )}
                    onClick={() => setDay(d.id)}
                  >
                    {d.label}
                  </button>
                ))
              )}
            </div>
            {(engagement?.programme as any[])
              ?.filter((s) => String(s.day ?? "1") === day)
              ?.map((s) => (
              <div
                key={s.id}
                className="grid min-h-[47px] grid-cols-[100px_1fr_75px] items-center gap-[10px] border-t border-[#e2eaf3] text-[9px] max-[600px]:grid-cols-[70px_1fr_55px] max-[600px]:text-[8px]"
              >
                <span className="text-[#25448d]">{s.time}</span>
                <span>
                  <strong className="block text-[10px] font-medium text-[#07164d] max-[600px]:text-[9px]">{s.title}</strong>
                  <small className="mt-[3px] block text-[#657698] max-[600px]:text-[7px]">{s.place}</small>
                </span>
                <span
                  className={cn(
                    "justify-self-end rounded-[7px] px-3 py-[5px] text-[8px] font-bold max-[600px]:px-[7px] max-[600px]:py-1",
                    s.tone === "green" ? "bg-[#dcf6e7] text-[#087747]" : "bg-[#e5f0ff] text-[#0757d1]",
                  )}
                >
                  {s.badge}
                </span>
              </div>
            ))}
          </section>

          <div className="flex flex-col gap-[11px] max-[600px]:block">
            <section className={cn(card, "overflow-hidden max-[600px]:mt-[10px]")}>
              <div
                className="h-[89px] [background:url('/assets/dashboard-venue.jpg')_center/cover] max-[600px]:h-[105px]"
                role="img"
                aria-label="KICC venue"
              />
              <div className="px-[15px] py-[9px]">
                <h3 className="mb-2 text-[16px] font-extrabold text-[#092c9b]">Venue Information</h3>
                <p className="mb-2 text-[9px] leading-[1.35] text-[#07164d]">
                  📍 &nbsp; {engagement?.venue || event.venue}, {engagement?.city || event.city}
                </p>
                <Link
                  className="inline-flex h-[29px] w-full items-center justify-center rounded-[5px] border border-[#075fe5] bg-white text-[9px] font-bold text-[#075fe5] no-underline"
                  to="/venue"
                >
                  View Venue Details &nbsp; →
                </Link>
              </div>
            </section>
            <section className="rounded-lg bg-[#edf6ff] px-[15px] py-[13px] max-[600px]:mt-[10px]">
              <h3 className="mb-[5px] text-[13px] font-extrabold">Need Assistance?</h3>
              <p className="mb-[6px] text-[9px] text-[#657698]">For support, please contact us:</p>
              <a className="mt-1 inline-block text-[10px] text-[#075fe5]" href={`mailto:${event.supportEmail}`}>
                ✉ &nbsp; {event.supportEmail}
              </a>
              <br />
              <a className="mt-1 inline-block text-[10px] text-[#075fe5]" href={`tel:${event.supportPhone}`}>
                ☎ &nbsp; {event.supportPhone}
              </a>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
