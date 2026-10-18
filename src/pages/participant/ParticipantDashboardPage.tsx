import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  Hash,
  Mail,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import { ProgrammeSchedule } from "../../components/programme/ProgrammeSchedule";
import { SpeakersDirectory } from "../../components/speakers/SpeakersDirectory";
import { useEventCopy } from "../../i18n/useEventCopy";
import { cn } from "../../lib/cn";
import {
  getParticipantSession,
  refreshParticipantSession,
  type ParticipantSession,
} from "../../lib/participantAuth";
import { getEngagement } from "../../lib/engagements";
import { engagementToPublicProgramme, engagementToPublicSpeakers } from "../../lib/publicEvent";
import { API_BASE_URL, ApiError, TENANT_ID } from "../../lib/api";
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

type DashboardTab = "programme" | "speakers" | "venue";

const dashboardTabs: Array<{
  id: DashboardTab;
  title: string;
  text: string;
  icon: typeof CalendarDays;
}> = [
  {
    id: "programme",
    title: "View Programme",
    text: "Explore sessions and schedules",
    icon: CalendarDays,
  },
  {
    id: "speakers",
    title: "Meet the Speakers",
    text: "View speaker profiles",
    icon: Users,
  },
  {
    id: "venue",
    title: "Venue Information",
    text: "Venue details and travel tips",
    icon: MapPin,
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
  const { passCode } = session as ParticipantSession;
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("programme");
  const programme = useMemo(() => engagementToPublicProgramme(engagement), [engagement]);
  const speakers = useMemo(() => engagementToPublicSpeakers(engagement), [engagement]);

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
                  {passCode && (
                    <img
                      className="block h-[112px] w-[112px] [image-rendering:pixelated] max-[600px]:h-[130px] max-[600px]:w-[130px]"
                      src={passCode? `${API_BASE_URL}/ticketing/${passCode}/qrcode?tenant-id=${TENANT_ID}` : '/assets/qr-ticket.png'}
                      alt="Event pass QR code"
                    />
                  )}
                </div>
                <button
                  type="button"
                  className="mt-[9px] h-[38px] w-[150px] cursor-pointer rounded-[5px] bg-[#edf6ff] text-[11px] font-semibold text-[#0755d2] [font-family:inherit] max-[600px]:w-full"
                  onClick={() => {
                    if (!passCode) return;
                    const link = document.createElement("a");
                    link.href = `${API_BASE_URL}/ticketing/${passCode}/event-pass?tenant-id=${TENANT_ID}`;
                    link.target="_blank"
                    link.download = `ticket-${passCode}.pdf`;
                    link.click();
                  }}>
                  ⇩ &nbsp; Download Event Pass
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

        <div
          className="mt-[14px] grid grid-cols-[repeat(3,1fr)] gap-[9px] max-[850px]:grid-cols-[1fr] max-[600px]:gap-[7px]"
          role="tablist"
          aria-label="Dashboard sections"
        >
          {dashboardTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn(
                  "flex min-h-[73px] cursor-pointer items-center gap-[13px] rounded-[7px] border-0 px-[14px] py-[11px] text-left [font-family:inherit] max-[600px]:min-h-[69px] max-[600px]:p-[9px]",
                  active
                    ? "text-white [background:linear-gradient(135deg,#0766f0,#0750d5)]"
                    : "bg-[#edf6ff] text-[#07164d]",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <span
                  className={cn(
                    "grid h-[34px] w-[34px] flex-none place-items-center max-[600px]:h-7 max-[600px]:w-7",
                    active ? "text-white" : "text-[#075fe5]",
                  )}
                >
                  <tab.icon
                    className="block h-7 w-7 max-[600px]:h-6 max-[600px]:w-6"
                    size={28}
                    strokeWidth={1.8}
                  />
                </span>
                <span>
                  <strong className="block text-[10px] max-[600px]:text-[9px]">{tab.title}</strong>
                  <p className="mt-1 text-[8px] leading-[1.3] opacity-90 max-[600px]:text-[7px]">{tab.text}</p>
                </span>
                <span className="ml-auto text-[20px]" aria-hidden>
                  →
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "programme" ? (
          <section className={cn(card, "mt-[13px] overflow-hidden px-[17px] pt-[14px]", "max-[600px]:px-3 max-[600px]:pt-3")}>
            <div className="mb-1 flex items-center justify-between gap-[10px]">
              <h2 className="text-[17px] font-extrabold text-[#092c9b] max-[600px]:text-[14px]">
                <CalendarDays className="mr-1.5 inline-block h-[18px] w-[18px] align-[-3px] text-[#075fe5]" />
                Event Programme
              </h2>
              <Link className="whitespace-nowrap text-[10px] font-bold text-[#075fe5]" to="/programme">
                View Full Programme &nbsp;→
              </Link>
            </div>
            <ProgrammeSchedule
              programme={programme}
              containerClassName="w-full"
              emptyMessage="No programme sessions have been published for this event yet."
            />
          </section>
        ) : null}

        {activeTab === "speakers" ? (
          <section className={cn(card, "mt-[13px] overflow-hidden px-[17px] pt-[14px]", "max-[600px]:px-3 max-[600px]:pt-3")}>
            <div className="mb-1 flex items-center justify-between gap-[10px]">
              <h2 className="text-[17px] font-extrabold text-[#092c9b] max-[600px]:text-[14px]">
                <Users className="mr-1.5 inline-block h-[18px] w-[18px] align-[-3px] text-[#075fe5]" />
                Speakers
              </h2>
              <Link className="whitespace-nowrap text-[10px] font-bold text-[#075fe5]" to="/speakers">
                View All Speakers &nbsp;→
              </Link>
            </div>
            <SpeakersDirectory speakers={speakers} containerClassName="w-full" columns={3} />
          </section>
        ) : null}

        {activeTab === "venue" ? (
          <section className={cn(card, "mt-[13px] overflow-hidden")}>
            <div
              className="h-[140px] [background:url('/assets/dashboard-venue.jpg')_center/cover] max-[600px]:h-[120px]"
              role="img"
              aria-label={engagement?.venue || event.venue || "Event venue"}
            />
            <div className="px-[17px] py-[14px] max-[600px]:p-3">
              <h2 className="mb-2 text-[17px] font-extrabold text-[#092c9b] max-[600px]:text-[14px]">
                Venue Information
              </h2>
              <p className="mb-3 text-[11px] leading-[1.4] text-[#07164d]">
                {[engagement?.venue || event.venue, engagement?.city || event.city, engagement?.country]
                  .filter(Boolean)
                  .join(", ") || "Venue to be announced"}
              </p>
              {engagement?.venueAddress ? (
                <p className="mb-3 text-[10px] text-[#657698]">{engagement.venueAddress}</p>
              ) : null}
              <Link
                className="inline-flex h-[33px] items-center justify-center rounded-[5px] border border-[#075fe5] bg-white px-4 text-[10px] font-bold text-[#075fe5] no-underline"
                to="/venue"
              >
                View Venue Details &nbsp; →
              </Link>
            </div>
          </section>
        ) : null}

        <div className="mt-3">
          <section className="rounded-lg bg-[#edf6ff] px-[15px] py-[13px]">
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
      </section>
    </>
  );
}
