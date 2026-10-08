import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Mail,
  MapPin,
  Mic2,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Donut } from "../../components/ui/Donut";
import { Pill } from "../../components/ui/Pill";
import { Table } from "../../components/ui/Table";
import { Tabs } from "../../components/ui/Tabs";
import {
  draftSpeakers,
  eventDetail,
  eventDetailKpis,
  eventDetailTabs,
  eventMessages,
  eventParticipants,
  eventSchedule,
  eventSponsors,
  eventTickets,
  participantMix,
} from "../../data/adminEvents";
import { cn } from "../../lib/cn";

const kpiTone = {
  blue: "bg-soft text-blue",
  green: "bg-green-50 text-green",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red",
};

/** Screen E Event Details (+ tab variants) */
export function EventDetailsPage() {
  const { id = "isippe-3", tab = "overview" } = useParams();
  const navigate = useNavigate();
  const validTab = eventDetailTabs.some((t) => t.id === tab) ? tab : "overview";

  if (tab === "reports") {
    return <Navigate to={`/admin/events/${id}/reports`} replace />;
  }

  const tabLabel = eventDetailTabs.find((t) => t.id === validTab)?.label ?? "Overview";

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-mute" aria-label="Breadcrumb">
          <Link to="/admin/events" className="inline-flex items-center gap-1.5 hover:text-blue">
            <ArrowLeft size={14} /> Events
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">{eventDetail.name}</span>
          {validTab !== "overview" ? (
            <>
              <span>/</span>
              <span className="font-medium text-ink">{tabLabel}</span>
            </>
          ) : null}
        </nav>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Eye size={14} /> Preview Event
          </Button>
          <Link to="/admin/events/new">
            <Button variant="outline" size="sm">
              <Pencil size={14} /> Edit Event
            </Button>
          </Link>
          <Button variant="ghost" size="sm" aria-label="More actions">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden" padded={false}>
        <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr] md:p-5">
          <div className="relative overflow-hidden rounded-lg bg-navy">
            <img
              src="/assets/hero-nairobi.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div className="relative grid min-h-[140px] place-items-center p-4">
              <img src="/assets/logo-isippe.png" alt="ISIPPE 2026" className="h-16 w-auto object-contain drop-shadow" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-navy md:text-2xl">{eventDetail.name}</h1>
              <Pill tone="green">{eventDetail.status}</Pill>
            </div>
            <p className="mt-1 text-sm text-mute">{eventDetail.theme.replace(/\.$/, "")}</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p className="flex items-start gap-2 text-mute">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-blue" />
                <span>
                  <span className="block font-medium text-ink">{eventDetail.dates}</span>
                  {eventDetail.time}
                </span>
              </p>
              <p className="flex items-start gap-2 text-mute">
                <MapPin size={16} className="mt-0.5 shrink-0 text-blue" />
                <span>
                  <span className="block font-medium text-ink">Kenyatta International Convention Centre</span>
                  Nairobi, Kenya
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {eventDetailKpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-mute">{kpi.label}</p>
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg", kpiTone[kpi.tone])}>
                {kpi.tone === "blue" ? <Users size={16} /> : null}
                {kpi.tone === "green" ? <CheckCircle2 size={16} /> : null}
                {kpi.tone === "purple" ? <Mic2 size={16} /> : null}
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{kpi.value}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green">
              <TrendingUp size={12} /> {kpi.trend}
            </p>
            <div className="mt-3 h-8">
              <svg viewBox="0 0 120 32" className="h-full w-full" aria-hidden>
                <polyline
                  fill="none"
                  strokeWidth="2"
                  stroke={kpi.tone === "green" ? "#0B7A3B" : kpi.tone === "purple" ? "#7C3AED" : "#0B45E0"}
                  points="0,24 20,20 40,22 60,14 80,16 100,8 120,10"
                />
              </svg>
            </div>
          </Card>
        ))}
      </div>

      <Tabs
        items={eventDetailTabs}
        value={validTab}
        onChange={(next) => {
          if (next === "reports") navigate(`/admin/events/${id}/reports`);
          else navigate(`/admin/events/${id}/${next}`);
        }}
      />

      {validTab === "overview" ? <OverviewTab /> : null}
      {validTab === "tickets" ? <TicketsTab /> : null}
      {validTab === "participants" ? <ParticipantsTab /> : null}
      {validTab === "programme" ? <ProgrammeTab /> : null}
      {validTab === "speakers" ? <SpeakersTab /> : null}
      {validTab === "sponsors" || validTab === "exhibitors" ? <SponsorsTab /> : null}
      {validTab === "communications" ? <CommunicationsTab /> : null}
      {validTab === "payments" ? (
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
      ) : null}
      {validTab === "settings" ? (
        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Event Settings</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Visibility", eventDetail.visibility],
              ["Registration", eventDetail.registration],
              ["Payment", eventDetail.payment],
              ["Mode", eventDetail.mode],
              ["Category", eventDetail.category],
              ["Organizer", eventDetail.organizer],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                <dt className="text-mute">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <Link to="/admin/events/new" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              Edit in Create Wizard <ArrowRight size={14} />
            </Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.55fr_0.9fr]">
      <div className="grid gap-4">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-navy">Event Information</h2>
            <Button variant="ghost" size="sm">
              <Pencil size={14} /> Edit
            </Button>
          </div>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Event Name", eventDetail.name],
              ["Theme", eventDetail.theme.replace(/\.$/, "")],
              ["Dates", eventDetail.dates],
              ["Venue", "KICC, Nairobi"],
              ["Event Type", eventDetail.type],
              ["Category", eventDetail.category],
              ["Mode", eventDetail.mode],
              ["Organizer", eventDetail.organizer],
              ["Contact Email", eventDetail.email],
              ["Contact Phone", eventDetail.phone],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-slate-50 pb-2">
                <dt className="text-xs text-mute">{k}</dt>
                <dd className="mt-0.5 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-navy">Event Description</h2>
            <Button variant="ghost" size="sm">
              <Pencil size={14} /> Edit
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-mute">{eventDetail.description}</p>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            Sessions cover enforcement collaboration, digital tools, and industry partnerships that strengthen authentic
            trade across the region.
          </p>
        </Card>

        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-bold text-navy">Recent Registrations</h2>
            <Link
              to={`/admin/events/${eventDetail.id}/participants`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <Table
            className="rounded-none border-0"
            rowKey={(r) => r.name}
            columns={[
              { key: "name", header: "Name", render: (r) => <span className="font-medium text-ink">{r.name}</span> },
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
      </div>

      <aside className="grid gap-4 self-start">
        <Card className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-50">
            <CheckCircle2 className="text-green" size={28} />
          </div>
          <p className="mt-3 font-bold text-navy">Published</p>
          <p className="mt-1 text-sm text-mute">Live and accepting registrations.</p>
          <dl className="mt-4 grid gap-2 text-left text-sm">
            {[
              ["Visibility", eventDetail.visibility],
              ["Registration", eventDetail.registration],
              ["Payment", eventDetail.payment],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-mute">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-navy">Social Media & Links</h2>
            <Button variant="ghost" size="sm" aria-label="Edit links">
              <Pencil size={14} />
            </Button>
          </div>
          <div className="grid gap-2">
            <a
              href={eventDetail.website}
              className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-blue hover:bg-soft"
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={16} /> Event Website
            </a>
            <a
              href={eventDetail.twitter}
              className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-blue hover:bg-soft"
              target="_blank"
              rel="noreferrer"
            >
              <span className="grid h-4 w-4 place-items-center text-xs font-bold" aria-hidden>
                𝕏
              </span>
              X (Twitter)
            </a>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-navy">Upcoming Schedule</h2>
            <Link to={`/admin/events/${eventDetail.id}/programme`} className="text-sm font-semibold text-blue">
              View All
            </Link>
          </div>
          <ul className="relative grid gap-4 before:absolute before:top-2 before:bottom-2 before:left-[22px] before:w-px before:bg-slate-200">
            {eventSchedule.map((s) => (
              <li key={s.title} className="relative flex gap-3 pl-1">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-soft text-center text-[10px] font-bold uppercase leading-tight text-blue">
                  {s.day}
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="text-xs text-mute">
                    {s.time} · {s.place}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
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

function ProgrammeTab() {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-ink">Programme</h2>
      <ul className="grid gap-3">
        {eventSchedule.map((s) => (
          <li key={s.title} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 px-3 py-3">
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

function SpeakersTab() {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-ink">Speakers</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {draftSpeakers.map((sp) => (
          <li key={sp.id} className="rounded-lg border border-slate-200 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-soft text-sm font-bold text-blue">
              {sp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
            <p className="mt-3 font-semibold text-ink">{sp.name}</p>
            <p className="text-sm text-mute">{sp.role}</p>
            <p className="text-xs text-mute">{sp.org}</p>
            <p className="mt-2 text-sm text-blue">{sp.topic}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SponsorsTab() {
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

function CommunicationsTab() {
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
          <Phone size={14} /> {eventDetail.phone}
        </span>
        <span className="inline-flex items-center gap-1">
          <Mail size={14} /> {eventDetail.email}
        </span>
      </div>
    </Card>
  );
}
