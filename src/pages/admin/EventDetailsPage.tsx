import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  LayoutGrid,
  Mail,
  MapPin,
  Mic2,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Ticket,
  Timer,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { PaymentsDashboard } from "../../components/admin/PaymentsDashboard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  communicationCampaigns,
  communicationChannelCounts,
  communicationSegments,
  communicationTemplates,
  draftSpeakers,
  eventDetail,
  eventDetailTabs,
  eventParticipants,
  eventSchedule,
  eventSponsors,
  eventTickets,
  participantCountries,
  participantDistribution,
  participantMix,
  sponsorCategories,
  sponsorTierBreakdown,
  topSponsors,
} from "../../data/adminEvents";
import {
  engagementSpeakerToCard,
  SpeakerCardGrid,
} from "../../components/speakers/SpeakerCard";
import { ApiError } from "../../lib/api";
import {
  asProgramme,
  asSpeakers,
  asSponsors,
  asStringList,
  asTickets,
  formatEngagementStatusLabel,
  formatModeLabel,
  getEngagement,
  toUiEventType,
} from "../../lib/engagements";
import { cn } from "../../lib/cn";
import type {
  Engagement,
  EngagementSpeaker,
  EngagementSponsor,
  EngagementTicket,
} from "../../types/engagement";

const kpiIcon = {
  blue: Users,
  green: CheckCircle2,
  purple: Mic2,
  orange: Building2,
  red: Wallet,
} as const;

const sparkStroke = {
  blue: "#0964ea",
  green: "#08a268",
  purple: "#8b2de8",
  orange: "#ff9700",
  red: "#ed1c2e",
} as const;

/* ---- Event details (overview) styling tokens ---- */
const edCardBase =
  "rounded-[9px] border border-[#dfeaf4] p-[14px] shadow-[0_2px_8px_rgba(57,119,173,.03)] max-[500px]:p-[11px]";
const edCard = `${edCardBase} bg-white`;
const edCh =
  "mb-3 flex items-center gap-3 border-b border-[#dfe8f2] pb-2.5 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-extrabold [&_h2]:text-[#09165f]";
const edCi = "grid place-items-center text-[#0764e8]";
const edBtnBase =
  "inline-flex cursor-pointer items-center whitespace-nowrap border border-[#1267ee] font-[inherit] font-semibold no-underline";
const edBtn = `${edBtnBase} h-[37px] gap-1.5 rounded-md bg-white px-[13px] text-[10px] !text-[#0764e8] hover:bg-[#f3f8ff]`;
const edBtnPrimary = `${edBtnBase} h-[37px] gap-1.5 rounded-md border-[#0764e8] bg-[#0764e8] px-[13px] text-[10px] !text-white shadow-[0_4px_12px_rgba(7,100,232,.22)] hover:bg-[#0658cf]`;
const edEdit = `${edBtnBase} ml-auto h-7 gap-1.5 rounded-[5px] bg-white px-2.5 text-[9px] !text-[#0764e8] hover:bg-[#f3f8ff]`;
const edLinkAll = "ml-auto text-[9px] font-semibold !text-[#0864e8] no-underline hover:underline";
const edRow =
  "grid grid-cols-[92px_1fr] items-start gap-2 max-[500px]:grid-cols-[78px_1fr] [&_b]:font-bold [&_b]:text-[#09165f] [&_span]:leading-[1.4] [&_span]:text-[#566b9c]";
const edMi = "flex items-start gap-2.5 text-[10px] [&_b]:block [&_b]:font-bold [&_b]:text-[#09165f] [&_small]:mt-[3px] [&_small]:block [&_small]:text-[10px] [&_small]:text-[#63749b]";
const edMiIco = "grid h-7 w-7 flex-none place-items-center rounded-lg bg-[#eaf4ff] text-[#0764e8]";
const edPillBase = "inline-block rounded-md px-[9px] py-[5px] text-[9px] font-bold";
const edPill = `${edPillBase} bg-[#c9f2dd] text-[#08784a]`;
const edPillPending = `${edPillBase} bg-[#fff0d2] text-[#cf7900]`;
const edStrow =
  "grid grid-cols-[125px_1fr] gap-2 [&_b]:font-bold [&_b]:text-[#09165f] [&>span:not([class])]:text-[#5068a0]";
const edQuickLink =
  "mb-[7px] flex h-[41px] items-center gap-2.5 rounded-[7px] border border-[#dce8f4] bg-[#f7fbff] px-[11px] text-[10px] font-semibold !text-[#09165f] no-underline hover:border-[#c5daf0] hover:bg-[#eef6ff] [&_b]:ml-auto [&_b]:font-bold [&_b]:text-[#0764e8]";
const edQuickIco = "grid place-items-center text-[#079653]";
const edTh = "bg-[#edf5fc] p-[7px] text-left font-bold text-[#09165f]";
const edTd =
  "border-b border-[#e1ebf5] p-1.5 text-[#51689d] first:font-semibold first:text-[#0764e8]";
const edStatTone = {
  blue: "bg-[#eaf4ff] text-[#0764e8]",
  green: "bg-[#e6faef] text-[#079653]",
  purple: "bg-[#f2eaff] text-[#8b2de8]",
  orange: "bg-[#fff0d5] text-[#ff9700]",
  red: "bg-[#ffe9eb] text-[#ed1c2e]",
} as const;

/* ---- Ticket management tab styling tokens ---- */
const tmPanel =
  "min-w-0 overflow-hidden rounded-[9px] border border-[#e1edfb] bg-[rgba(255,255,255,.88)] shadow-[0_2px_8px_rgba(42,102,178,.035)]";
const tmPanelIcon = "grid place-items-center text-[#0757f5]";
const tmHead = (small = false) =>
  cn(
    "flex items-center gap-3 border-b border-[#e7f0fb] [&_h2]:m-0 [&_h2]:font-extrabold [&_h2]:text-[#07135f]",
    small
      ? "h-[38px] px-[15px] [&_h2]:text-[13px]"
      : "h-[55px] px-[18px] max-[560px]:px-3 [&_h2]:text-base [&_h2]:tracking-[-0.3px] max-[560px]:[&_h2]:text-sm",
  );
const tmTableWrap = (small = false) =>
  cn("overflow-x-auto px-3 pb-3", !small && "max-[560px]:px-2 max-[560px]:pb-2.5");
const tmTable = (small = false) =>
  cn(
    "w-full border-separate border-spacing-0 text-[#263e9a]",
    small ? "min-w-[390px] text-[11px]" : "min-w-[680px] text-xs",
  );
const tmTh = (small = false) =>
  cn(
    "whitespace-nowrap border-y border-[#dce9fb] bg-[#edf6ff] px-2 text-center font-bold text-[#07165e] first:rounded-tl-[5px] first:border-l last:rounded-tr-[5px] last:border-r",
    small ? "h-[27px] text-[10px]" : "h-[35px]",
  );
const tmTdBase = (small = false) =>
  cn(
    "border-b border-[#e0ecfa] first:border-l first:font-bold last:border-r",
    small ? "h-[25px] px-1.5 py-[3px]" : "h-[45px] px-2 py-[5px]",
  );
const tmTd = (small = false) => cn(tmTdBase(small), "whitespace-nowrap text-center");
const tmTdLeft = (small = false) => cn(tmTdBase(small), "whitespace-nowrap text-left");
const tmTbody =
  "[&_tr:last-child_td:first-child]:rounded-bl-[5px] [&_tr:last-child_td:last-child]:rounded-br-[5px]";
const tmMini =
  "grid h-[29px] w-[31px] cursor-pointer place-items-center rounded-[5px] border border-[#dbe8fb] bg-white font-[inherit] text-[#061c96] hover:bg-[#f3f8ff]";
const tmEmpty = "border-b border-[#e0ecfa] px-3 py-[22px] text-center font-medium text-[#8a9bb8]";
const tmPillBase = "inline-block rounded-md px-[11px] py-[5px] font-bold";
const tmStatTone = {
  blue: "bg-[#e7f2ff] text-[#0870ff]",
  green: "bg-[#e6faef] text-[#00974e]",
  amber: "bg-[#fff4df] text-[#ff9200]",
  purple: "bg-[#f6eaff] text-[#ad00f5]",
  red: "bg-[#ffeded] text-[#f52836]",
} as const;

function formatRange(startIso?: string, endIso?: string) {
  if (!startIso) return "—";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const a = start.toLocaleDateString("en-GB", opts);
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) return a;
  return `${start.getDate()} - ${end.toLocaleDateString("en-GB", opts)}`;
}

function formatTimeRange(startIso?: string, endIso?: string, timezone?: string) {
  if (!startIso) return "";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  if (Number.isNaN(start.getTime())) return "";
  const t = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  const zone = timezone ? ` (${timezone})` : "";
  if (!end || Number.isNaN(end.getTime())) return `${t(start)}${zone}`;
  return `${t(start)} - ${t(end)}${zone}`;
}

function formatWhen(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function looksLikeId(value?: string) {
  if (!value) return true;
  return /^[a-f0-9]{24}$/i.test(value.trim()) || /^[0-9a-f-]{32,}$/i.test(value.trim());
}

function humanActor(preferred?: string, fallback?: string) {
  if (preferred && !looksLikeId(preferred)) return preferred;
  if (fallback && !looksLikeId(fallback)) return fallback;
  return "Administrator";
}

function scheduleStamp(startIso: string | undefined, index: number, dayHint?: number | string) {
  if (startIso) {
    const base = new Date(startIso);
    if (!Number.isNaN(base.getTime())) {
      const offset = typeof dayHint === "number" && dayHint > 0 ? dayHint - 1 : index;
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      return {
        month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        day: String(d.getDate()),
      };
    }
  }
  return {
    month: "DAY",
    day: String(dayHint ?? index + 1),
  };
}

type DetailView = {
  name: string;
  statusLabel: string;
  theme: string;
  type: string;
  category: string;
  dates: string;
  time: string;
  mode: string;
  venue: string;
  venueTitle: string;
  venueCity: string;
  email: string;
  phone: string;
  description: string;
  descriptionExtra: string;
  createdBy: string;
  createdOn: string;
  lastUpdated: string;
  visibility: string;
  registration: string;
  payment: string;
  website: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  cover: string;
  organizer: string;
  programme: ReturnType<typeof asProgramme>;
  startDate?: string;
};

function toDetailView(engagement: Engagement | null): DetailView {
  if (!engagement) {
    return {
      name: eventDetail.name,
      statusLabel: eventDetail.status,
      theme: eventDetail.theme.replace(/\.$/, ""),
      type: eventDetail.type,
      category: eventDetail.category,
      dates: eventDetail.dates.replace("–", "-"),
      time: eventDetail.time.replace("–", "-"),
      mode: eventDetail.mode,
      venue: eventDetail.venue,
      venueTitle: "Kenyatta International Convention Centre (KICC)",
      venueCity: "Nairobi, Kenya",
      email: eventDetail.email,
      phone: eventDetail.phone,
      description: eventDetail.description,
      descriptionExtra: eventDetail.descriptionExtra,
      createdBy: eventDetail.createdBy,
      createdOn: eventDetail.createdOn,
      lastUpdated: eventDetail.lastUpdated,
      visibility: eventDetail.visibility,
      registration: eventDetail.registration,
      payment: eventDetail.payment,
      website: eventDetail.website,
      facebook: eventDetail.facebook,
      twitter: eventDetail.twitter,
      linkedin: eventDetail.linkedin,
      cover: eventDetail.cover,
      organizer: eventDetail.organizer,
      programme: [],
      startDate: undefined,
    };
  }

  const themes = asStringList(engagement.themes);
  const objectives = asStringList(engagement.objectives);
  const cityLine = [engagement.city, engagement.country].filter(Boolean).join(", ");

  const theme =
    engagement.shortDescription?.trim() ||
    themes[0] ||
    eventDetail.theme.replace(/\.$/, "");

  return {
    name: engagement.engagementName || eventDetail.name,
    statusLabel: formatEngagementStatusLabel(engagement.status),
    theme,
    type: toUiEventType(engagement.engagementType),
    category: engagement.category
      ? engagement.category.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "—",
    dates: formatRange(engagement.startDate, engagement.endDate),
    time: formatTimeRange(engagement.startDate, engagement.endDate, engagement.timezone),
    mode: formatModeLabel(engagement.mode),
    venue:
      [engagement.venue, engagement.city, engagement.country].filter(Boolean).join(", ") || "—",
    venueTitle: engagement.venue || "—",
    venueCity: cityLine || "—",
    email: engagement.contactEmail || "—",
    phone: engagement.contactPhone || "—",
    description: engagement.description || engagement.shortDescription || "—",
    descriptionExtra: objectives.join(" · "),
    createdBy: humanActor(engagement.contactName, engagement.createdBy),
    createdOn: formatWhen(engagement.createdAt),
    lastUpdated: formatWhen(engagement.updatedAt),
    visibility: engagement.visibility
      ? engagement.visibility.replace(/\b\w/g, (c) => c.toUpperCase())
      : "—",
    registration: engagement.registrationEnabled ? "Open" : "Closed",
    payment: engagement.paymentEnabled ? "Enabled" : "Disabled",
    website: engagement.websiteUrl || "",
    facebook: engagement.facebookUrl || "",
    twitter: engagement.twitterUrl || "",
    linkedin: engagement.linkedinUrl || "",
    cover: engagement.bannerImage || engagement.logo || eventDetail.cover,
    organizer: engagement.contactName || "Anti-Counterfeit Authority",
    programme: asProgramme(engagement.programme),
    startDate: engagement.startDate,
  };
}

/** Screen E Event Details — structure from isippe3-event-details HTML package */
export function EventDetailsPage() {
  const { id = "isippe-3", tab = "overview" } = useParams();
  const navigate = useNavigate();
  const validTab = eventDetailTabs.some((t) => t.id === tab) ? tab : "overview";
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await getEngagement(id);
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
  }, [id]);

  const detail = useMemo(() => {
    if (engagement) return toDetailView(engagement);
    // Avoid flashing design-mock content while a live engagement is loading.
    if (loading) {
      return {
        ...toDetailView(null),
        name: "Loading event…",
        theme: "",
        description: "",
        descriptionExtra: "",
        website: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        programme: [],
      } satisfies DetailView;
    }
    return toDetailView(null);
  }, [engagement, loading]);
  const fromApi = Boolean(engagement);

  const speakers = useMemo(() => asSpeakers(engagement?.speakers), [engagement]);
  const sponsors = useMemo(() => asSponsors(engagement?.sponsors), [engagement]);
  const tickets = useMemo(() => asTickets(engagement?.tickets), [engagement]);

  const kpis = useMemo(() => {
    // Live engagements: only show real/zero stats — never design mock numbers.
    const registered = Number(engagement?.registered ?? 0);

    return [
      {
        label: "Total Registrations",
        value: fromApi ? registered.toLocaleString() : "1,248",
        trend: fromApi ? "—" : "↑ 12%",
        tone: "blue" as const,
      },
      {
        label: "Confirmed Participants",
        value: fromApi ? registered.toLocaleString() : "1,102",
        trend: fromApi ? "—" : "↑ 18%",
        tone: "green" as const,
      },
      {
        label: "Speakers",
        value: fromApi ? String(speakers.length) : "28",
        trend: fromApi ? "—" : "↑ 7%",
        tone: "purple" as const,
      },
      {
        label: "Sponsors & Exhibitors",
        value: fromApi ? String(sponsors.length) : "40",
        trend: fromApi ? "—" : "↑ 21%",
        tone: "orange" as const,
      },
      {
        label: "Total Revenue",
        value: fromApi ? "KES 0" : "KES 2,740,000",
        trend: fromApi ? "—" : "↑ 14%",
        tone: "red" as const,
      },
    ];
  }, [engagement, fromApi, speakers.length, sponsors.length]);

  if (tab === "reports") {
    return <Navigate to={`/admin/events/${id}/reports`} replace />;
  }

  return (
    <div className="min-w-0 flex-1 bg-[radial-gradient(ellipse_at_12%_10%,#e0f0ff_0,#f4faff_48%,#e4f2ff_100%)] p-4 text-[#09165f] max-[820px]:p-[9px]">
      {error ? (
        <div
          className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="status"
        >
          {error} Showing placeholder content where needed.
        </div>
      ) : null}
      {loading ? (
        <p className="mb-3 text-sm text-mute">Loading event…</p>
      ) : null}

      <div className="mb-2.5 ml-2 flex min-h-[30px] flex-wrap items-center gap-[15px] text-[11px] text-[#244582] [&>b]:font-bold [&>b]:text-[#09165f]">
        <Link
          to="/admin/events"
          className="inline-grid place-items-center !text-[#244582] no-underline hover:!text-[#0764e8]"
          aria-label="Back to events"
        >
          <ArrowLeft size={18} />
        </Link>
        <b>Events</b>
        <span className="opacity-[.55]">›</span>
        <span>{detail.name}</span>
        <div className="ml-auto flex flex-wrap gap-2 max-[1150px]:ml-0 max-[1150px]:w-full">
          <button type="button" className={edBtn}>
            <Eye size={12} /> Preview Event
          </button>
          <Link to={`/admin/events/${id}/edit`} className={edBtnPrimary}>
            <Pencil size={12} /> Edit Event
          </Link>
          <button type="button" className={edBtn}>
            <MoreHorizontal size={12} /> More Actions
            <ChevronRight size={12} className="rotate-90" />
          </button>
        </div>
      </div>

      <div className="flex items-stretch gap-4 rounded-xl border border-[#dfeaf4] bg-[linear-gradient(135deg,#fff_0%,#f7fbff_100%)] px-3.5 py-3 shadow-[0_2px_10px_rgba(57,119,173,.05)] max-[1150px]:flex-wrap max-[820px]:block">
        <div className="h-[118px] w-[300px] flex-none self-center overflow-hidden rounded-[9px] border border-[#dce8f4] bg-[#09165f] max-[820px]:mt-2.5 max-[820px]:h-[145px] max-[820px]:w-full">
          <img src={detail.cover} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="my-[3px] flex flex-wrap items-center gap-2 text-[25px] font-extrabold tracking-[-0.7px] text-[#09165f] max-[500px]:text-[22px]">
            {detail.name}
            <span className="ml-1 inline-block rounded-md bg-[#c9f2dd] px-2.5 py-[7px] align-middle text-[10px] font-bold text-[#08784a]">{detail.statusLabel}</span>
          </h1>
          <div className="mb-[13px] line-clamp-2 max-w-[720px] overflow-hidden text-xs text-[#63749b]">{detail.theme}</div>
          <div className="flex flex-wrap gap-[30px] max-[500px]:flex-col max-[500px]:gap-2">
            <div className={edMi}>
              <span className={edMiIco}>
                <CalendarDays size={14} />
              </span>
              <div>
                <b>{detail.dates}</b>
                <small>{detail.time}</small>
              </div>
            </div>
            <div className={edMi}>
              <span className={edMiIco}>
                <MapPin size={14} />
              </span>
              <div>
                <b>{detail.venueTitle}</b>
                <small>{detail.venueCity}</small>
              </div>
            </div>
            <div className={edMi}>
              <span className={edMiIco}>
                <Users size={14} />
              </span>
              <div>
                <b>{detail.mode} Event</b>
                <small>{detail.type}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {validTab === "overview" ? (
        <div className="my-3 grid grid-cols-5 gap-2.5 max-[820px]:grid-cols-2 max-[500px]:grid-cols-1">
          {kpis.map((kpi, kpiIdx) => {
            const Icon = kpiIcon[kpi.tone];
            const mutedTrend = fromApi && (kpi.trend === "—" || kpi.value === "0" || kpi.value === "KES 0");
            return (
              <div
                key={kpi.label}
                className={cn(
                  "flex min-h-[105px] gap-2.5 rounded-[9px] border border-[#e0eaf5] bg-[linear-gradient(135deg,#fff,#f8fcff)] p-[13px] shadow-[0_2px_8px_rgba(57,119,173,.05)]",
                  kpiIdx === kpis.length - 1 && "max-[820px]:col-span-2 max-[500px]:col-auto",
                )}
              >
                <div
                  className={cn(
                    "grid h-[58px] w-[58px] flex-none place-items-center rounded-xl",
                    edStatTone[kpi.tone],
                  )}
                >
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[18px] font-extrabold leading-[1.15] text-[#09165f]">{kpi.value}</div>
                  <div className="mt-[3px] text-[10px] text-[#63749b]">{kpi.label}</div>
                  <div
                    className={cn(
                      "mt-[7px] text-[11px]",
                      mutedTrend ? "font-semibold text-[#9aabc4]" : "font-bold text-[#079653]",
                    )}
                  >{kpi.trend}</div>
                  <svg
                    viewBox="0 0 120 32"
                    className={cn("mt-1.5 h-[22px] w-full", mutedTrend && "opacity-[.35]")}
                    aria-hidden
                  >
                    <polyline
                      fill="none"
                      strokeWidth="2"
                      stroke={sparkStroke[kpi.tone]}
                      points="0,24 20,20 40,22 60,14 80,16 100,8 120,10"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <nav
        className="mb-3 flex h-[39px] overflow-auto rounded-[9px] border border-[#e1eaf4] bg-white [scrollbar-width:thin]"
        aria-label="Event sections"
      >
        {eventDetailTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cn(
              "relative flex min-w-max cursor-pointer items-center justify-center whitespace-nowrap border-0 bg-transparent px-[27px] font-[inherit] text-[10px] max-[500px]:px-[13px]",
              validTab === t.id
                ? "font-bold text-[#0764e8] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#0764e8] after:content-['']"
                : "text-[#26468e]",
            )}
            onClick={() => {
              if (t.id === "reports") navigate(`/admin/events/${id}/reports`);
              else navigate(`/admin/events/${id}/${t.id}`);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {validTab === "overview" ? <OverviewTab id={id} detail={detail} fromApi={fromApi} /> : null}
      {validTab === "tickets" ? (
        <div className="mt-1">
          <TicketsTab tickets={tickets} fromApi={fromApi} loading={loading} />
        </div>
      ) : null}
      {validTab === "participants" ? (
        <div className="mt-1">
          <ParticipantsTab fromApi={fromApi} loading={loading} />
        </div>
      ) : null}
      {validTab === "programme" ? (
        <div className="mt-1">
          <ProgrammeTab programme={detail.programme} />
        </div>
      ) : null}
      {validTab === "speakers" ? (
        <div className="mt-1">
          <SpeakersTab speakers={speakers} fromApi={fromApi} />
        </div>
      ) : null}
      {validTab === "sponsors" || validTab === "exhibitors" ? (
        <div className="mt-1">
          <SponsorsTab
            sponsors={sponsors}
            fromApi={fromApi}
            loading={loading}
            mode={validTab === "exhibitors" ? "exhibitors" : "sponsors"}
          />
        </div>
      ) : null}
      {validTab === "communications" ? (
        <div className="mt-1">
          <CommunicationsTab fromApi={fromApi} loading={loading} email={detail.email} phone={detail.phone} />
        </div>
      ) : null}
      {validTab === "payments" ? (
        <div className="mt-1">
          <EventPaymentsTab fromApi={fromApi} loading={loading} />
        </div>
      ) : null}
      {validTab === "settings" ? (
        <div className="mt-1">
          <Card>
            <h2 className="mb-4 text-lg font-bold text-ink">Event Settings</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Visibility", detail.visibility],
                ["Registration", detail.registration],
                ["Payment", detail.payment],
                ["Mode", detail.mode],
                ["Category", detail.category],
                ["Organizer", detail.organizer],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                  <dt className="text-mute">{k}</dt>
                  <dd className="font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <Link to={`/admin/events/${id}/edit`} className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Edit Event <ArrowRight size={14} />
              </Button>
            </Link>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function OverviewTab({
  id,
  detail,
  fromApi,
}: {
  id: string;
  detail: DetailView;
  fromApi: boolean;
}) {
  const schedule =
    detail.programme.length > 0
      ? detail.programme.map((s, i) => {
          const stamp = scheduleStamp(detail.startDate, i, s.day);
          return {
            key: s.id || `${s.title}-${i}`,
            month: stamp.month,
            day: stamp.day,
            title: s.title,
            time: s.time || [s.startTime, s.endTime].filter(Boolean).join(" - ") || "—",
            place: s.venue || s.place || "—",
          };
        })
      : fromApi
        ? []
        : eventSchedule.map((s) => ({
            key: s.title,
            month: s.month,
            day: s.day,
            title: s.title,
            time: s.time,
            place: s.place,
          }));

  const registrations = fromApi ? [] : eventParticipants;

  const socialLinks = [
    { label: "Event Website", url: detail.website, icon: "◎" },
    { label: "Facebook", url: detail.facebook, icon: "f" },
    { label: "X (Twitter)", url: detail.twitter, icon: "X", x: true },
    { label: "LinkedIn", url: detail.linkedin, icon: "in" },
  ];

  const participantSlices = fromApi
    ? [
        { label: "Delegates", count: 0, value: 0, color: "#0964ea" },
        { label: "Speakers", count: 0, value: 0, color: "#08a268" },
        { label: "Exhibitors", count: 0, value: 0, color: "#ffae00" },
        { label: "Sponsors", count: 0, value: 0, color: "#a21ee5" },
      ]
    : participantMix;

  const participantTotal = fromApi
    ? 0
    : participantMix.reduce((sum, slice) => sum + slice.count, 0);

  const edSocialItem =
    "group grid grid-cols-[32px_1fr_12px] items-center gap-2 text-[9px] text-inherit no-underline";

  // Donut: conic-gradient stops built from the same slices as the legend.
  const donutBackground = (() => {
    const sliceSum = participantSlices.reduce((sum, slice) => sum + slice.value, 0);
    if (participantTotal === 0 || sliceSum <= 0) return "conic-gradient(#d7e5f5 0 100%)";
    let acc = 0;
    const stops = participantSlices.map((slice) => {
      const start = acc;
      acc = Math.min(acc + slice.value, 100);
      return `${slice.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  })();

  return (
    <>
      <div className="grid grid-cols-[1.75fr_.8fr_.7fr] gap-[11px] max-[1150px]:grid-cols-[1.4fr_.9fr] max-[820px]:grid-cols-1">
        <article className={edCard}>
          <div className={edCh}>
            <span className={edCi}>
              <LayoutGrid size={18} />
            </span>
            <h2>Event Information</h2>
            <Link to={`/admin/events/${id}/edit?step=2`} className={edEdit}>
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <div className="grid grid-cols-[1.25fr_.85fr] gap-x-[35px] gap-y-2.5 text-[10px] max-[820px]:grid-cols-1">
            <div className={edRow}>
              <b>Event Name</b>
              <span>{detail.name}</span>
            </div>
            <div className={edRow}>
              <b>Event Type</b>
              <span>{detail.type}</span>
            </div>
            <div className={edRow}>
              <b>Theme</b>
              <span>{detail.theme}</span>
            </div>
            <div className={edRow}>
              <b>Category</b>
              <span>{detail.category}</span>
            </div>
            <div className={edRow}>
              <b>Dates</b>
              <span>
                {detail.dates}
                <br />
                {detail.time}
              </span>
            </div>
            <div className={edRow}>
              <b>Mode</b>
              <span>{detail.mode}</span>
            </div>
            <div className={edRow}>
              <b>Venue</b>
              <span>{detail.venue}</span>
            </div>
            <div className={edRow}>
              <b>Organizer</b>
              <span>{detail.organizer}</span>
            </div>
            <div className={edRow}>
              <b />
              <span />
            </div>
            <div className={edRow}>
              <b>Contact Email</b>
              <span>{detail.email}</span>
            </div>
            <div className={edRow}>
              <b />
              <span />
            </div>
            <div className={edRow}>
              <b>Contact Phone</b>
              <span>{detail.phone}</span>
            </div>
          </div>
        </article>

        <article className={cn(edCardBase, "bg-[linear-gradient(135deg,#fff,#effcf5)]")}>
          <div className="flex items-center gap-3">
            <div className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-[#079653] text-white">
              <Check size={18} strokeWidth={3} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#09165f]">Event Status</div>
              <span className={edPill}>{detail.statusLabel}</span>
            </div>
          </div>
          <p className="mx-0 mb-[15px] mt-[9px] text-[10px] text-[#58709c]">
            {detail.registration === "Open"
              ? "This event is live and accepting registrations."
              : "Registration is currently closed for this event."}
          </p>
          <div className="grid gap-[7px] border-t border-[#cfe8dc] pt-2.5 text-[10px]">
            <div className={edStrow}>
              <b>Created By</b>
              <span>{detail.createdBy}</span>
            </div>
            <div className={edStrow}>
              <b>Created On</b>
              <span>{detail.createdOn}</span>
            </div>
            <div className={edStrow}>
              <b>Last Updated</b>
              <span>{detail.lastUpdated}</span>
            </div>
            <div className={edStrow}>
              <b>Visibility</b>
              <span>{detail.visibility}</span>
            </div>
            <div className={edStrow}>
              <b>Registration</b>
              <span className={edPill}>{detail.registration}</span>
            </div>
            <div className={edStrow}>
              <b>Payment</b>
              <span className={edPill}>{detail.payment}</span>
            </div>
          </div>
        </article>

        <article className={cn(edCard, "max-[1150px]:col-[1/3] max-[820px]:col-auto")}>
          <div className={edCh}>
            <span className={edCi}>
              <Zap size={18} />
            </span>
            <h2>Quick Actions</h2>
          </div>
          <Link to={`/admin/events/${id}/tickets`} className={edQuickLink}>
            <span className={edQuickIco}>
              <Ticket size={16} />
            </span>
            Manage Tickets
            <b>›</b>
          </Link>
          <Link to={`/admin/events/${id}/participants`} className={edQuickLink}>
            <span className={edQuickIco}>
              <Users size={16} />
            </span>
            View Participants
            <b>›</b>
          </Link>
          <Link to={`/admin/events/${id}/programme`} className={edQuickLink}>
            <span className={edQuickIco}>
              <LayoutGrid size={16} />
            </span>
            Generate Programme
            <b>›</b>
          </Link>
          <Link to={`/admin/events/${id}/communications`} className={edQuickLink}>
            <span className={edQuickIco}>
              <Mail size={16} />
            </span>
            Send Notifications
            <b>›</b>
          </Link>
        </article>

        <article
          className={cn(
            edCard,
            "col-[1] max-[820px]:col-auto [&_p]:mx-0 [&_p]:mb-2 [&_p]:mt-0 [&_p]:text-[10px] [&_p]:leading-[1.65] [&_p]:text-[#526896]",
          )}
        >
          <div className={edCh}>
            <span className={edCi}>
              <LayoutGrid size={18} />
            </span>
            <h2>Event Description</h2>
            <Link to={`/admin/events/${id}/edit?step=2`} className={edEdit}>
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <p>{detail.description}</p>
          {detail.descriptionExtra ? <p>{detail.descriptionExtra}</p> : null}
        </article>

        <article
          className={cn(
            edCard,
            "col-[2/4] max-[1150px]:col-[1/3] max-[820px]:col-auto",
          )}
        >
          <div className={edCh}>
            <span className={edCi}>
              <ArrowUpRight size={18} />
            </span>
            <h2>Social Media & Links</h2>
            <Link to={`/admin/events/${id}/edit?step=6`} className={edEdit}>
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-[13px] max-[820px]:grid-cols-1">
            {socialLinks.map((link) => {
              const hasUrl = Boolean(link.url);
              const inner = (
                <>
                  <i
                    className={cn(
                      "grid h-[30px] w-[30px] place-items-center rounded-full text-[11px] font-bold text-white",
                      link.x ? "bg-black" : "bg-[#0764e8]",
                    )}
                  >
                    {link.icon}
                  </i>
                  <div>
                    <div className="font-bold text-[#09165f]">{link.label}</div>
                    <div
                      className={cn(
                        "mt-[3px] break-all",
                        hasUrl
                          ? "text-[#0764e8] group-hover:underline"
                          : "italic text-[#8a9bb8]",
                      )}
                    >
                      {hasUrl ? link.url : "Not set — edit to add"}
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-[#63749b]" />
                </>
              );
              return hasUrl ? (
                <a
                  key={link.label}
                  href={link.url}
                  className={edSocialItem}
                  target="_blank"
                  rel="noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div key={link.label} className={cn(edSocialItem, "opacity-[.85]")}>
                  {inner}
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="mt-[11px] grid grid-cols-[1.35fr_1fr_.95fr] gap-[11px] max-[1150px]:grid-cols-2 max-[820px]:grid-cols-1">
        <article className={edCard}>
          <div className={edCh}>
            <span className={edCi}>
              <Users size={18} />
            </span>
            <h2>Recent Registrations</h2>
            <Link to={`/admin/events/${id}/participants`} className={edLinkAll}>
              View All →
            </Link>
          </div>
          <table className="w-full border-collapse text-[9px]">
            <thead>
              <tr>
                <th className={edTh}>Name</th>
                <th className={edTh}>Type</th>
                <th className={edTh}>Organization</th>
                <th className={edTh}>Status</th>
                <th className={edTh}>Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-[18px] text-center font-medium text-[#8a9bb8]">
                    No registrations yet — new sign-ups will appear here.
                  </td>
                </tr>
              ) : (
                registrations.map((p) => (
                  <tr key={p.name}>
                    <td className={edTd}>{p.name}</td>
                    <td className={edTd}>{p.type}</td>
                    <td className={edTd}>{p.org}</td>
                    <td className={edTd}>
                      <span className={p.status === "Confirmed" ? edPill : edPillPending}>
                        {p.status}
                      </span>
                    </td>
                    <td className={edTd}>{p.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>

        <article className={edCard}>
          <div className={edCh}>
            <span className={edCi}>
              <LayoutGrid size={18} />
            </span>
            <h2>Upcoming Schedule</h2>
            <Link to={`/admin/events/${id}/programme`} className={edLinkAll}>
              View All →
            </Link>
          </div>
          {schedule.length === 0 ? (
            <p className="text-sm text-mute">No sessions yet.</p>
          ) : (
            <div className="grid gap-[5px]">
              {schedule.map((s) => (
                <Link
                  key={s.key}
                  to={`/admin/events/${id}/programme`}
                  className="grid grid-cols-[40px_1fr_10px] items-center gap-[9px] border-b border-[#e2ebf4] py-1 text-inherit no-underline last:border-b-0"
                >
                  <div className="rounded-md bg-[#edf6ff] p-1 text-center text-[8px] font-bold leading-[1.2] text-[#0764e8]">
                    {s.month}
                    <br />
                    {s.day}
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#09165f]">{s.title}</div>
                    <div className="mt-[3px] text-[8px] text-[#687aa0]">
                      ◉ {s.time}　|　⌖ {s.place}
                    </div>
                  </div>
                  <span className="font-bold text-[#0764e8]">›</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className={cn(edCard, "max-[1150px]:col-[1/3] max-[820px]:col-auto")}>
          <div className={edCh}>
            <span className={edCi}>
              <Users size={18} />
            </span>
            <h2>Participant Overview</h2>
            <Link to={`/admin/events/${id}/participants`} className={edLinkAll}>
              View All →
            </Link>
          </div>
          <div className="flex items-center gap-5 max-[500px]:flex-col max-[500px]:justify-center">
            <div
              className="relative h-[140px] w-[140px] flex-none rounded-full after:absolute after:inset-[38px] after:rounded-full after:bg-white after:content-['']"
              style={{ background: donutBackground }}
            >
              <div className="absolute inset-0 z-[1] grid place-items-center text-center text-sm font-extrabold leading-[1.2] text-[#09165f] [&_small]:block [&_small]:text-[9px] [&_small]:font-semibold [&_small]:text-[#63749b]">
                {participantTotal.toLocaleString()}
                <small>Participants</small>
              </div>
            </div>
            <div className="grid gap-[11px] text-[9px] text-[#51689d]">
              {participantSlices.map((slice) => (
                <div key={slice.label}>
                  <i
                    className="mr-[7px] inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ background: slice.color }}
                  />
                  {slice.label}　{slice.count} ({slice.value}%)
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

type TicketRow = {
  id: string;
  name: string;
  blurb: string;
  priceKes: number;
  capacity: number;
  sold: number;
  status: string;
};

function parseKes(value?: string) {
  if (!value) return 0;
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function toTicketRows(tickets: EngagementTicket[], fromApi: boolean): TicketRow[] {
  if (fromApi) {
    return tickets.map((t, i) => ({
      id: t.id || `tk-${i + 1}`,
      name: t.name,
      blurb: t.period || "Event ticket",
      priceKes: parseKes(t.price),
      capacity: t.capacity || 0,
      sold: 0,
      status: "Active",
    }));
  }
  return eventTickets.map((t) => ({
    id: t.id,
    name: t.name,
    blurb: t.blurb,
    priceKes: parseKes(t.price),
    capacity: t.capacity,
    sold: t.sold,
    status: t.status,
  }));
}

function TicketsTab({
  tickets,
  fromApi,
  loading,
}: {
  tickets: EngagementTicket[];
  fromApi: boolean;
  loading: boolean;
}) {
  const live = fromApi || loading;
  const rows = toTicketRows(tickets, live);
  const capacity = rows.reduce((s, t) => s + t.capacity, 0);
  const sold = rows.reduce((s, t) => s + t.sold, 0);
  const remaining = Math.max(capacity - sold, 0);
  const paid = live ? 0 : 1102;
  const canceled = live ? 0 : 48;
  const soldPct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const remainPct = capacity > 0 ? Math.round((remaining / capacity) * 100) : 0;
  const totalRevenue = rows.reduce((s, t) => s + t.sold * t.priceKes, 0);

  const kpis = [
    {
      label: "Total Tickets",
      value: capacity.toLocaleString(),
      meta: live ? "—" : "↑ 12%",
      tone: "blue" as const,
      stroke: "#0757ff",
      Icon: Ticket,
    },
    {
      label: "Tickets Sold",
      value: sold.toLocaleString(),
      meta: live ? "—" : `${soldPct}%`,
      tone: "green" as const,
      stroke: "#00b65d",
      Icon: Check,
    },
    {
      label: "Tickets Remaining",
      value: remaining.toLocaleString(),
      meta: live ? "—" : `${remainPct}%`,
      tone: "amber" as const,
      stroke: "#ff9200",
      Icon: Timer,
    },
    {
      label: "Paid Attendees",
      value: paid.toLocaleString(),
      meta: live ? "—" : "88%",
      tone: "purple" as const,
      stroke: "#ad00f5",
      Icon: Users,
    },
    {
      label: "Canceled Tickets",
      value: canceled.toLocaleString(),
      meta: live ? "—" : "4%",
      tone: "red" as const,
      stroke: "#ff303c",
      Icon: X,
      metaRed: !live,
    },
  ];

  const topBySold = [...rows].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const byRevenue = [...rows].sort((a, b) => b.sold * b.priceKes - a.sold * a.priceKes);

  return (
    <div>
      <section className="mb-3 grid grid-cols-5 gap-2.5 max-[900px]:grid-cols-2 max-[560px]:gap-[7px]">
        {kpis.map((kpi, kpiIdx) => {
          const muted = live;
          return (
            <article
              key={kpi.label}
              className={cn(
                "relative flex h-[109px] min-w-0 items-start gap-[13px] overflow-hidden rounded-[9px] border border-[#e1edfb] bg-[rgba(255,255,255,.9)] px-3.5 py-[13px] shadow-[0_2px_8px_rgba(42,102,178,.04)] max-[1200px]:gap-2 max-[1200px]:px-[9px] max-[1200px]:py-[11px] max-[560px]:h-[92px] max-[560px]:gap-[7px] max-[560px]:px-2 max-[560px]:py-[9px]",
                kpiIdx === kpis.length - 1 && "max-[900px]:col-span-full",
              )}
            >
              <div
                className={cn(
                  "grid h-[58px] w-14 flex-none place-items-center rounded-[10px] max-[1200px]:h-12 max-[1200px]:w-11 max-[560px]:h-[41px] max-[560px]:w-[38px]",
                  tmStatTone[kpi.tone],
                )}
              >
                <kpi.Icon size={28} strokeWidth={2} />
              </div>
              <div className="relative z-[1] min-w-0">
                <strong className="block whitespace-nowrap text-xl leading-[1.15] tracking-[-0.4px] text-[#07135c] max-[1200px]:text-[17px] max-[560px]:text-base">
                  {kpi.value}
                </strong>
                <span className="mt-[5px] block whitespace-nowrap text-xs text-[#2b4eaa] max-[1200px]:text-[11px] max-[560px]:whitespace-normal max-[560px]:text-[10px]">
                  {kpi.label}
                </span>
                <em
                  className={cn(
                    "mt-[7px] block text-[13px] not-italic",
                    muted
                      ? "font-semibold text-[#9aabc4]"
                      : kpi.metaRed
                        ? "font-bold text-[#f32635]"
                        : "font-bold text-[#00964f]",
                  )}
                >
                  {kpi.meta}
                </em>
              </div>
              <div
                className={cn(
                  "absolute bottom-2 right-[7px] h-[30px] w-[92px] max-[560px]:bottom-[3px] max-[560px]:right-[3px] max-[560px]:h-[22px] max-[560px]:w-[58px]",
                  muted ? "opacity-[.35]" : "opacity-95",
                )}
                aria-hidden
              >
                <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible">
                  <path
                    d="M1 28 L12 24 L20 25 L31 18 L41 20 L50 13 L60 16 L70 8 L80 12 L91 3 L99 0"
                    fill="none"
                    stroke={kpi.stroke}
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-[minmax(0,2.12fr)_minmax(300px,1fr)] items-start gap-2.5 max-[1200px]:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] max-[900px]:grid-cols-1">
        <div className="grid min-w-0 gap-2.5">
          <section className={tmPanel}>
            <div className={tmHead()}>
              <span className={tmPanelIcon}>
                <Ticket size={22} />
              </span>
              <h2>Ticket Types</h2>
              <span className="flex-1" />
              <button
                type="button"
                className="inline-flex h-[33px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border-0 bg-[#0757f5] px-3.5 font-[inherit] text-xs font-semibold text-white shadow-[0_2px_4px_rgba(7,87,245,.1)] hover:bg-[#064adb]"
              >
                <Plus size={14} strokeWidth={3} /> Add Ticket Type
              </button>
            </div>
            <div className={tmTableWrap()}>
              <table className={tmTable()}>
                <thead>
                  <tr>
                    {["#", "Ticket Type", "Price (KES)", "Quantity", "Sold", "Remaining", "Revenue (KES)", "Status", "Actions"].map(
                      (h) => (
                        <th key={h} className={tmTh()}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className={tmTbody}>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={tmEmpty}>
                        No ticket types yet — add one to start selling.
                      </td>
                    </tr>
                  ) : (
                    rows.map((t, i) => {
                      const rem = Math.max(t.capacity - t.sold, 0);
                      const revenue = t.sold * t.priceKes;
                      return (
                        <tr key={t.id}>
                          <td className={tmTd()}>{i + 1}</td>
                          <td className={cn(tmTdBase(), "min-w-[140px] text-left")}>
                            <strong className="mb-[3px] block text-xs text-[#07135f]">{t.name}</strong>
                            <small className="block text-[11px] text-[#6576a9]">{t.blurb}</small>
                          </td>
                          <td className={tmTd()}>{t.priceKes.toLocaleString()}</td>
                          <td className={tmTd()}>{t.capacity.toLocaleString()}</td>
                          <td className={tmTd()}>{t.sold.toLocaleString()}</td>
                          <td className={tmTd()}>{rem.toLocaleString()}</td>
                          <td className={tmTd()}>{revenue.toLocaleString()}</td>
                          <td className={tmTd()}>
                            <span
                              className={cn(
                                tmPillBase,
                                t.status === "Active"
                                  ? "bg-[#c9f8e2] text-[#008347]"
                                  : "bg-[#eef3f9] text-[#6a7da3]",
                              )}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className={tmTd()}>
                            <div className="flex justify-center gap-[7px]">
                              <button type="button" className={tmMini} aria-label={`Edit ${t.name}`}>
                                <Pencil size={14} />
                              </button>
                              <button type="button" className={tmMini} aria-label={`More for ${t.name}`}>
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
            <section className={tmPanel}>
              <div className={tmHead(true)}>
                <span className={tmPanelIcon}>
                  <Zap size={18} />
                </span>
                <h2>Top Performing Ticket Types</h2>
              </div>
              <div className={tmTableWrap(true)}>
                <table className={tmTable(true)}>
                  <thead>
                    <tr>
                      <th className={tmTh(true)}>#</th>
                      <th className={tmTh(true)}>Ticket Type</th>
                      <th className={tmTh(true)}>Sold</th>
                      <th className={tmTh(true)}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody className={tmTbody}>
                    {topBySold.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={tmEmpty}>
                          No sales yet.
                        </td>
                      </tr>
                    ) : (
                      topBySold.map((t, i) => (
                        <tr key={t.id}>
                          <td className={tmTd(true)}>{i + 1}</td>
                          <td className={tmTdLeft(true)}>{t.name}</td>
                          <td className={tmTd(true)}>{t.sold.toLocaleString()}</td>
                          <td className={tmTd(true)}>
                            {sold > 0 ? `${Math.round((t.sold / sold) * 100)}%` : "0%"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={tmPanel}>
              <div className={tmHead(true)}>
                <span className={tmPanelIcon}>
                  <Wallet size={18} />
                </span>
                <h2>Revenue by Ticket Type</h2>
              </div>
              <div className={tmTableWrap(true)}>
                <table className={tmTable(true)}>
                  <thead>
                    <tr>
                      <th className={tmTh(true)}>Ticket Type</th>
                      <th className={tmTh(true)}>Revenue (KES)</th>
                      <th className={tmTh(true)}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody className={tmTbody}>
                    {byRevenue.length === 0 ? (
                      <tr>
                        <td colSpan={3} className={tmEmpty}>
                          No revenue yet.
                        </td>
                      </tr>
                    ) : (
                      byRevenue.map((t) => {
                        const revenue = t.sold * t.priceKes;
                        const pct =
                          totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
                        return (
                          <tr key={t.id}>
                            <td className={tmTdLeft(true)}>{t.name}</td>
                            <td className={tmTd(true)}>{revenue.toLocaleString()}</td>
                            <td className={tmTd(true)}>
                              {pct > 0 ? (
                                <div className="flex items-center justify-center gap-[5px]">
                                  <span
                                    className="inline-block h-[9px] rounded-[3px] bg-[#4a94ff]"
                                    style={{ width: `${Math.max(pct, 4)}%` }}
                                  />
                                  {pct}%
                                </div>
                              ) : (
                                "0%"
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <div className="grid min-w-0 gap-2.5 max-[900px]:grid-cols-2 max-[900px]:items-start max-[560px]:grid-cols-1">
          <section className={tmPanel}>
            <div className={tmHead()}>
              <span className={tmPanelIcon}>
                <Zap size={22} />
              </span>
              <h2>Quick Actions</h2>
            </div>
            <div className="grid gap-1.5 px-[17px] pb-[13px]">
              {[
                { label: "Add Ticket Type", Icon: Plus, strokeWidth: 2.5, tone: "text-[#009c51]" },
                { label: "View Orders", Icon: LayoutGrid, strokeWidth: 2, tone: "text-[#0757ff]" },
                { label: "Manage Discount Codes", Icon: Ticket, strokeWidth: 2, tone: "text-[#009c51]" },
                { label: "Export Ticket Data", Icon: Download, strokeWidth: 2, tone: "text-[#009c51]" },
                { label: "Configure Ticket Settings", Icon: Settings, strokeWidth: 2, tone: "text-[#009c51]" },
              ].map(({ label, Icon, strokeWidth, tone }) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-[38px] w-full cursor-pointer items-center gap-[15px] rounded-lg border border-[#dceafe] bg-[linear-gradient(90deg,#f0f7ff,#fbfdff)] px-[13px] text-left font-[inherit] text-xs text-[#23429b] hover:bg-none hover:bg-[#e8f2ff]"
                >
                  <span className={cn("grid w-[22px] place-items-center", tone)}>
                    <Icon size={18} strokeWidth={strokeWidth} />
                  </span>
                  <span className="flex-1">{label}</span>
                  <span className="text-lg font-bold text-[#061b9b]">›</span>
                </button>
              ))}
            </div>
          </section>

          <section className={cn(tmPanel, "pb-3")}>
            <div className="flex h-[55px] items-center gap-3 px-[17px] [&_h2]:m-0 [&_h2]:text-[15px] [&_h2]:font-extrabold [&_h2]:text-[#07135f]">
              <span className={tmPanelIcon}>
                <Wallet size={20} />
              </span>
              <h2>Ticket Sales Trend</h2>
              <select
                className="ml-auto rounded-[7px] border border-[#dbe8fb] bg-white px-3 py-2 font-[inherit] text-[11px] text-[#07135f]"
                aria-label="Chart period"
                defaultValue="30"
              >
                <option value="30">Last 30 Days</option>
                <option value="7">Last 7 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
            <div className="px-4">
              <svg
                viewBox="0 0 360 205"
                role="img"
                aria-label="Ticket sales trend line chart"
                className="block h-auto w-full"
              >
                <defs>
                  <linearGradient id="ticket-sales-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2f80ff" stopOpacity=".28" />
                    <stop offset="1" stopColor="#2f80ff" stopOpacity=".03" />
                  </linearGradient>
                </defs>
                <g stroke="#dce9fb" strokeWidth="1">
                  <path d="M34 18H345 M34 45H345 M34 72H345 M34 99H345 M34 126H345 M34 153H345" />
                  <path d="M34 18V153 M86 18V153 M138 18V153 M190 18V153 M242 18V153 M294 18V153 M345 18V153" />
                </g>
                <g fill="#53679e" fontSize="10">
                  <text x="3" y="21">
                    100
                  </text>
                  <text x="10" y="48">
                    80
                  </text>
                  <text x="10" y="75">
                    60
                  </text>
                  <text x="10" y="102">
                    40
                  </text>
                  <text x="10" y="129">
                    20
                  </text>
                  <text x="18" y="156">
                    0
                  </text>
                  <text x="27" y="174">
                    Sep 01
                  </text>
                  <text x="75" y="174">
                    Sep 05
                  </text>
                  <text x="126" y="174">
                    Sep 10
                  </text>
                  <text x="178" y="174">
                    Sep 15
                  </text>
                  <text x="230" y="174">
                    Sep 20
                  </text>
                  <text x="281" y="174">
                    Sep 25
                  </text>
                  <text x="326" y="174">
                    Sep 30
                  </text>
                </g>
                <path
                  d="M34 137 L60 126 L86 114 L112 116 L138 112 L164 101 L190 94 L216 77 L242 87 L258 94 L275 86 L294 69 L310 60 L326 52 L345 47 L345 153 L34 153Z"
                  fill="url(#ticket-sales-area)"
                  opacity={live ? 0.35 : 1}
                />
                <path
                  d="M34 137 L60 126 L86 114 L112 116 L138 112 L164 101 L190 94 L216 77 L242 87 L258 94 L275 86 L294 69 L310 60 L326 52 L345 47"
                  fill="none"
                  stroke="#0757ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={live ? 0.4 : 1}
                />
                <g fill="#0757ff" opacity={live ? 0.4 : 1}>
                  {[
                    [34, 137],
                    [60, 126],
                    [86, 114],
                    [112, 116],
                    [138, 112],
                    [164, 101],
                    [190, 94],
                    [216, 77],
                    [242, 87],
                    [258, 94],
                    [275, 86],
                    [294, 69],
                    [310, 60],
                    [326, 52],
                    [345, 47],
                  ].map(([cx, cy]) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />
                  ))}
                </g>
              </svg>
              <div className="mt-[5px] flex items-center justify-center gap-[7px] text-xs text-[#3152aa]">
                <span className="inline-block h-3 w-3 rounded-full bg-[#0757ff]" />
                Tickets Sold
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

const avatarToneClass: Record<string, string> = {
  blue: "bg-blue-200 text-blue-700",
  orange: "bg-orange-200 text-orange-700",
  purple: "bg-purple-200 text-purple-700",
  red: "bg-red-200 text-red-700",
  sky: "bg-sky-200 text-sky-700",
  pink: "bg-pink-200 text-pink-700",
};

function statusPillClass(status: string) {
  if (status === "Confirmed") return "rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700";
  if (status === "Pending") return "rounded-md bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700";
  if (status === "Cancelled") return "rounded-md bg-red-100 px-2.5 py-1 text-[10px] font-semibold text-red-600";
  return "rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600";
}

function checkInPillClass(checkIn: string) {
  if (checkIn === "Checked In") return "rounded-md bg-emerald-100 px-2 py-1 text-[10px] text-emerald-700";
  if (checkIn === "—" || checkIn === "-") return "";
  return "rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600";
}

function ParticipantsTab({ fromApi, loading }: { fromApi: boolean; loading: boolean }) {
  const live = fromApi || loading;
  const [query, setQuery] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [sideTicket, setSideTicket] = useState("");
  const [sideStatus, setSideStatus] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const source = live ? [] : eventParticipants;
  const totalLabel = live ? 0 : 3245;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ticket = ticketFilter || sideTicket;
    const status = statusFilter || sideStatus;
    return source.filter((p) => {
      const hay = `${p.name} ${p.email} ${p.org} ${p.type} ${p.category}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (ticket && p.type !== ticket) return false;
      if (status && p.status !== status) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (orgFilter && p.org !== orgFilter) return false;
      return true;
    });
  }, [source, query, ticketFilter, statusFilter, categoryFilter, orgFilter, sideTicket, sideStatus]);

  const kpis = live
    ? [
        { label: "Total Participants", value: "0", meta: "—", tone: "blue", stroke: "#0757ff", Icon: Users },
        { label: "Confirmed", value: "0", meta: "—", tone: "green", stroke: "#00b65d", Icon: Check },
        { label: "Pending", value: "0", meta: "—", tone: "amber", stroke: "#ff9200", Icon: Timer },
        { label: "Cancelled", value: "0", meta: "—", tone: "red", stroke: "#ff303c", Icon: X },
        { label: "On-site Check-in", value: "0", meta: "—", tone: "purple", stroke: "#ad00f5", Icon: Users },
      ]
    : [
        { label: "Total Participants", value: "3,245", meta: "↑ 18%", tone: "blue", stroke: "#0757ff", Icon: Users },
        { label: "Confirmed", value: "2,860", meta: "88%", tone: "green", stroke: "#00b65d", Icon: Check },
        { label: "Pending", value: "210", meta: "6%", tone: "amber", stroke: "#ff9200", Icon: Timer },
        { label: "Cancelled", value: "48", meta: "↓ 1.5%", tone: "red", stroke: "#ff303c", Icon: X },
        { label: "On-site Check-in", value: "127", meta: "4%", tone: "purple", stroke: "#ad00f5", Icon: Users },
      ];

  const iconTone: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
  };

  const metaTone: Record<string, string> = {
    blue: "text-emerald-600",
    green: "text-emerald-600",
    amber: "text-amber-500",
    red: "text-red-500",
    purple: "text-purple-600",
  };

  const donutGradient = live
    ? "conic-gradient(#d7e5f5 0 100%)"
    : "conic-gradient(#0757ff 0 57%, #00a66a 57% 67%, #ffae00 67% 80%, #d719b4 80% 89%, #a56cff 89% 100%)";

  const distribution = live
    ? participantDistribution.map((d) => ({ ...d, count: 0, pct: 0 }))
    : participantDistribution;

  const countries = live
    ? participantCountries.map((c) => ({ ...c, count: 0, pct: 0, bar: "0%" }))
    : participantCountries;

  const resetFilters = () => {
    setQuery("");
    setTicketFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setOrgFilter("");
    setSideTicket("");
    setSideStatus("");
  };

  const exportCsv = () => {
    const header = ["#", "Name", "Email", "Organization", "Ticket Type", "Status", "Registration Date", "Check-in"];
    const lines = filtered.map((p, i) =>
      [i + 1, p.name, p.email, p.org, p.type, p.status, `${p.date} ${p.time}`, p.checkIn]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "isippe-participants.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const orgs = [...new Set(eventParticipants.map((p) => p.org))];

  return (
    <div className="text-[#07135f]">
      <section className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={cn(
              "relative flex h-[92px] min-w-0 gap-2 rounded-lg border border-blue-100 bg-white/90 p-2.5 shadow-sm sm:h-[105px] sm:gap-3 sm:p-3",
              kpi.label === "On-site Check-in" && "col-span-2 sm:col-span-1",
            )}
          >
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-lg sm:h-14 sm:w-14",
                iconTone[kpi.tone],
              )}
            >
              <kpi.Icon size={26} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <strong className="block text-base font-extrabold leading-6 sm:text-xl">{kpi.value}</strong>
              <span className="block text-[10px] text-blue-700 sm:text-xs">{kpi.label}</span>
              <b
                className={cn(
                  "mt-1 block text-xs sm:text-sm",
                  live ? "font-semibold text-slate-400" : metaTone[kpi.tone],
                )}
              >
                {kpi.meta}
              </b>
            </div>
            <svg
              className={cn("absolute right-1.5 bottom-1.5 h-6 w-14 sm:h-7 sm:w-[92px]", live && "opacity-35")}
              viewBox="0 0 100 30"
              aria-hidden
            >
              <path
                fill="none"
                stroke={kpi.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M1 28 L12 24 L20 25 L31 18 L41 20 L50 13 L60 16 L70 8 L80 12 L91 3 L99 0"
              />
            </svg>
          </article>
        ))}
      </section>

      <section className="grid items-start gap-2.5 xl:grid-cols-[minmax(0,3.2fr)_minmax(280px,1fr)]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-blue-100 bg-white/90 shadow-sm">
          <div className="grid grid-cols-2 gap-2 px-2.5 pt-3 sm:grid-cols-[minmax(200px,1fr)_110px_140px] lg:grid-cols-[minmax(200px,1fr)_180px_110px_140px]">
            <label className="col-span-2 flex h-[35px] min-w-0 items-center gap-2 rounded-md border border-blue-100 px-2.5 sm:col-span-1">
              <Search size={16} className="text-blue-700" />
              <input
                className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-blue-400"
                placeholder="Search participants by name, email, organization..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="hidden h-[35px] rounded-md border border-blue-100 lg:block" />
            <button
              type="button"
              onClick={exportCsv}
              className="flex h-[35px] items-center justify-center gap-2 rounded-md border border-blue-100 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Download size={14} /> Export
            </button>
            <button
              type="button"
              className="flex h-[35px] items-center justify-center gap-2 rounded-md bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={14} strokeWidth={3} /> Add Participant
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 px-2.5 py-2 sm:grid-cols-4">
            <select
              className="h-[33px] min-w-0 rounded-md border border-blue-100 bg-white px-2 text-[11px]"
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
            >
              <option value="">All Ticket Types</option>
              <option>Delegate</option>
              <option>Speaker</option>
              <option>Exhibitor</option>
              <option>Student</option>
            </select>
            <select
              className="h-[33px] min-w-0 rounded-md border border-blue-100 bg-white px-2 text-[11px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <select
              className="h-[33px] min-w-0 rounded-md border border-blue-100 bg-white px-2 text-[11px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option>Government</option>
              <option>Academia</option>
              <option>Industry</option>
              <option>International</option>
            </select>
            <button
              type="button"
              className="flex h-[33px] items-center gap-2 rounded-md border border-blue-100 px-2 text-[11px]"
            >
              <CalendarDays size={14} /> Registration Date
            </button>
          </div>

          <div className="overflow-x-auto px-2.5 [scrollbar-width:thin]">
            <table className="w-full min-w-[850px] border-separate border-spacing-0 text-[11px] text-blue-900">
              <thead>
                <tr className="bg-blue-50 text-left text-[#07165e]">
                  <th className="border-y border-l border-blue-100 px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={selectAll}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setSelectAll(on);
                        const next: Record<string, boolean> = {};
                        filtered.forEach((p) => {
                          next[p.id] = on;
                        });
                        setSelected(next);
                      }}
                    />
                  </th>
                  <th className="border-y border-blue-100 px-2 py-2">#</th>
                  <th className="border-y border-blue-100 px-2 py-2">Name</th>
                  <th className="border-y border-blue-100 px-2 py-2">Email</th>
                  <th className="border-y border-blue-100 px-2 py-2">Organization</th>
                  <th className="border-y border-blue-100 px-2 py-2">Ticket Type</th>
                  <th className="border-y border-blue-100 px-2 py-2">Status</th>
                  <th className="border-y border-blue-100 px-2 py-2">Registration Date</th>
                  <th className="border-y border-blue-100 px-2 py-2">Check-in</th>
                  <th className="border-y border-r border-blue-100 px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="border-b border-x border-blue-100 px-2 py-8 text-center text-slate-400"
                    >
                      {live
                        ? "No participants yet — registrations will appear here."
                        : "No participants match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td className="border-b border-l border-blue-100 px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(selected[p.id])}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))
                          }
                        />
                      </td>
                      <td className="border-b border-blue-100 px-2 py-2">{i + 1}</td>
                      <td className="border-b border-blue-100 px-2 py-2">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span
                            className={cn(
                              "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold",
                              avatarToneClass[p.avatarTone] || avatarToneClass.blue,
                            )}
                          >
                            {p.initials}
                          </span>
                          {p.name}
                        </div>
                      </td>
                      <td className="border-b border-blue-100 px-2 py-2 text-[10px]">{p.email}</td>
                      <td className="border-b border-blue-100 px-2 py-2">{p.org}</td>
                      <td className="border-b border-blue-100 px-2 py-2">{p.type}</td>
                      <td className="border-b border-blue-100 px-2 py-2">
                        <span className={statusPillClass(p.status)}>{p.status}</span>
                      </td>
                      <td className="border-b border-blue-100 px-2 py-2">
                        {p.date}
                        <br />
                        {p.time}
                      </td>
                      <td className="border-b border-blue-100 px-2 py-2">
                        {p.checkIn === "—" || p.checkIn === "-" ? (
                          "–"
                        ) : (
                          <span className={checkInPillClass(p.checkIn)}>{p.checkIn}</span>
                        )}
                      </td>
                      <td className="border-b border-r border-blue-100 px-2 py-2 text-center">
                        <button
                          type="button"
                          className="rounded-md border border-blue-100 px-2.5 py-1 text-blue-600"
                          aria-label={`Actions for ${p.name}`}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-3 text-[10px] text-blue-800 sm:gap-2 sm:text-xs">
            <span>
              {live
                ? "Showing 0 participants"
                : `Showing ${filtered.length ? 1 : 0} - ${filtered.length} of ${totalLabel.toLocaleString()} participants`}
            </span>
            <span className="flex-1" />
            <button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-blue-100">
              ‹
            </button>
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md border border-blue-600 bg-blue-600 text-white"
            >
              1
            </button>
            {!live ? (
              <>
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded-md border border-blue-100"
                  >
                    {n}
                  </button>
                ))}
                <button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-blue-100">
                  …
                </button>
                <button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-blue-100">
                  325
                </button>
              </>
            ) : null}
            <button type="button" className="grid h-7 w-7 place-items-center rounded-md border border-blue-100">
              ›
            </button>
            <span className="flex-1" />
            <select className="rounded-md border border-blue-100 bg-white px-2 py-2 text-[10px] sm:text-xs">
              <option>10 per page</option>
              <option>25 per page</option>
              <option>50 per page</option>
            </select>
          </div>
        </div>

        <aside className="grid items-start gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="overflow-hidden rounded-lg border border-blue-100 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 px-3.5 py-3">
              <LayoutGrid size={18} className="text-blue-600" />
              <h2 className="text-sm font-extrabold">Participant Filters</h2>
              <span className="flex-1" />
              <button type="button" onClick={resetFilters} className="text-[11px] text-blue-600">
                Reset
              </button>
            </div>
            <div className="grid gap-2 px-3.5 pb-3.5">
              <label className="text-[10px]">
                Ticket Type
                <select
                  className="mt-1 h-[29px] w-full rounded-md border border-blue-100 bg-white px-2 text-[11px]"
                  value={sideTicket}
                  onChange={(e) => setSideTicket(e.target.value)}
                >
                  <option value="">All Ticket Types</option>
                  <option>Delegate</option>
                  <option>Speaker</option>
                  <option>Exhibitor</option>
                  <option>Student</option>
                </select>
              </label>
              <label className="text-[10px]">
                Status
                <select
                  className="mt-1 h-[29px] w-full rounded-md border border-blue-100 bg-white px-2 text-[11px]"
                  value={sideStatus}
                  onChange={(e) => setSideStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
              </label>
              <label className="text-[10px]">
                Organization
                <select
                  className="mt-1 h-[29px] w-full rounded-md border border-blue-100 bg-white px-2 text-[11px]"
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                >
                  <option value="">All Organizations</option>
                  {orgs.map((org) => (
                    <option key={org}>{org}</option>
                  ))}
                </select>
              </label>
              <label className="text-[10px]">
                Country
                <select className="mt-1 h-[29px] w-full rounded-md border border-blue-100 bg-white px-2 text-[11px]">
                  <option>All Countries</option>
                  <option>Kenya</option>
                  <option>Nigeria</option>
                  <option>South Africa</option>
                  <option>Uganda</option>
                </select>
              </label>
              <label className="text-[10px]">
                Check-in Status
                <select className="mt-1 h-[29px] w-full rounded-md border border-blue-100 bg-white px-2 text-[11px]">
                  <option>All</option>
                  <option>Checked In</option>
                  <option>Not Checked In</option>
                </select>
              </label>
              <button
                type="button"
                className="h-[29px] rounded-md bg-blue-600 font-semibold text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-blue-100 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 px-3.5 py-3">
              <LayoutGrid size={18} className="text-blue-600" />
              <h2 className="text-sm font-extrabold">Participant Distribution</h2>
            </div>
            <div className="flex items-center gap-3 px-3 pb-4">
              <div
                className="relative grid h-[112px] w-[112px] shrink-0 place-items-center rounded-full after:absolute after:inset-[19px] after:rounded-full after:bg-white sm:h-[120px] sm:w-[120px] sm:after:inset-5"
                style={{ background: donutGradient }}
              >
                <div className="relative z-10 text-center">
                  <strong className="block text-lg">{live ? "0" : "3,245"}</strong>
                  <span className="text-[10px] text-blue-700">Participants</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-[10px] text-blue-800">
                {distribution.map((d) => (
                  <div key={d.label} className="flex items-center gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    {d.label}
                    <span className="ml-auto whitespace-nowrap">
                      {d.count.toLocaleString()} ({d.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-blue-100 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 px-3.5 py-3">
              <LayoutGrid size={18} className="text-blue-600" />
              <h2 className="text-sm font-extrabold">Top Countries</h2>
              <span className="flex-1" />
              <button type="button" className="text-[11px] text-blue-600">
                View All
              </button>
            </div>
            <div className="space-y-2.5 px-3.5 pb-4 text-[10px] text-blue-800">
              {countries.map((c) => (
                <div
                  key={c.name}
                  className="grid grid-cols-[18px_76px_minmax(30px,1fr)_64px] items-center gap-1.5"
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  <div className="h-2 overflow-hidden rounded-sm bg-slate-100">
                    <div className="h-full rounded-sm bg-blue-500" style={{ width: c.bar }} />
                  </div>
                  <b className="text-right font-medium">
                    {c.count.toLocaleString()} ({c.pct}%)
                  </b>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function ProgrammeTab({ programme }: { programme: ReturnType<typeof asProgramme> }) {
  const rows =
    programme.length > 0
      ? programme.map((s, i) => ({
          key: s.id || `${s.title}-${i}`,
          day: s.day != null ? String(s.day) : String(i + 1),
          time: s.time || [s.startTime, s.endTime].filter(Boolean).join(" - ") || "—",
          title: s.title,
          place: s.venue || s.place || "—",
        }))
      : eventSchedule.map((s) => ({
          key: s.title,
          day: `${s.month} ${s.day}`,
          time: s.time,
          title: s.title,
          place: s.place,
        }));

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-ink">Programme</h2>
      <ul className="grid gap-3">
        {rows.map((s) => (
          <li key={s.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 px-3 py-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue">
              <CalendarDays size={14} /> {s.day}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-mute">
              <Clock size={14} /> {s.time}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{s.title}</p>
              <p className="text-xs text-mute">{s.place}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SpeakersTab({
  speakers,
  fromApi,
}: {
  speakers: EngagementSpeaker[];
  fromApi: boolean;
}) {
  const rows = (fromApi ? speakers : draftSpeakers).map(engagementSpeakerToCard);

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-ink">Speakers</h2>
      <SpeakerCardGrid
        speakers={rows}
        columns={3}
        emptyMessage="No speakers added for this event yet."
      />
    </Card>
  );
}

type SponsorRowStatus = "Confirmed" | "Pending" | "Declined";

type SponsorRow = {
  id: string;
  name: string;
  category: string;
  type: string;
  status: SponsorRowStatus;
  value: number;
  contact: string;
  logo: string;
};

function parseSponsorValue(price?: number | string): number {
  if (typeof price === "number" && Number.isFinite(price)) return price;
  if (typeof price === "string") {
    const n = Number(price.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapApiSponsors(list: EngagementSponsor[]): SponsorRow[] {
  return list.map((s, i) => {
    const name = s.name || "Sponsor";
    const logo =
      name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase() || "SP";
    const status: SponsorRowStatus = s.active === false ? "Pending" : "Confirmed";
    return {
      id: s.id || `api-spn-${i}`,
      name,
      category: s.subtitle || "—",
      type: s.tier || s.name || "Package",
      status,
      value: parseSponsorValue(s.price),
      contact: "—",
      logo,
    };
  });
}

function sponsorStatusClass(status: SponsorRowStatus) {
  if (status === "Confirmed") return "bg-[#d7fbe8] text-[#087443]";
  if (status === "Pending") return "bg-[#fff0d2] text-[#a85b00]";
  return "bg-[#ffe1e1] text-[#c91e2c]";
}

function formatKes(n: number) {
  return new Intl.NumberFormat("en-KE").format(n);
}

function formatKesCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function EventPaymentsTab({ fromApi, loading }: { fromApi: boolean; loading: boolean }) {
  const live = fromApi || loading;
  return <PaymentsDashboard showTitle={false} live={live} />;
}

function SponsorsTab({
  sponsors,
  fromApi,
  loading,
  mode = "sponsors",
}: {
  sponsors: EngagementSponsor[];
  fromApi: boolean;
  loading: boolean;
  mode?: "sponsors" | "exhibitors";
}) {
  const live = fromApi || loading;
  const noun = mode === "exhibitors" ? "exhibitor" : "sponsor";
  const Noun = mode === "exhibitors" ? "Exhibitor" : "Sponsor";
  const Nouns = mode === "exhibitors" ? "Exhibitors" : "Sponsors";

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [localExtra, setLocalExtra] = useState<SponsorRow[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const apiRows = useMemo(() => (live ? mapApiSponsors(sponsors) : []), [live, sponsors]);
  const source: SponsorRow[] = live
    ? apiRows
    : [
        ...localExtra,
        ...eventSponsors.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          type: s.type,
          status: s.status,
          value: s.value,
          contact: s.contact,
          logo: s.logo,
        })),
      ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((s) => {
      const hay = `${s.name} ${s.category} ${s.type} ${s.status} ${s.contact}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (categoryFilter && s.category !== categoryFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (typeFilter && s.type !== typeFilter) return false;
      return true;
    });
  }, [source, query, categoryFilter, statusFilter, typeFilter]);

  const confirmed = source.filter((s) => s.status === "Confirmed").length;
  const pending = source.filter((s) => s.status === "Pending").length;
  const declined = source.filter((s) => s.status === "Declined").length;
  const totalValue = source.reduce((sum, s) => sum + s.value, 0);
  /** Mock dashboard reports 40 sponsors; sample rows are a subset (matches HTML replica). */
  const totalCount = live ? source.length : 40;
  const summaryTotal =
    !live && !query && !categoryFilter && !statusFilter && !typeFilter
      ? Math.max(filtered.length, totalCount)
      : filtered.length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const pageButtons = Array.from(
    { length: Math.min(4, Math.max(totalPages, !live && summaryTotal > filtered.length ? 4 : totalPages)) },
    (_, i) => i + 1,
  );

  useEffect(() => {
    setPage(1);
    setSelectAll(false);
    setSelected({});
  }, [query, categoryFilter, statusFilter, typeFilter, pageSize]);

  const sparkPaths = {
    blue: "M1 27 C14 27 16 19 27 20 S42 12 50 15 S68 6 85 2",
    green: "M1 27 C14 25 20 20 30 22 S48 11 56 14 S73 6 85 2",
    amber: "M1 27 C14 27 17 19 28 21 S43 14 52 15 S69 7 85 2",
    red: "M1 27 C14 25 18 23 27 22 S43 14 53 17 S69 7 85 2",
    purple: "M1 27 C14 26 17 19 28 21 S43 13 52 15 S69 7 85 2",
  } as const;

  const kpis = live
    ? [
        {
          label: `Total ${Nouns}`,
          value: String(source.length),
          meta: "—",
          tone: "blue" as const,
          stroke: "#1670ff",
          Icon: Building2,
        },
        {
          label: "Confirmed",
          value: String(confirmed),
          meta: source.length ? `${Math.round((confirmed / source.length) * 100)}%` : "—",
          tone: "green" as const,
          stroke: "#00a86b",
          Icon: Check,
        },
        {
          label: "Pending",
          value: String(pending),
          meta: source.length ? `${Math.round((pending / source.length) * 100)}%` : "—",
          tone: "amber" as const,
          stroke: "#ff9900",
          Icon: Timer,
        },
        {
          label: "Declined",
          value: String(declined),
          meta: source.length ? `${Math.round((declined / source.length) * 100)}%` : "—",
          tone: "red" as const,
          stroke: "#ff3333",
          Icon: X,
        },
        {
          label: mode === "exhibitors" ? "Total Package Value" : "Total Sponsorship Value",
          value: totalValue ? `KES ${formatKesCompact(totalValue)}` : "KES 0",
          meta: "—",
          tone: "purple" as const,
          stroke: "#a020f0",
          Icon: Wallet,
        },
      ]
    : [
        {
          label: `Total ${Nouns}`,
          value: "40",
          meta: "↑ 21%",
          tone: "blue" as const,
          stroke: "#1670ff",
          Icon: Building2,
        },
        {
          label: "Confirmed",
          value: "28",
          meta: "70%",
          tone: "green" as const,
          stroke: "#00a86b",
          Icon: Check,
        },
        {
          label: "Pending",
          value: "8",
          meta: "20%",
          tone: "amber" as const,
          stroke: "#ff9900",
          Icon: Timer,
        },
        {
          label: "Declined",
          value: "4",
          meta: "↓ 10%",
          tone: "red" as const,
          stroke: "#ff3333",
          Icon: X,
        },
        {
          label: "Total Sponsorship Value",
          value: "KES 12.5M",
          meta: "↑ 35%",
          tone: "purple" as const,
          stroke: "#a020f0",
          Icon: Wallet,
        },
      ];

  const iconTone: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
  };

  const metaTone: Record<string, string> = {
    blue: "text-emerald-600",
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-500",
    purple: "text-emerald-600",
  };

  const donutGradient = live
    ? source.length === 0
      ? "conic-gradient(#d7e5f5 0 100%)"
      : (() => {
          const tiers = ["Platinum", "Gold", "Silver", "Bronze", "Supporting"];
          const colors = ["#1670ff", "#00a86b", "#ffb21b", "#e83eaa", "#a020f0"];
          const sums = tiers.map((t) =>
            source.filter((s) => s.type === t).reduce((a, s) => a + s.value, 0),
          );
          const other = source
            .filter((s) => !tiers.includes(s.type))
            .reduce((a, s) => a + s.value, 0);
          const parts = [...sums, other];
          const colorsAll = [...colors, "#94a3b8"];
          const total = parts.reduce((a, b) => a + b, 0) || 1;
          let acc = 0;
          return `conic-gradient(${parts
            .map((v, i) => {
              const start = (acc / total) * 100;
              acc += v;
              const end = (acc / total) * 100;
              return `${colorsAll[i]} ${start}% ${end}%`;
            })
            .join(", ")})`;
        })()
    : "conic-gradient(#1670ff 0 24%, #00a86b 24% 52%, #ffb21b 52% 72%, #e83eaa 72% 90%, #a020f0 90% 100%)";

  const liveTierPct = useMemo(() => {
    if (!live || source.length === 0) return null;
    const labels = ["Platinum", "Gold", "Silver", "Bronze", "Supporting"] as const;
    const colors = ["#1670ff", "#00a86b", "#ffb21b", "#e83eaa", "#a020f0"];
    const sums = labels.map((t) =>
      source.filter((s) => s.type === t).reduce((a, s) => a + s.value, 0),
    );
    const total = sums.reduce((a, b) => a + b, 0) || 1;
    return labels.map((label, i) => ({
      label,
      pct: Math.round((sums[i] / total) * 100),
      color: colors[i],
    }));
  }, [live, source]);

  const categories = live
    ? sponsorCategories.map((c) => ({ ...c, count: 0, value: 0 }))
    : sponsorCategories;

  const tiers = live
    ? liveTierPct ?? sponsorTierBreakdown.map((t) => ({ ...t, pct: 0 }))
    : sponsorTierBreakdown;

  const tops = live
    ? source.length === 0
      ? topSponsors.map((t) => ({ ...t, valueLabel: "0", bar: "0%" }))
      : [...source]
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
          .map((s, _, arr) => ({
            name: s.name,
            flag: "🏢",
            valueLabel: formatKesCompact(s.value),
            bar: arr[0]?.value ? `${Math.round((s.value / arr[0].value) * 100)}%` : "0%",
          }))
    : topSponsors;

  const categoryOptions = [
    "Telecommunications",
    "Government",
    "Regional Organization",
    "International Organization",
    "Academia",
    "Business & Trade",
    "Private Sector",
    "Healthcare",
    "Energy",
    "Financial Services",
  ];

  const typeOptions = [
    "Platinum",
    "Gold",
    "Silver",
    "Bronze",
    "Supporting",
    "Exhibitor Sponsor",
  ];

  const exportCsv = () => {
    const headers = [
      "Sponsor Name",
      "Category",
      "Sponsor Type",
      "Status",
      "Sponsorship Value (KES)",
      "Contact Person",
    ];
    const lines = filtered.map((s) =>
      [s.name, s.category, s.type, s.status, s.value, s.contact]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `isippe-${noun}s.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const glass =
    "rounded-xl border border-[#dcecff] bg-[rgba(255,255,255,.92)] shadow-[0_5px_18px_rgba(30,93,160,.055)]";

  return (
    <div className="text-[#07145c]">
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#07145c] px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <section className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={cn(glass, "p-4", kpi.label.includes("Value") && "col-span-2 lg:col-span-1")}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                  iconTone[kpi.tone],
                )}
              >
                <kpi.Icon size={28} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    "font-extrabold leading-7",
                    kpi.value.length > 8 ? "text-xl" : "text-2xl",
                  )}
                >
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-500">{kpi.label}</div>
                <div
                  className={cn(
                    "mt-1 text-xs font-bold",
                    live ? "font-semibold text-slate-400" : metaTone[kpi.tone],
                  )}
                >
                  {kpi.meta}
                </div>
              </div>
            </div>
            <svg
              className={cn("kpi-spark ml-auto -mt-5 h-[30px] w-[86px]", live && "opacity-35")}
              viewBox="0 0 86 30"
              aria-hidden
            >
              <path
                d={sparkPaths[kpi.tone]}
                fill="none"
                stroke={kpi.stroke}
                strokeWidth="2.5"
              />
            </svg>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_305px]">
        <section className={cn(glass, "min-w-0 p-3 md:p-4")}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-sm">
              <Search size={16} className="text-blue-700" />
              <input
                className="w-full outline-none placeholder:text-slate-400"
                placeholder={`Search ${noun}s by name, category, status...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              <span className="inline-flex items-center gap-2">
                <Download size={14} /> Export
              </span>
            </button>
            <button
              type="button"
              onClick={() => (live ? showToast(`${Noun} create will connect to the API.`) : setModalOpen(true))}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={14} strokeWidth={3} /> Add {Noun}
              </span>
            </button>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs text-blue-950 outline-none focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs text-blue-950 outline-none focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Declined</option>
            </select>
            <select
              className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs text-blue-950 outline-none focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All {Noun} Types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-blue-100">
            <table className="w-full min-w-[900px] border-collapse text-left text-[11px] text-blue-950">
              <thead className="bg-blue-50 text-[10px] font-bold text-[#07145c]">
                <tr>
                  <th className="w-9 px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select all visible ${noun}s`}
                      checked={selectAll}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setSelectAll(on);
                        const next: Record<string, boolean> = {};
                        visible.forEach((s) => {
                          next[s.id] = on;
                        });
                        setSelected(next);
                      }}
                    />
                  </th>
                  <th className="px-2 py-3">#</th>
                  <th className="px-2 py-3">Logo</th>
                  <th className="px-2 py-3">{Noun} Name</th>
                  <th className="px-2 py-3">Category</th>
                  <th className="px-2 py-3">{Noun} Type</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3 text-right">Sponsorship Value (KES)</th>
                  <th className="px-2 py-3">Contact Person</th>
                  <th className="px-2 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-white">
                {visible.map((s, i) => (
                  <tr key={s.id} className="hover:bg-blue-50/70">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${s.name}`}
                        checked={Boolean(selected[s.id])}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [s.id]: e.target.checked }))
                        }
                      />
                    </td>
                    <td className="px-2 py-3 text-slate-500">{start + i + 1}</td>
                    <td className="px-2 py-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#f1f7ff] text-[10px] font-extrabold text-[#075bff]">
                        {s.logo}
                      </span>
                    </td>
                    <td className="px-2 py-3 font-semibold">{s.name}</td>
                    <td className="px-2 py-3 text-slate-600">{s.category}</td>
                    <td className="px-2 py-3">{s.type}</td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                          sponsorStatusClass(s.status),
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatKes(s.value)}</td>
                    <td className="px-2 py-3">{s.contact}</td>
                    <td className="px-2 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          title={`Edit ${s.name}`}
                          onClick={() => showToast(`Edit ${noun}: ${s.name}`)}
                          className="inline-flex h-[30px] w-8 items-center justify-center rounded-[7px] border border-[#d6e6ff] bg-white text-[#075bff] hover:bg-[#eff6ff]"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title="More actions"
                          onClick={() => showToast(`More actions for ${s.name}`)}
                          className="inline-flex h-[30px] w-8 items-center justify-center rounded-[7px] border border-[#d6e6ff] bg-white text-[#075bff] hover:bg-[#eff6ff]"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                {live && source.length === 0
                  ? `No ${noun}ship packages saved for this event yet.`
                  : `No ${noun}s match your filters.`}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              {summaryTotal
                ? visible.length
                  ? `Showing ${start + 1} - ${start + visible.length} of ${summaryTotal} ${noun}s`
                  : `Showing 0 of ${summaryTotal} ${noun}s`
                : `Showing 0 ${noun}s`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md border border-blue-100 bg-white px-3 py-2 text-blue-700"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              {pageButtons.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(Math.min(p, totalPages))}
                  className={cn(
                    "rounded-md px-3 py-2",
                    p === currentPage
                      ? "bg-blue-600 font-bold text-white"
                      : "border border-blue-100 bg-white text-blue-700",
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="rounded-md border border-blue-100 bg-white px-3 py-2 text-blue-700"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </button>
            </div>
            <label className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                className="rounded-md border border-blue-100 bg-white px-2 py-2"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={5}>5</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>
        </section>

        <aside className="space-y-3">
          <section className={cn(glass, "p-4")}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
              <LayoutGrid size={16} className="text-blue-700" /> Sponsorship Overview
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative h-32 w-32 shrink-0">
                <div
                  className="h-full w-full rounded-full"
                  style={{ background: donutGradient }}
                  aria-hidden
                />
                <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-[10px] font-medium">KES</span>
                  <strong className="text-lg leading-5">
                    {live ? formatKesCompact(totalValue) || "0" : "12.5M"}
                  </strong>
                  <span className="text-[10px] text-slate-500">Total Value</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2 text-[11px]">
                {tiers.map((t) => (
                  <li key={t.label} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <i
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: t.color }}
                      />
                      {t.label}
                    </span>
                    <b>{t.pct}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={cn(glass, "p-3")}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">
                <span className="mr-1">▦</span> Sponsorship Categories
              </h2>
              <button type="button" className="text-xs font-semibold text-blue-600">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Sponsors</th>
                    <th className="p-2 text-right">Value (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {categories.map((c) => (
                    <tr key={c.label}>
                      <td className="p-2">
                        {c.emoji} {c.label}
                      </td>
                      <td className="p-2 text-right">{c.count}</td>
                      <td className="p-2 text-right">{formatKes(c.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={cn(glass, "p-4")}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold">
                <span className="mr-1">♙</span> Top {Nouns}
              </h2>
              <button type="button" className="text-xs font-semibold text-blue-600">
                View All
              </button>
            </div>
            <div className="space-y-3 text-[11px]">
              {tops.map((t) => (
                <div key={t.name}>
                  <div className="mb-1 flex justify-between">
                    <span>
                      {t.flag} {t.name}
                    </span>
                    <span>{t.valueLabel}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: t.bar }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Add {Noun}</h2>
              <button
                type="button"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = String(data.get("name") || "").trim();
                const category = String(data.get("category") || "").trim();
                const type = String(data.get("type") || "Platinum");
                const status = (String(data.get("status") || "Confirmed") as SponsorRowStatus);
                const value = Number(data.get("value") || 0);
                const contact = String(data.get("contact") || "").trim();
                if (!name || !category || !contact) return;
                setLocalExtra((prev) => [
                  {
                    id: `local-${Date.now()}`,
                    name,
                    category,
                    type,
                    status,
                    value,
                    contact,
                    logo: name
                      .split(/\s+/)
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 3)
                      .toUpperCase(),
                  },
                  ...prev,
                ]);
                setModalOpen(false);
                setPage(1);
                showToast(`${Noun} added`);
              }}
            >
              <label className="text-sm font-semibold">
                {Noun} Name *
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 font-normal outline-none focus:border-blue-500"
                  placeholder="Organisation name"
                />
              </label>
              <label className="text-sm font-semibold">
                Category *
                <input
                  name="category"
                  required
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 font-normal outline-none focus:border-blue-500"
                  placeholder="e.g. Telecommunications"
                />
              </label>
              <label className="text-sm font-semibold">
                {Noun} Type *
                <select
                  name="type"
                  required
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 font-normal"
                  defaultValue="Platinum"
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Sponsorship Value (KES) *
                <input
                  name="value"
                  type="number"
                  min={0}
                  required
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 font-normal"
                  placeholder="500000"
                />
              </label>
              <label className="text-sm font-semibold">
                Contact Person *
                <input
                  name="contact"
                  required
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 font-normal outline-none focus:border-blue-500"
                  placeholder="Contact name"
                />
              </label>
              <label className="text-sm font-semibold">
                Status
                <select
                  name="status"
                  className="mt-1 w-full rounded-lg border border-blue-200 px-3 py-2 font-normal"
                  defaultValue="Confirmed"
                >
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Declined</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save {Noun}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type CommChannel = "All" | "Email" | "SMS" | "In-App" | "WhatsApp";

function channelBadge(channel: string) {
  if (channel === "SMS") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="rounded bg-emerald-600 px-1 py-0.5 text-[9px] text-white">SMS</span> SMS
      </span>
    );
  }
  if (channel === "WhatsApp") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="rounded bg-emerald-600 px-1 py-0.5 text-[9px] text-white">WA</span> WhatsApp
      </span>
    );
  }
  if (channel === "In-App") {
    return (
      <span className="inline-flex items-center gap-1 text-blue-600">
        <Users size={14} /> In-App
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-blue-500">
      <Mail size={14} /> Email
    </span>
  );
}

function CommunicationsTab({
  fromApi,
  loading,
  email,
  phone,
}: {
  fromApi: boolean;
  loading: boolean;
  email: string;
  phone: string;
}) {
  const live = fromApi || loading;
  const [channel, setChannel] = useState<CommChannel>("All");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const source = live ? [] : communicationCampaigns;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((c) => {
      if (channel !== "All" && c.channel !== channel) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (q && !`${c.name} ${c.audience} ${c.channel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [source, channel, query, statusFilter]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const kpis = live
    ? [
        { label: "Total Campaigns", value: "0", meta: "—", tone: "blue", stroke: "#0757ff", Icon: Send },
        { label: "Recipients", value: "0", meta: "—", tone: "green", stroke: "#00ae62", Icon: Users },
        { label: "Delivered", value: "0", meta: "—", tone: "blue2", stroke: "#00bf71", Icon: Mail },
        { label: "Link Clicks", value: "0", meta: "—", tone: "purple", stroke: "#b41cff", Icon: ArrowUpRight },
        { label: "Bounced", value: "0", meta: "—", tone: "red", stroke: "#ff303c", Icon: X },
      ]
    : [
        { label: "Total Campaigns", value: "12", meta: "↑ 33%", tone: "blue", stroke: "#0757ff", Icon: Send },
        { label: "Recipients", value: "3,245", meta: "↑ 18%", tone: "green", stroke: "#00ae62", Icon: Users },
        { label: "Delivered", value: "2,980", meta: "↑ 92%", tone: "blue2", stroke: "#00bf71", Icon: Mail },
        { label: "Link Clicks", value: "642", meta: "↑ 21%", tone: "purple", stroke: "#b41cff", Icon: ArrowUpRight },
        { label: "Bounced", value: "38", meta: "↓ 1.2%", tone: "red", stroke: "#ff303c", Icon: X },
      ];

  const iconTone: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    blue2: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-500",
  };

  const metaTone: Record<string, string> = {
    blue: "text-emerald-600",
    blue2: "text-emerald-600",
    green: "text-emerald-600",
    purple: "text-purple-600",
    red: "text-red-500",
  };

  const channelTabs: CommChannel[] = ["All", "Email", "SMS", "In-App", "WhatsApp"];
  const segments = live
    ? communicationSegments.map((s) => ({ ...s, count: 0, pct: 0 }))
    : communicationSegments;
  const donutGradient = live
    ? "conic-gradient(#d7e5f5 0 100%)"
    : "conic-gradient(#0757ff 0 38%, #00a66a 38% 72%, #ffbf00 72% 75%, #a020f0 75% 99%, #f43f5e 99% 100%)";

  const barPairs = [
    [18, 8],
    [35, 15],
    [24, 10],
    [53, 20],
    [32, 18],
    [43, 15],
    [30, 10],
    [65, 23],
    [47, 18],
    [78, 30],
    [56, 23],
    [92, 35],
  ];

  return (
    <div className="relative text-[#07135f]">
      <section className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={cn(
              "relative flex h-[92px] gap-2 rounded-lg border border-blue-100 bg-white/90 p-2.5 shadow-sm sm:h-[100px] sm:gap-3 sm:p-3",
              kpi.label === "Bounced" && "col-span-2 sm:col-span-1",
            )}
          >
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-lg sm:h-14 sm:w-14",
                iconTone[kpi.tone],
              )}
            >
              <kpi.Icon size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <strong className="block text-base font-extrabold leading-6 sm:text-xl">{kpi.value}</strong>
              <span className="block text-[10px] text-blue-700 sm:text-xs">{kpi.label}</span>
              <b className={cn("mt-1 block text-xs sm:text-sm", live ? "font-semibold text-slate-400" : metaTone[kpi.tone])}>
                {kpi.meta}
              </b>
            </div>
            <svg
              className={cn("absolute right-1.5 bottom-1.5 h-6 w-14 sm:h-7 sm:w-[92px]", live && "opacity-35")}
              viewBox="0 0 100 30"
              aria-hidden
            >
              <path
                fill="none"
                stroke={kpi.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M1 28 L12 24 L20 25 L31 18 L41 20 L50 13 L60 16 L70 8 L80 12 L91 3 L99 0"
              />
            </svg>
          </article>
        ))}
      </section>

      <section className="grid items-start gap-2.5 xl:grid-cols-[minmax(0,3.2fr)_minmax(280px,1fr)]">
        <div className="min-w-0">
          <section className="mb-2.5 overflow-hidden rounded-lg border border-blue-100 bg-white/90 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 px-3.5 py-3">
              <Send size={18} className="text-blue-700" />
              <h2 className="text-sm font-extrabold">Communication Campaigns</h2>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => showToast("Connect this button to your campaign creation form or API.")}
                className="h-[30px] rounded-md bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <span className="inline-flex items-center gap-1">
                  <Plus size={12} strokeWidth={3} /> New Campaign
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-3.5 pb-2.5">
              <div className="flex flex-wrap gap-1.5">
                {channelTabs.map((tab) => {
                  const count = communicationChannelCounts[tab];
                  const active = channel === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setChannel(tab)}
                      className={cn(
                        "rounded border px-3 py-2 text-[10px]",
                        active
                          ? "border-blue-400 bg-blue-50 font-semibold text-blue-700"
                          : "border-blue-100",
                      )}
                    >
                      {tab} ({live ? 0 : count})
                    </button>
                  );
                })}
              </div>
              <span className="flex-1" />
              <label className="flex h-[30px] w-[185px] items-center gap-1.5 rounded-md border border-blue-100 px-2.5">
                <Search size={12} className="text-blue-400" />
                <input
                  className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-blue-400"
                  placeholder="Search campaigns..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                className="h-[30px] rounded-md border border-blue-100 bg-white px-2 text-[10px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option>Sent</option>
                <option>Scheduled</option>
                <option>Draft</option>
              </select>
            </div>

            <div className="overflow-x-auto px-3.5 pb-3">
              <table className="w-full min-w-[780px] border-separate border-spacing-0 text-[10px] text-blue-900">
                <thead>
                  <tr className="bg-blue-50 text-left text-[#07165e]">
                    <th className="border-y border-l border-blue-100 px-2 py-2">#</th>
                    <th className="border-y border-blue-100 px-2 py-2">Campaign Name</th>
                    <th className="border-y border-blue-100 px-2 py-2">Channel</th>
                    <th className="border-y border-blue-100 px-2 py-2">Audience</th>
                    <th className="border-y border-blue-100 px-2 py-2">Recipients</th>
                    <th className="border-y border-blue-100 px-2 py-2">Delivered</th>
                    <th className="border-y border-blue-100 px-2 py-2">Clicks</th>
                    <th className="border-y border-blue-100 px-2 py-2">Status</th>
                    <th className="border-y border-blue-100 px-2 py-2">Date Sent</th>
                    <th className="border-y border-r border-blue-100 px-2 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="border-b border-x border-blue-100 px-2 py-8 text-center text-blue-500"
                      >
                        {live
                          ? "No campaigns yet — create one to reach your participants."
                          : "No campaigns match these filters."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, i) => (
                      <tr key={c.id}>
                        <td className="border-b border-l border-blue-100 px-2 py-2.5">{i + 1}</td>
                        <td className="border-b border-blue-100 px-2 py-2.5 font-medium">{c.name}</td>
                        <td className="border-b border-blue-100 px-2 py-2.5">{channelBadge(c.channel)}</td>
                        <td className="border-b border-blue-100 px-2 py-2.5">{c.audience}</td>
                        <td className="border-b border-blue-100 px-2 py-2.5">
                          {c.recipients.toLocaleString()}
                        </td>
                        <td className="border-b border-blue-100 px-2 py-2.5">
                          {c.delivered.toLocaleString()} ({c.deliveredPct}%)
                        </td>
                        <td className="border-b border-blue-100 px-2 py-2.5">
                          {c.clicks.toLocaleString()} ({c.clicksPct}%)
                        </td>
                        <td className="border-b border-blue-100 px-2 py-2.5">
                          <span className="rounded-md bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                            {c.status}
                          </span>
                        </td>
                        <td className="border-b border-blue-100 px-2 py-2.5">
                          {c.date}
                          <br />
                          {c.time}
                        </td>
                        <td className="border-b border-r border-blue-100 px-2 py-2 text-center">
                          <button
                            type="button"
                            className="mr-1 rounded border border-blue-100 px-2 py-1 text-blue-600"
                            aria-label={`View ${c.name}`}
                          >
                            <LayoutGrid size={12} />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-blue-100 px-2 py-1 text-blue-600"
                            aria-label={`More for ${c.name}`}
                          >
                            <MoreHorizontal size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-2.5 md:grid-cols-2">
            <section className="rounded-lg border border-blue-100 bg-white/90 p-3.5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Zap size={18} className="text-blue-600" />
                <h2 className="text-sm font-extrabold">Campaign Performance</h2>
                <span className="flex-1" />
                <select className="rounded-md border border-blue-100 bg-white px-2 py-1.5 text-[10px]">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className={cn("relative pl-7", live && "opacity-40")}>
                <div className="absolute inset-y-0 left-0 flex flex-col justify-between pb-5 text-[10px] text-blue-700">
                  <span>400</span>
                  <span>300</span>
                  <span>200</span>
                  <span>100</span>
                  <span>0</span>
                </div>
                <div className="flex h-[124px] items-end justify-around gap-1 border-b border-l border-blue-100 bg-[linear-gradient(to_bottom,transparent_24%,#dbeafe_25%,transparent_26%,transparent_49%,#dbeafe_50%,transparent_51%,transparent_74%,#dbeafe_75%,transparent_76%)] px-1">
                  {barPairs.map(([a, b], i) => (
                    <div key={i} className="flex h-full items-end gap-0.5">
                      <i className="w-2 bg-blue-600" style={{ height: `${a}%` }} />
                      <i
                        className={cn("w-2", i % 3 === 2 ? "bg-amber-400" : i % 2 === 0 ? "bg-emerald-500" : "bg-sky-300")}
                        style={{ height: `${b}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-1 text-[9px] text-blue-700">
                  <span>Sep 01</span>
                  <span>Sep 05</span>
                  <span>Sep 10</span>
                  <span>Sep 15</span>
                  <span>Sep 20</span>
                  <span>Sep 25</span>
                  <span>Sep 30</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-4 text-[10px] text-blue-700">
                <span>🔵 Emails</span>
                <span>🟢 SMS</span>
                <span>🟡 WhatsApp</span>
                <span>🟣 In-App</span>
              </div>
            </section>

            <section className="rounded-lg border border-blue-100 bg-white/90 p-3.5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <LayoutGrid size={18} className="text-blue-600" />
                <h2 className="text-sm font-extrabold">Recipient Segments</h2>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                <div
                  className="relative grid h-[130px] w-[130px] shrink-0 place-items-center rounded-full after:absolute after:inset-5 after:rounded-full after:bg-white"
                  style={{ background: donutGradient }}
                >
                  <div className="relative z-10 text-center">
                    <strong className="block text-lg">{live ? "0" : "3,245"}</strong>
                    <span className="text-[10px] text-blue-700">Recipients</span>
                  </div>
                </div>
                <div className="min-w-[155px] flex-1 space-y-2.5 text-xs text-blue-700">
                  {segments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <i className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                      {s.label}
                      <span className="ml-auto">
                        {s.count.toLocaleString()} ({s.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="grid items-start gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-lg border border-blue-100 bg-white/90 p-3.5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Zap size={18} />
              <h2 className="text-sm font-extrabold">Quick Actions</h2>
            </div>
            <div className="space-y-1.5">
              {(
                [
                  { label: "Send Email Campaign", Icon: Mail, tone: "text-blue-600" },
                  { label: "Send SMS Campaign", Icon: Send, tone: "text-emerald-600" },
                  { label: "Send WhatsApp Campaign", Icon: Send, tone: "text-emerald-600" },
                  { label: "Send In-App Notification", Icon: Users, tone: "text-blue-600" },
                  { label: "Message Templates", Icon: LayoutGrid, tone: "text-blue-600" },
                ] as const
              ).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() =>
                    showToast(`${action.label} — connect this action to your communications workflow.`)
                  }
                  className="flex h-[40px] w-full items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-3 text-left text-[11px] hover:bg-blue-50"
                >
                  <span className={cn("grid w-7 place-items-center", action.tone)}>
                    <action.Icon size={18} />
                  </span>
                  <span className="flex-1">{action.label}</span>
                  <b className="text-lg">›</b>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-blue-100 bg-white/90 p-3.5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid size={18} className="text-blue-600" />
              <h2 className="text-sm font-extrabold">Message Templates</h2>
              <span className="flex-1" />
              <button type="button" className="text-[11px] text-blue-600">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[260px] border-separate border-spacing-0 text-[10px] text-blue-800">
                <thead>
                  <tr className="bg-blue-50 text-left">
                    <th className="border-y border-l border-blue-100 px-2 py-2">Template Name</th>
                    <th className="border-y border-blue-100 px-2 py-2">Channel</th>
                    <th className="border-y border-r border-blue-100 px-2 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(live ? [] : communicationTemplates).map((t) => (
                    <tr key={t.id}>
                      <td className="border-b border-l border-blue-100 px-2 py-2">{t.name}</td>
                      <td className="border-b border-blue-100 px-2 py-2">{channelBadge(t.channel)}</td>
                      <td className="border-b border-r border-blue-100 px-2 py-2">
                        <button type="button" className="mr-1 rounded border border-blue-100 px-2 py-1" aria-label={`Edit ${t.name}`}>
                          <Pencil size={12} />
                        </button>
                        <button type="button" className="rounded border border-blue-100 px-2 py-1" aria-label={`More for ${t.name}`}>
                          <MoreHorizontal size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {live ? (
                    <tr>
                      <td colSpan={3} className="border-b border-x border-blue-100 px-2 py-6 text-center text-blue-400">
                        No templates yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-3 text-[10px] text-blue-600">
              <span className="inline-flex items-center gap-1">
                <Phone size={12} /> {phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail size={12} /> {email}
              </span>
            </div>
          </section>
        </aside>
      </section>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
