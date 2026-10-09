import type { EventStatus, EventType, ManagedEvent } from "../data/adminEvents";
import type {
  Engagement,
  EngagementFilter,
  EngagementMode,
  EngagementPaymentMethod,
  EngagementProgrammeSession,
  EngagementSpeaker,
  EngagementSponsor,
  EngagementTicket,
  EngagementStatus,
  EngagementType,
  LoopbackCount,
  NewEngagement,
} from "../types/engagement";
import { apiRequest } from "./api";
import { getAuthToken, getAuthUser } from "./auth";

function authToken() {
  return getAuthToken();
}

function filterQuery(filter?: EngagementFilter) {
  if (!filter) return "";
  return `?filter=${encodeURIComponent(JSON.stringify(filter))}`;
}

export async function listEngagements(filter?: EngagementFilter) {
  return apiRequest<Engagement[]>(`/engagements${filterQuery(filter)}`, {
    token: authToken(),
  });
}

export async function countEngagements(where?: Record<string, unknown>) {
  const q = where ? `?where=${encodeURIComponent(JSON.stringify(where))}` : "";
  return apiRequest<LoopbackCount>(`/engagements/count${q}`, {
    token: authToken(),
  });
}

export async function getEngagement(id: string, filter?: EngagementFilter) {
  return apiRequest<Engagement>(`/engagements/${encodeURIComponent(id)}${filterQuery(filter)}`, {
    token: authToken(),
  });
}

export async function createEngagement(body: NewEngagement) {
  return apiRequest<Engagement>("/engagements", {
    method: "POST",
    token: authToken(),
    body,
  });
}

export async function updateEngagement(id: string, body: Partial<Engagement>) {
  return apiRequest<void>(`/engagements/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token: authToken(),
    body,
  });
}

export async function deleteEngagement(id: string) {
  return apiRequest<void>(`/engagements/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token: authToken(),
  });
}

/** Clone an engagement as a new draft (Create from existing). */
export async function duplicateEngagement(id: string) {
  const source = await getEngagement(id);
  const {
    engagementID: _id,
    createdAt: _c,
    updatedAt: _u,
    publishedAt: _p,
    createdBy: _cb,
    updatedBy: _ub,
    ownerID: _o,
    ...rest
  } = source;
  const baseName = String(rest.engagementName ?? "Untitled event").trim() || "Untitled event";
  return createEngagement({
    ...rest,
    engagementName: `${baseName} (Copy)`,
    status: "draft",
    isPublished: false,
    publishedAt: undefined,
  } as NewEngagement);
}

/** UI Title Case → API enum */
export function toEngagementType(uiType: string): EngagementType {
  const key = uiType.trim().toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, EngagementType> = {
    conference: "conference",
    workshop: "workshop",
    training: "training",
    seminar: "seminar",
    summit: "summit",
    exhibition: "exhibition",
    webinar: "webinar",
    forum: "forum",
    symposium: "symposium",
    meeting: "meeting",
    roundtable: "meeting",
    others: "other",
    other: "other",
  };
  return map[key] ?? "other";
}

export function toUiEventType(type?: string): EventType {
  if (!type) return "Others";
  const label = type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const allowed: EventType[] = [
    "Conference",
    "Workshop",
    "Training",
    "Seminar",
    "Summit",
    "Exhibition",
    "Webinar",
    "Roundtable",
    "Forum",
    "Others",
  ];
  if (type === "other") return "Others";
  if (type === "meeting") return "Roundtable";
  return (allowed.find((a) => a.toLowerCase() === label.toLowerCase()) ?? "Others") as EventType;
}

export function toEngagementMode(ui: "in-person" | "virtual" | "hybrid"): EngagementMode {
  if (ui === "virtual") return "virtual";
  if (ui === "hybrid") return "hybrid";
  return "in_person";
}

export function toUiMode(mode?: EngagementMode): "in-person" | "virtual" | "hybrid" {
  if (mode === "virtual") return "virtual";
  if (mode === "hybrid") return "hybrid";
  return "in-person";
}

/** Derive Manage Events tab status from API status + dates */
export function toUiListStatus(engagement: Engagement, now = new Date()): EventStatus {
  const apiStatus = engagement.status;
  if (apiStatus === "draft" || apiStatus === "cancelled" || apiStatus === "archived") {
    return "Draft";
  }
  if (apiStatus === "ongoing") return "Ongoing";
  if (apiStatus === "completed") return "Past";

  const start = engagement.startDate ? new Date(engagement.startDate) : null;
  const end = engagement.endDate ? new Date(engagement.endDate) : null;
  if (start && !Number.isNaN(start.getTime()) && end && !Number.isNaN(end.getTime())) {
    if (now < start) return "Upcoming";
    if (now > end) return "Past";
    return "Ongoing";
  }
  if (apiStatus === "published") return "Upcoming";
  return "Draft";
}

function formatDateLabel(startIso?: string, endIso?: string) {
  if (!startIso) return "—";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  const a = start.toLocaleDateString("en-GB", opts);
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) return a;
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} ${start.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    })}`;
  }
  return `${a} – ${end.toLocaleDateString("en-GB", opts)}`;
}

function formatDaysLabel(startIso?: string, endIso?: string) {
  if (!startIso) return "";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : start;
  if (Number.isNaN(start.getTime())) return "";
  const day = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short" });
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) return day(start);
  return `${day(start)} – ${day(end)}`;
}

function barToneFor(type: EventType): ManagedEvent["barTone"] {
  const map: Partial<Record<EventType, ManagedEvent["barTone"]>> = {
    Conference: "green",
    Workshop: "blue",
    Training: "purple",
    Seminar: "orange",
    Summit: "red",
    Exhibition: "blue",
    Webinar: "purple",
    Forum: "green",
    Roundtable: "orange",
    Others: "blue",
  };
  return map[type] ?? "blue";
}

export function asStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function asProgramme(value: unknown): EngagementProgrammeSession[] {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return asProgramme(parsed);
    } catch {
      return value.trim() ? [{ title: value.trim() }] : [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = String(row.title ?? "").trim();
      if (!title) return null;
      return {
        id: row.id != null ? String(row.id) : undefined,
        day: row.day as number | string | undefined,
        title,
        description: row.description != null ? String(row.description) : undefined,
        startTime: row.startTime != null ? String(row.startTime) : undefined,
        endTime: row.endTime != null ? String(row.endTime) : undefined,
        time: row.time != null ? String(row.time) : undefined,
        venue: row.venue != null ? String(row.venue) : undefined,
        place: row.place != null ? String(row.place) : undefined,
        badge: row.badge != null ? String(row.badge) : undefined,
        speakers: row.speakers as number | string[] | undefined,
        speakerNames: Array.isArray(row.speakerNames)
          ? row.speakerNames.map(String)
          : undefined,
      } satisfies EngagementProgrammeSession;
    })
    .filter(Boolean) as EngagementProgrammeSession[];
}

export function asSpeakers(value: unknown): EngagementSpeaker[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      if (!name) return null;
      return {
        id: row.id != null ? String(row.id) : undefined,
        name,
        role: row.role != null ? String(row.role) : undefined,
        org: row.org != null ? String(row.org) : undefined,
        topic: row.topic != null ? String(row.topic) : undefined,
        roleLines: Array.isArray(row.roleLines) ? row.roleLines.map(String) : undefined,
        country: row.country != null ? String(row.country) : undefined,
        flag: row.flag != null ? String(row.flag) : undefined,
        category: row.category != null ? String(row.category) : undefined,
        badge: row.badge != null ? String(row.badge) : undefined,
        photo: row.photo != null ? String(row.photo) : undefined,
        bio: row.bio != null ? String(row.bio) : undefined,
      } satisfies EngagementSpeaker;
    })
    .filter(Boolean) as EngagementSpeaker[];
}

export function asSponsors(value: unknown): EngagementSponsor[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      if (!name) return null;
      return {
        id: row.id != null ? String(row.id) : undefined,
        name,
        subtitle: row.subtitle != null ? String(row.subtitle) : undefined,
        price: row.price as number | string | undefined,
        availability: row.availability != null ? String(row.availability) : undefined,
        benefits: Array.isArray(row.benefits) ? row.benefits.map(String) : undefined,
        active: typeof row.active === "boolean" ? row.active : undefined,
        tone: row.tone != null ? String(row.tone) : undefined,
        tier: row.tier != null ? String(row.tier) : undefined,
      } satisfies EngagementSponsor;
    })
    .filter(Boolean) as EngagementSponsor[];
}

export function asTickets(value: unknown): EngagementTicket[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      if (!name) return null;
      return {
        id: row.id != null ? String(row.id) : undefined,
        name,
        price: row.price != null ? String(row.price) : undefined,
        capacity: typeof row.capacity === "number" ? row.capacity : Number(row.capacity) || undefined,
        period: row.period != null ? String(row.period) : undefined,
        tone: row.tone != null ? String(row.tone) : undefined,
      } satisfies EngagementTicket;
    })
    .filter(Boolean) as EngagementTicket[];
}

function truncateText(value: string, max = 90) {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function pickRegistered(engagement: Engagement) {
  const record = engagement as Engagement & Record<string, unknown>;
  const raw =
    engagement.registered ??
    record.registrationCount ??
    record.participantCount ??
    record.registeredCount ??
    0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function pickCapacity(engagement: Engagement) {
  const n = Number(engagement.capacity || engagement.registrationLimit || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function venueLabel(engagement: Engagement) {
  const parts = [engagement.venue, engagement.city].map((v) => String(v ?? "").trim()).filter(Boolean);
  if (parts.length) return parts.join(", ");
  const mode = toUiMode(engagement.mode);
  if (mode === "virtual") return "Virtual";
  if (mode === "hybrid") return "Hybrid";
  return "—";
}

export function toManagedEvent(engagement: Engagement): ManagedEvent {
  const type = toUiEventType(engagement.engagementType);
  const capacity = pickCapacity(engagement);
  const registered = pickRegistered(engagement);
  const subtitle = truncateText(
    engagement.shortDescription || engagement.description || "",
  );
  return {
    id: String(engagement.engagementID ?? "").trim(),
    name: String(engagement.engagementName ?? "").trim() || "Untitled event",
    subtitle,
    dateLabel: formatDateLabel(engagement.startDate, engagement.endDate),
    daysLabel: formatDaysLabel(engagement.startDate, engagement.endDate),
    venue: venueLabel(engagement),
    type,
    registered,
    capacity,
    status: toUiListStatus(engagement),
    barTone: barToneFor(type),
  };
}

export type DashboardUpcomingItem = {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  place: string;
  status: "Published" | "Draft";
};

/** Compact list row for admin dashboard “Upcoming Events”. */
export function toDashboardUpcoming(engagement: Engagement): DashboardUpcomingItem | null {
  const id = String(engagement.engagementID ?? "").trim();
  if (!id) return null;
  const start = engagement.startDate ? new Date(engagement.startDate) : null;
  if (!start || Number.isNaN(start.getTime())) return null;

  const end = engagement.endDate ? new Date(engagement.endDate) : null;
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: engagement.timezone || undefined,
  };
  let time = start.toLocaleTimeString("en-GB", timeOpts);
  if (end && !Number.isNaN(end.getTime())) {
    time = `${time} – ${end.toLocaleTimeString("en-GB", timeOpts)}`;
  }

  const published =
    engagement.isPublished === true ||
    engagement.status === "published" ||
    engagement.status === "ongoing";

  return {
    id,
    month: start.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    day: String(start.getDate()).padStart(2, "0"),
    title: String(engagement.engagementName ?? "").trim() || "Untitled event",
    time,
    place: venueLabel(engagement),
    status: published ? "Published" : "Draft",
  };
}

export type EngagementKpiSummary = {
  totalRegistrations: number;
  speakers: number;
  sponsors: number;
  totalEvents: number;
  upcomingEvents: number;
  publishedEvents: number;
};

export function summarizeEngagementKpis(rows: Engagement[]): EngagementKpiSummary {
  let totalRegistrations = 0;
  let speakers = 0;
  let sponsors = 0;
  let upcomingEvents = 0;
  let publishedEvents = 0;

  for (const row of rows) {
    totalRegistrations += pickRegistered(row);
    speakers += asSpeakers(row.speakers).length;
    sponsors += asSponsors(row.sponsors).length;
    const ui = toUiListStatus(row);
    if (ui === "Upcoming" || ui === "Ongoing") upcomingEvents += 1;
    if (row.isPublished || row.status === "published" || row.status === "ongoing") {
      publishedEvents += 1;
    }
  }

  return {
    totalRegistrations,
    speakers,
    sponsors,
    totalEvents: rows.length,
    upcomingEvents,
    publishedEvents,
  };
}

export function combineDateTime(date: string, time: string, allDay: boolean) {
  if (!date) return new Date().toISOString();
  if (allDay) {
    const d = new Date(`${date}T00:00:00`);
    return Number.isNaN(d.getTime()) ? `${date}T00:00:00.000Z` : d.toISOString();
  }
  const d = new Date(`${date}T${time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? `${date}T${time || "00:00"}:00.000Z` : d.toISOString();
}

export type WizardEngagementInput = {
  eventType: string;
  title: string;
  description: string;
  category: string;
  audience: string;
  tone: string;
  language: string;
  tags: string[];
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  venueMode: "in-person" | "virtual" | "hybrid";
  venueName: string;
  address: string;
  city: string;
  country: string;
  capacity: string;
  virtualLink: string;
  sessions: Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    speakers: number;
    place: string;
    badge: string;
  }>;
  speakers: Array<{
    id: string;
    name: string;
    role: string;
    org: string;
    topic: string;
    roleLines?: string[];
    country?: string;
    flag?: string;
    category?: string;
    badge?: string;
    photo?: string;
    bio?: string;
  }>;
  packages: Array<{
    id: string;
    name: string;
    subtitle: string;
    price: number;
    availability: string;
    benefits: string[];
    active: boolean;
    tone: string;
  }>;
  tickets: Array<{
    id: string;
    name: string;
    price: string;
    capacity: number;
    period: string;
    tone: string;
  }>;
  requireApproval: boolean;
  waitlist: boolean;
  deadlineOn: boolean;
  limitOn: boolean;
  payMpesa: boolean;
  payCard: boolean;
  payBank: boolean;
  payFree: boolean;
  visibility: "public" | "private" | "unlisted";
  saveDraft: boolean;
  websiteUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
};

export function buildEngagementPayload(input: WizardEngagementInput): NewEngagement {
  const user = getAuthUser();
  const paymentMethods: EngagementPaymentMethod[] = [];
  if (input.payMpesa) paymentMethods.push("mpesa");
  if (input.payCard) paymentMethods.push("card");
  if (input.payBank) paymentMethods.push("bank_transfer");
  if (input.payFree) paymentMethods.push("free");

  const capacityNum = Number(input.capacity) || undefined;
  const isDraft = input.saveDraft;
  const status: EngagementStatus = isDraft ? "draft" : "published";

  const programme: EngagementProgrammeSession[] = input.sessions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    time: s.time,
    venue: s.place,
    badge: s.badge,
    speakers: s.speakers,
  }));

  const speakers: EngagementSpeaker[] = input.speakers.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    org: s.org,
    topic: s.topic,
    roleLines: s.roleLines,
    country: s.country,
    flag: s.flag,
    category: s.category,
    badge: s.badge,
    photo: s.photo,
    bio: s.bio,
  }));

  const sponsors: EngagementSponsor[] = input.packages.map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    availability: p.availability,
    benefits: p.benefits,
    active: p.active,
    tone: p.tone,
    tier: p.name,
  }));

  const tickets: EngagementTicket[] = input.tickets.map((t) => ({
    id: t.id,
    name: t.name,
    price: t.price,
    capacity: t.capacity,
    period: t.period,
    tone: t.tone,
  }));

  const toneMap: Record<string, NonNullable<Engagement["tone"]>> = {
    professional: "professional",
    formal: "formal",
    casual: "conversational",
    conversational: "conversational",
  };
  const audience = (input.audience || "mixed") as Engagement["audience"];
  const tone = toneMap[input.tone] ?? "professional";
  const language = (input.language || "en") as Engagement["language"];

  return {
    engagementType: toEngagementType(input.eventType),
    engagementName: input.title.trim(),
    category: input.category || undefined,
    shortDescription: input.description.trim().slice(0, 180) || undefined,
    description: input.description.trim() || undefined,
    audience,
    tone,
    language,
    tags: input.tags,
    startDate: combineDateTime(input.startDate, input.startTime, input.allDay),
    endDate: combineDateTime(input.endDate, input.endTime, input.allDay),
    allDay: input.allDay,
    timezone: "Africa/Nairobi",
    mode: toEngagementMode(input.venueMode),
    venue: input.venueName || undefined,
    venueAddress: input.address || undefined,
    city: input.city || undefined,
    country: input.country || undefined,
    capacity: capacityNum,
    virtualLink: input.virtualLink || undefined,
    status,
    visibility: input.visibility,
    isPublished: !isDraft,
    publishedAt: isDraft ? undefined : new Date().toISOString(),
    registrationEnabled: true,
    registrationEndDate: input.deadlineOn
      ? combineDateTime(input.startDate, "00:00", true)
      : undefined,
    approvalRequired: input.requireApproval,
    waitlistEnabled: input.waitlist,
    registrationLimit: input.limitOn ? capacityNum : undefined,
    paymentEnabled: paymentMethods.some((m) => m !== "free"),
    paymentMethods,
    currency: "KES",
    themes: input.tags,
    objectives: [],
    programme,
    speakers,
    sponsors,
    tickets,
    websiteUrl: input.websiteUrl?.trim() || undefined,
    facebookUrl: input.facebookUrl?.trim() || undefined,
    twitterUrl: input.twitterUrl?.trim() || undefined,
    linkedinUrl: input.linkedinUrl?.trim() || undefined,
    contactEmail: user?.email,
    contactName: user?.fullName,
    contactPhone: user?.phoneNo,
    createdBy: user?.id || user?.email,
    ownerID: user?.id,
  };
}

function toDateInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeInput(iso?: string) {
  if (!iso) return "09:00";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "09:00";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Hydrate create/edit wizard state from an Engagement record */
export function engagementToWizardState(engagement: Engagement) {
  const programme = asProgramme(engagement.programme);
  const speakers = asSpeakers(engagement.speakers);
  const sponsors = asSponsors(engagement.sponsors);
  const tickets = asTickets(engagement.tickets);
  const methods = new Set((engagement.paymentMethods || []).map(String));

  return {
    eventType: toUiEventType(engagement.engagementType),
    title: engagement.engagementName || "",
    description: engagement.description || engagement.shortDescription || "",
    category: engagement.category || "legal",
    audience: engagement.audience || "government",
    tone: engagement.tone || "professional",
    language: engagement.language || "en",
    tags: Array.isArray(engagement.tags) ? engagement.tags.map(String) : [],
    startDate: toDateInput(engagement.startDate),
    endDate: toDateInput(engagement.endDate),
    allDay: Boolean(engagement.allDay),
    startTime: toTimeInput(engagement.startDate),
    endTime: toTimeInput(engagement.endDate),
    venueMode: toUiMode(engagement.mode),
    venueName: engagement.venue || "",
    address: engagement.venueAddress || "",
    city: engagement.city || "",
    country: engagement.country || "KE",
    capacity: String(engagement.capacity || engagement.registrationLimit || ""),
    virtualLink: engagement.virtualLink || "",
    sessions:
      programme.length > 0
        ? programme.map((s, i) => ({
            id: s.id || `s${i + 1}`,
            time: s.time || [s.startTime, s.endTime].filter(Boolean).join(" – ") || "—",
            title: s.title,
            description: s.description || "",
            speakers: typeof s.speakers === "number" ? s.speakers : Array.isArray(s.speakers) ? s.speakers.length : 0,
            place: s.venue || s.place || "",
            badge: s.badge || "Session",
            tone: "blue" as const,
          }))
        : [],
    speakers:
      speakers.length > 0
        ? speakers.map((s, i) => ({
            id: s.id || `sp${i + 1}`,
            name: s.name,
            role: s.role || "",
            org: s.org || "",
            topic: s.topic || "",
            roleLines: s.roleLines,
            country: s.country || "",
            flag: s.flag || "",
            category: s.category || "panelist",
            badge: s.badge || "",
            photo: s.photo || "",
            bio: s.bio || "",
          }))
        : [],
    packages:
      sponsors.length > 0
        ? sponsors.map((p, i) => ({
            id: p.id || `pkg${i + 1}`,
            name: p.name,
            subtitle: p.subtitle || "",
            price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
            availability: p.availability || "",
            benefits: p.benefits?.length ? [...p.benefits] : [],
            active: p.active !== false,
            tone: (p.tone as "amber" | "yellow" | "slate" | "orange") || "slate",
          }))
        : [],
    tickets:
      tickets.length > 0
        ? tickets.map((t, i) => ({
            id: t.id || `t${i + 1}`,
            name: t.name,
            price: t.price || "",
            capacity: t.capacity || 0,
            period: t.period || "",
            tone: (t.tone as "green" | "blue" | "orange") || "blue",
          }))
        : [],
    requireApproval: Boolean(engagement.approvalRequired),
    waitlist: Boolean(engagement.waitlistEnabled),
    deadlineOn: Boolean(engagement.registrationEndDate),
    limitOn: Boolean(engagement.registrationLimit),
    payMpesa: methods.size === 0 ? true : methods.has("mpesa"),
    payCard: methods.size === 0 ? true : methods.has("card"),
    payBank: methods.size === 0 ? true : methods.has("bank_transfer"),
    payFree: methods.has("free"),
    visibility: (engagement.visibility || "public") as "public" | "private" | "unlisted",
    saveDraft: engagement.status === "draft" || engagement.isPublished === false,
    websiteUrl: engagement.websiteUrl || "",
    facebookUrl: engagement.facebookUrl || "",
    twitterUrl: engagement.twitterUrl || "",
    linkedinUrl: engagement.linkedinUrl || "",
  };
}

export function formatEngagementStatusLabel(status?: EngagementStatus | string) {
  if (!status) return "Draft";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatModeLabel(mode?: EngagementMode) {
  if (mode === "virtual") return "Virtual";
  if (mode === "hybrid") return "Hybrid";
  return "In-Person";
}
