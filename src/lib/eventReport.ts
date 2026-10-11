import {
  asProgramme,
  asSpeakers,
  asSponsors,
  asTickets,
} from "./engagements";
import type { Engagement } from "../types/engagement";

function parseKes(value?: string | number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return 0;
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function formatKes(n: number) {
  return `KES ${new Intl.NumberFormat("en-KE").format(n)}`;
}

function formatDateRange(start?: string, end?: string) {
  const fmt = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export type LiveEventReport = {
  name: string;
  venue: string;
  dateRange: string;
  status: string;
  registered: number;
  speakers: number;
  sponsors: number;
  sessions: number;
  ticketCapacity: number;
  ticketTypes: number;
  estimatedTicketValue: number;
  sponsorshipValue: number;
  paymentMethods: string[];
  kpis: Array<{ label: string; value: string }>;
  ticketBreakdown: Array<{ name: string; price: string; capacity: number; value: number }>;
  sponsorBreakdown: Array<{ name: string; tier: string; value: number }>;
  programmeTitles: string[];
  speakerNames: string[];
  csv: string;
  summaryText: string;
};

export function buildLiveEventReport(engagement: Engagement): LiveEventReport {
  const tickets = asTickets(engagement.tickets);
  const sponsors = asSponsors(engagement.sponsors);
  const speakers = asSpeakers(engagement.speakers);
  const programme = asProgramme(engagement.programme);
  const registered = Number(engagement.registered ?? 0);

  const ticketBreakdown = tickets.map((t) => {
    const price = parseKes(t.price);
    const capacity = t.capacity || 0;
    return {
      name: t.name,
      price: t.price || formatKes(price),
      capacity,
      value: price * capacity,
    };
  });
  const ticketCapacity = ticketBreakdown.reduce((s, t) => s + t.capacity, 0);
  const estimatedTicketValue = ticketBreakdown.reduce((s, t) => s + t.value, 0);

  const sponsorBreakdown = sponsors.map((s) => ({
    name: s.name,
    tier: s.tier || s.name,
    value: parseKes(s.price),
  }));
  const sponsorshipValue = sponsorBreakdown.reduce((s, t) => s + t.value, 0);

  const venue = [engagement.venue, engagement.city, engagement.country].filter(Boolean).join(", ") || "—";
  const paymentMethods = (engagement.paymentMethods || []).map(String);

  const kpis = [
    { label: "Registrations", value: registered.toLocaleString() },
    { label: "Ticket capacity", value: ticketCapacity.toLocaleString() },
    { label: "Ticket types", value: String(tickets.length) },
    { label: "Speakers", value: String(speakers.length) },
    { label: "Sponsors / packages", value: String(sponsors.length) },
    { label: "Programme sessions", value: String(programme.length) },
    { label: "Est. ticket inventory value", value: formatKes(estimatedTicketValue) },
    { label: "Sponsorship package value", value: formatKes(sponsorshipValue) },
  ];

  const csvLines = [
    ["Metric", "Value"],
    ...kpis.map((k) => [k.label, k.value]),
    [],
    ["Ticket", "Price", "Capacity", "Inventory value"],
    ...ticketBreakdown.map((t) => [t.name, t.price, String(t.capacity), formatKes(t.value)]),
    [],
    ["Sponsor", "Tier", "Value"],
    ...sponsorBreakdown.map((s) => [s.name, s.tier, formatKes(s.value)]),
    [],
    ["Speaker"],
    ...speakers.map((s) => [s.name]),
    [],
    ["Session", "Time", "Venue"],
    ...programme.map((p) => [p.title, p.time || "", p.venue || p.place || ""]),
  ].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
  );

  const summaryText = [
    `${engagement.engagementName}`,
    `Status: ${engagement.status || "—"}`,
    `Dates: ${formatDateRange(engagement.startDate, engagement.endDate)}`,
    `Venue: ${venue}`,
    "",
    ...kpis.map((k) => `${k.label}: ${k.value}`),
    "",
    `Payment methods: ${paymentMethods.length ? paymentMethods.join(", ") : "—"}`,
    "",
    "Note: Sold / revenue figures stay at zero until a registrations & payments API is available.",
  ].join("\n");

  return {
    name: engagement.engagementName,
    venue,
    dateRange: formatDateRange(engagement.startDate, engagement.endDate),
    status: String(engagement.status || "—"),
    registered,
    speakers: speakers.length,
    sponsors: sponsors.length,
    sessions: programme.length,
    ticketCapacity,
    ticketTypes: tickets.length,
    estimatedTicketValue,
    sponsorshipValue,
    paymentMethods,
    kpis,
    ticketBreakdown,
    sponsorBreakdown,
    programmeTitles: programme.map((p) => p.title),
    speakerNames: speakers.map((s) => s.name),
    csv: csvLines.join("\n"),
    summaryText,
  };
}
