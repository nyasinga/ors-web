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
  Ticket,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Donut } from "../../components/ui/Donut";
import { Pill } from "../../components/ui/Pill";
import { Table } from "../../components/ui/Table";
import {
  draftSpeakers,
  eventDetail,
  eventDetailTabs,
  eventMessages,
  eventParticipants,
  eventSchedule,
  eventSponsors,
  eventTickets,
  participantMix,
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
  formatEngagementStatusLabel,
  formatModeLabel,
  getEngagement,
  toUiEventType,
} from "../../lib/engagements";
import { cn } from "../../lib/cn";
import type { Engagement, EngagementSpeaker, EngagementSponsor } from "../../types/engagement";

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
        value: fromApi ? String(sponsors.length) : "24",
        trend: fromApi ? "—" : "↑ 10%",
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
    <div className="ed-page">
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

      <div className="ed-crumb">
        <Link to="/admin/events" className="ed-back" aria-label="Back to events">
          <ArrowLeft size={18} />
        </Link>
        <b>Events</b>
        <span className="ed-crumb-sep">›</span>
        <span>{detail.name}</span>
        <div className="ed-crumb-actions">
          <button type="button" className="ed-btn">
            <Eye size={12} /> Preview Event
          </button>
          <Link to={`/admin/events/${id}/edit`} className="ed-btn ed-btn-primary">
            <Pencil size={12} /> Edit Event
          </Link>
          <button type="button" className="ed-btn">
            <MoreHorizontal size={12} /> More Actions
            <ChevronRight size={12} style={{ transform: "rotate(90deg)" }} />
          </button>
        </div>
      </div>

      <div className="ed-head">
        <div className="ed-cover">
          <img src={detail.cover} alt="" />
        </div>
        <div className="ed-title">
          <h1>
            {detail.name}
            <span className="ed-pub">{detail.statusLabel}</span>
          </h1>
          <div className="ed-sub">{detail.theme}</div>
          <div className="ed-meta">
            <div className="ed-mi">
              <span className="ed-mi-ico">
                <CalendarDays size={14} />
              </span>
              <div>
                <b>{detail.dates}</b>
                <small>{detail.time}</small>
              </div>
            </div>
            <div className="ed-mi">
              <span className="ed-mi-ico">
                <MapPin size={14} />
              </span>
              <div>
                <b>{detail.venueTitle}</b>
                <small>{detail.venueCity}</small>
              </div>
            </div>
            <div className="ed-mi">
              <span className="ed-mi-ico">
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

      <div className="ed-stats">
        {kpis.map((kpi) => {
          const Icon = kpiIcon[kpi.tone];
          const mutedTrend = fromApi && (kpi.trend === "—" || kpi.value === "0" || kpi.value === "KES 0");
          return (
            <div key={kpi.label} className={cn("ed-stat", `ed-stat--${kpi.tone}`)}>
              <div className="ed-si">
                <Icon size={26} strokeWidth={1.75} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="ed-num">{kpi.value}</div>
                <div className="ed-lab">{kpi.label}</div>
                <div className={cn("ed-trend", mutedTrend && "ed-trend--muted")}>{kpi.trend}</div>
                <svg
                  viewBox="0 0 120 32"
                  className={cn("ed-spark", mutedTrend && "ed-spark--muted")}
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

      <nav className="ed-tabs" aria-label="Event sections">
        {eventDetailTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={validTab === t.id ? "ed-tab-active" : undefined}
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
        <div className="ed-panel">
          <TicketsTab />
        </div>
      ) : null}
      {validTab === "participants" ? (
        <div className="ed-panel">
          <ParticipantsTab />
        </div>
      ) : null}
      {validTab === "programme" ? (
        <div className="ed-panel">
          <ProgrammeTab programme={detail.programme} />
        </div>
      ) : null}
      {validTab === "speakers" ? (
        <div className="ed-panel">
          <SpeakersTab speakers={speakers} fromApi={fromApi} />
        </div>
      ) : null}
      {validTab === "sponsors" || validTab === "exhibitors" ? (
        <div className="ed-panel">
          <SponsorsTab sponsors={sponsors} fromApi={fromApi} />
        </div>
      ) : null}
      {validTab === "communications" ? (
        <div className="ed-panel">
          <CommunicationsTab email={detail.email} phone={detail.phone} />
        </div>
      ) : null}
      {validTab === "payments" ? (
        <div className="ed-panel">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">Event Payments</h2>
              <Link to="/admin/payments">
                <Button variant="outline" size="sm">
                  Open Payments Hub <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Collected", value: "KES 2,740,000" },
                { label: "Pending", value: "KES 210,000" },
                { label: "Failed", value: "KES 55,000" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-mute">{kpi.label}</p>
                  <p className="mt-1 font-bold text-ink">{kpi.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-mute">
              Event-scoped ledger for ticket, sponsorship and exhibitor payments.
            </p>
          </Card>
        </div>
      ) : null}
      {validTab === "settings" ? (
        <div className="ed-panel">
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

  return (
    <>
      <div className="ed-grid">
        <article className="ed-card">
          <div className="ed-ch">
            <span className="ed-ci">
              <LayoutGrid size={18} />
            </span>
            <h2>Event Information</h2>
            <Link to={`/admin/events/${id}/edit?step=2`} className="ed-btn ed-edit">
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <div className="ed-info">
            <div className="ed-row">
              <b>Event Name</b>
              <span>{detail.name}</span>
            </div>
            <div className="ed-row">
              <b>Event Type</b>
              <span>{detail.type}</span>
            </div>
            <div className="ed-row">
              <b>Theme</b>
              <span>{detail.theme}</span>
            </div>
            <div className="ed-row">
              <b>Category</b>
              <span>{detail.category}</span>
            </div>
            <div className="ed-row">
              <b>Dates</b>
              <span>
                {detail.dates}
                <br />
                {detail.time}
              </span>
            </div>
            <div className="ed-row">
              <b>Mode</b>
              <span>{detail.mode}</span>
            </div>
            <div className="ed-row">
              <b>Venue</b>
              <span>{detail.venue}</span>
            </div>
            <div className="ed-row">
              <b>Organizer</b>
              <span>{detail.organizer}</span>
            </div>
            <div className="ed-row">
              <b />
              <span />
            </div>
            <div className="ed-row">
              <b>Contact Email</b>
              <span>{detail.email}</span>
            </div>
            <div className="ed-row">
              <b />
              <span />
            </div>
            <div className="ed-row">
              <b>Contact Phone</b>
              <span>{detail.phone}</span>
            </div>
          </div>
        </article>

        <article className="ed-card ed-status">
          <div className="ed-sttop">
            <div className="ed-check">
              <Check size={18} strokeWidth={3} />
            </div>
            <div>
              <div className="ed-sttitle">Event Status</div>
              <span className="ed-pill">{detail.statusLabel}</span>
            </div>
          </div>
          <p className="ed-sttext">
            {detail.registration === "Open"
              ? "This event is live and accepting registrations."
              : "Registration is currently closed for this event."}
          </p>
          <div className="ed-strows">
            <div className="ed-strow">
              <b>Created By</b>
              <span>{detail.createdBy}</span>
            </div>
            <div className="ed-strow">
              <b>Created On</b>
              <span>{detail.createdOn}</span>
            </div>
            <div className="ed-strow">
              <b>Last Updated</b>
              <span>{detail.lastUpdated}</span>
            </div>
            <div className="ed-strow">
              <b>Visibility</b>
              <span>{detail.visibility}</span>
            </div>
            <div className="ed-strow">
              <b>Registration</b>
              <span className="ed-pill">{detail.registration}</span>
            </div>
            <div className="ed-strow">
              <b>Payment</b>
              <span className="ed-pill">{detail.payment}</span>
            </div>
          </div>
        </article>

        <article className="ed-card ed-quick">
          <div className="ed-ch">
            <span className="ed-ci">
              <Zap size={18} />
            </span>
            <h2>Quick Actions</h2>
          </div>
          <Link to={`/admin/events/${id}/tickets`} className="ed-q">
            <span className="ed-q-ico">
              <Ticket size={16} />
            </span>
            Manage Tickets
            <b>›</b>
          </Link>
          <Link to={`/admin/events/${id}/participants`} className="ed-q">
            <span className="ed-q-ico">
              <Users size={16} />
            </span>
            View Participants
            <b>›</b>
          </Link>
          <Link to={`/admin/events/${id}/programme`} className="ed-q">
            <span className="ed-q-ico">
              <LayoutGrid size={16} />
            </span>
            Generate Programme
            <b>›</b>
          </Link>
          <Link to={`/admin/events/${id}/communications`} className="ed-q">
            <span className="ed-q-ico">
              <Mail size={16} />
            </span>
            Send Notifications
            <b>›</b>
          </Link>
        </article>

        <article className="ed-card ed-desc ed-full">
          <div className="ed-ch">
            <span className="ed-ci">
              <LayoutGrid size={18} />
            </span>
            <h2>Event Description</h2>
            <Link to={`/admin/events/${id}/edit?step=2`} className="ed-btn ed-edit">
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <p>{detail.description}</p>
          {detail.descriptionExtra ? <p>{detail.descriptionExtra}</p> : null}
        </article>

        <article className="ed-card ed-social">
          <div className="ed-ch">
            <span className="ed-ci">
              <ArrowUpRight size={18} />
            </span>
            <h2>Social Media & Links</h2>
            <Link to={`/admin/events/${id}/edit?step=6`} className="ed-btn ed-edit">
              <Pencil size={12} /> Edit
            </Link>
          </div>
          <div className="ed-socialgrid">
            {socialLinks.map((link) => {
              const hasUrl = Boolean(link.url);
              const inner = (
                <>
                  <i className={cn("ed-socicon", link.x && "ed-socicon--x")}>{link.icon}</i>
                  <div>
                    <div className="ed-label">{link.label}</div>
                    <div className={cn("ed-url", !hasUrl && "ed-url--empty")}>
                      {hasUrl ? link.url : "Not set — edit to add"}
                    </div>
                  </div>
                  <ExternalLink size={12} className="ed-ext" />
                </>
              );
              return hasUrl ? (
                <a
                  key={link.label}
                  href={link.url}
                  className="ed-socialitem"
                  target="_blank"
                  rel="noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div key={link.label} className="ed-socialitem ed-socialitem--empty">
                  {inner}
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="ed-bottom">
        <article className="ed-card">
          <div className="ed-ch">
            <span className="ed-ci">
              <Users size={18} />
            </span>
            <h2>Recent Registrations</h2>
            <Link to={`/admin/events/${id}/participants`} className="ed-link-all">
              View All →
            </Link>
          </div>
          <table className="ed-tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ed-tbl-empty">
                    No registrations yet — new sign-ups will appear here.
                  </td>
                </tr>
              ) : (
                registrations.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.type}</td>
                    <td>{p.org}</td>
                    <td>
                      <span className={p.status === "Confirmed" ? "ed-pill" : "ed-pill ed-pill-pending"}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>

        <article className="ed-card">
          <div className="ed-ch">
            <span className="ed-ci">
              <LayoutGrid size={18} />
            </span>
            <h2>Upcoming Schedule</h2>
            <Link to={`/admin/events/${id}/programme`} className="ed-link-all">
              View All →
            </Link>
          </div>
          {schedule.length === 0 ? (
            <p className="text-sm text-mute">No sessions yet.</p>
          ) : (
            <div className="ed-sessions">
              {schedule.map((s) => (
                <Link key={s.key} to={`/admin/events/${id}/programme`} className="ed-session">
                  <div className="ed-date">
                    {s.month}
                    <br />
                    {s.day}
                  </div>
                  <div>
                    <div className="ed-st">{s.title}</div>
                    <div className="ed-sm">
                      ◉ {s.time}　|　⌖ {s.place}
                    </div>
                  </div>
                  <span className="ed-session-chev">›</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="ed-card">
          <div className="ed-ch">
            <span className="ed-ci">
              <Users size={18} />
            </span>
            <h2>Participant Overview</h2>
            <Link to={`/admin/events/${id}/participants`} className="ed-link-all">
              View All →
            </Link>
          </div>
          <div className="ed-donutwrap">
            <div className={cn("ed-donut", participantTotal === 0 && "ed-donut--empty")}>
              <div className="ed-dt">
                {participantTotal.toLocaleString()}
                <small>Participants</small>
              </div>
            </div>
            <div className="ed-legend">
              {participantSlices.map((slice) => (
                <div key={slice.label}>
                  <i className="ed-dot" style={{ background: slice.color }} />
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

function TicketsTab() {
  const sold = eventTickets.reduce((s, t) => s + t.sold, 0);
  const capacity = eventTickets.reduce((s, t) => s + t.capacity, 0);
  const remaining = capacity - sold;
  const ticketKpis = [
    { label: "Total Tickets", value: capacity.toLocaleString(), meta: "↑ 12%" },
    { label: "Tickets Sold", value: sold.toLocaleString(), meta: "83%" },
    { label: "Tickets Remaining", value: remaining.toLocaleString(), meta: "17%" },
  ];
  const maxSold = Math.max(...eventTickets.map((t) => t.sold), 1);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {ticketKpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-sm text-mute">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{kpi.value}</p>
            <p className="mt-1 text-xs font-semibold text-green">{kpi.meta}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
            <Ticket size={18} className="text-blue" /> Ticket Types
          </h2>
          <Button size="sm">
            <Plus size={14} /> Add
          </Button>
        </div>
        <Table
          rowKey={(r) => r.name}
          columns={[
            { key: "name", header: "Ticket Type", render: (r) => <span className="font-semibold">{r.name}</span> },
            { key: "price", header: "Price (KES)", render: (r) => r.price },
            { key: "capacity", header: "Quantity", render: (r) => r.capacity },
            { key: "sold", header: "Sold", render: (r) => r.sold },
            { key: "remaining", header: "Remaining", render: (r) => r.capacity - r.sold },
            {
              key: "revenue",
              header: "Revenue",
              render: (r) => `KES ${(r.sold * Number(r.price.replace(/[^\d]/g, "") || 0)).toLocaleString()}`,
            },
            {
              key: "status",
              header: "Status",
              render: (r) => <Pill tone="green">{r.status}</Pill>,
            },
          ]}
          rows={eventTickets}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold text-navy">Top Performing Ticket Types</h2>
          <Table
            rowKey={(r) => r.name}
            columns={[
              { key: "rank", header: "#", render: (r) => eventTickets.findIndex((t) => t.name === r.name) + 1 },
              { key: "name", header: "Ticket Type", render: (r) => r.name },
              { key: "sold", header: "Sold", render: (r) => r.sold },
              {
                key: "pct",
                header: "%",
                render: (r) => `${Math.round((r.sold / sold) * 100)}%`,
              },
            ]}
            rows={[...eventTickets].sort((a, b) => b.sold - a.sold)}
          />
        </Card>
        <Card>
          <h2 className="mb-3 font-bold text-navy">Revenue by Ticket Type</h2>
          <ul className="grid gap-3">
            {eventTickets.map((t) => {
              const price = Number(t.price.replace(/[^\d]/g, "")) || 0;
              const revenue = t.sold * price;
              return (
                <li key={t.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{t.name}</span>
                    <span className="text-mute">KES {revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue"
                      style={{ width: `${Math.round((t.sold / maxSold) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ParticipantsTab() {
  const participantKpis = [
    { label: "Total", value: "1,248" },
    { label: "Confirmed", value: "1,102" },
    { label: "Pending", value: "96" },
    { label: "Checked in", value: "0" },
    { label: "Countries", value: "42" },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {participantKpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-sm text-mute">{kpi.label}</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{kpi.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-ink">Participants</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Export CSV
              </Button>
              <Button size="sm">
                <Users size={14} /> Add Participant
              </Button>
            </div>
          </div>
          <Table
            rowKey={(r) => r.name}
            columns={[
              { key: "name", header: "Name", render: (r) => r.name },
              { key: "type", header: "Type", render: (r) => r.type },
              { key: "org", header: "Organization", render: (r) => r.org },
              {
                key: "status",
                header: "Status",
                render: (r) => <Pill tone={r.status === "Confirmed" ? "green" : "orange"}>{r.status}</Pill>,
              },
              { key: "date", header: "Date", render: (r) => r.date },
            ]}
            rows={eventParticipants}
          />
        </Card>
        <aside className="grid gap-4 self-start">
          <Card>
            <h2 className="font-bold text-ink">Participant Mix</h2>
            <div className="mt-3">
              <Donut slices={participantMix} centerValue="1,102" centerLabel="Confirmed" size={130} />
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-bold text-ink">Filters</h2>
            <div className="grid gap-2 text-sm">
              {["All types", "Delegates", "Speakers", "Sponsors", "Exhibitors"].map((f, i) => (
                <button
                  key={f}
                  type="button"
                  className={cn(
                    "rounded-lg px-3 py-2 text-left font-medium",
                    i === 0 ? "bg-soft text-blue" : "text-mute hover:bg-slate-50",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>
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

function SponsorsTab({
  sponsors,
  fromApi,
}: {
  sponsors: EngagementSponsor[];
  fromApi: boolean;
}) {
  if (fromApi) {
    return (
      <Card>
        <h2 className="mb-4 text-lg font-bold text-ink">Sponsors & Exhibitors</h2>
        {sponsors.length === 0 ? (
          <p className="text-sm text-mute">No sponsorship packages saved for this event yet.</p>
        ) : (
          <Table
            rowKey={(r) => r.id || r.name}
            columns={[
              { key: "name", header: "Package", render: (r) => r.name },
              {
                key: "tier",
                header: "Tier",
                render: (r) => <Pill tone="blue">{r.tier || r.name}</Pill>,
              },
              {
                key: "value",
                header: "Value",
                render: (r) =>
                  typeof r.price === "number" ? `KES ${r.price.toLocaleString()}` : r.price || "—",
              },
              {
                key: "status",
                header: "Status",
                render: (r) => (
                  <Pill tone={r.active === false ? "orange" : "green"}>
                    {r.active === false ? "Inactive" : "Active"}
                  </Pill>
                ),
              },
            ]}
            rows={sponsors}
          />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-ink">Sponsors & Exhibitors</h2>
      <Table
        rowKey={(r) => r.name}
        columns={[
          { key: "name", header: "Organisation", render: (r) => r.name },
          { key: "tier", header: "Tier", render: (r) => <Pill tone="blue">{r.tier}</Pill> },
          { key: "value", header: "Value", render: (r) => r.value },
          {
            key: "status",
            header: "Status",
            render: (r) => <Pill tone={r.status === "Confirmed" ? "green" : "orange"}>{r.status}</Pill>,
          },
        ]}
        rows={eventSponsors}
      />
    </Card>
  );
}

function CommunicationsTab({ email, phone }: { email: string; phone: string }) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">Communications</h2>
        <Button size="sm">
          <Mail size={14} /> New Message
        </Button>
      </div>
      <Table
        rowKey={(r) => r.id}
        columns={[
          { key: "subject", header: "Subject", render: (r) => r.subject },
          { key: "audience", header: "Audience", render: (r) => r.audience },
          { key: "sent", header: "Sent", render: (r) => r.sent },
          {
            key: "status",
            header: "Status",
            render: (r) => <Pill tone={r.status === "Sent" ? "green" : "neutral"}>{r.status}</Pill>,
          },
        ]}
        rows={eventMessages}
      />
      <div className="mt-4 flex gap-3 text-sm text-mute">
        <span className="inline-flex items-center gap-1">
          <Phone size={14} /> {phone}
        </span>
        <span className="inline-flex items-center gap-1">
          <Mail size={14} /> {email}
        </span>
      </div>
    </Card>
  );
}
