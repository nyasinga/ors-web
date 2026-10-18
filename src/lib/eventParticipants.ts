/**
 * Admin participant list for an engagement.
 * Source of truth: GET /engagements/{engagementID}/participants
 * (EngagementTicketController.getParticipants)
 * @see https://ciprop.mustsacco.co.ke/explorer/#/EngagementTicketController
 */

import { apiRequest } from "./api";
import { getValidAuthToken } from "./auth";
import type { AddedParticipant } from "../components/admin/AddParticipantModal";
import type { ParticipationType } from "../data/registration";

export type EngagementParticipantTicket = {
  ticketID?: string;
  passCode?: string;
  reference?: string;
  engagementID?: string;
  fullName?: string;
  email?: string;
  phoneNo?: string;
  participationType?: string;
  ticketPrice?: number;
  currency?: string;
  photo?: string;
  status?: string;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  organisation?: string;
  organization?: string;
  jobTitle?: string;
  country?: string;
  city?: string;
  title?: string;
  dietary?: string;
  accessibility?: string;
  extraData?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type ListEventParticipantsOptions = {
  participationType?: string;
  status?: string;
};

const typeLabel: Record<string, string> = {
  delegate: "Delegate",
  speaker: "Speaker",
  sponsor: "Exhibitor",
  exhibitor: "Exhibitor",
  virtual: "Virtual Participant",
  student: "Student",
};

const typeTone: Record<string, string> = {
  delegate: "blue",
  speaker: "red",
  sponsor: "green",
  exhibitor: "green",
  virtual: "purple",
  student: "amber",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      return asRecord(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "?"
  );
}

function participationTypeOf(ticket: EngagementParticipantTicket): ParticipationType {
  const raw = pickString(ticket.participationType).toLowerCase();
  if (raw === "sponsor" || raw === "exhibitor") return "sponsor";
  if (raw === "speaker") return "speaker";
  if (raw === "virtual") return "virtual";
  return "delegate";
}

function uiTypeLabel(ticket: EngagementParticipantTicket) {
  const raw = pickString(ticket.participationType).toLowerCase();
  return typeLabel[raw] || (raw ? raw.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Delegate");
}

function uiStatus(ticket: EngagementParticipantTicket): string {
  const status = pickString(ticket.status).toLowerCase();
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  if (status === "issued") return "Pending";
  if (status === "registered" || status === "checked-in" || status === "checked_in") return "Confirmed";
  return status ? status.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Pending";
}

function uiCheckIn(ticket: EngagementParticipantTicket): string {
  const status = pickString(ticket.status).toLowerCase();
  if (status === "checked-in" || status === "checked_in") return "Checked In";
  return "—";
}

function normalizeTickets(payload: unknown): EngagementParticipantTicket[] {
  if (Array.isArray(payload)) return payload as EngagementParticipantTicket[];
  const record = asRecord(payload);
  if (!record) return [];
  for (const key of ["participants", "tickets", "data", "items", "result"]) {
    if (Array.isArray(record[key])) return record[key] as EngagementParticipantTicket[];
  }
  if (record.ticketID || record.passCode || record.email) return [record as EngagementParticipantTicket];
  return [];
}

function toAddedParticipant(ticket: EngagementParticipantTicket): AddedParticipant {
  const extra = asRecord(ticket.extraData);
  const name = pickString(ticket.fullName, ticket.email) || "Participant";
  const email = pickString(ticket.email);
  const org = pickString(
    ticket.organisation,
    ticket.organization,
    extra?.organisation,
    extra?.organization,
    extra?.org,
  );
  const whenRaw = pickString(ticket.registeredAt, ticket.createdAt, ticket.updatedAt);
  const when = whenRaw ? new Date(whenRaw) : null;
  const validWhen = when && !Number.isNaN(when.getTime()) ? when : null;
  const typeKey = pickString(ticket.participationType).toLowerCase() || "delegate";

  return {
    id: pickString(ticket.ticketID, ticket.reference, ticket.passCode, email, name) || `p-${Date.now()}`,
    name,
    email,
    org: org || "—",
    type: uiTypeLabel(ticket),
    category: pickString(extra?.category) || "—",
    status: uiStatus(ticket),
    date: validWhen
      ? validWhen.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    time: validWhen
      ? validWhen.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "",
    checkIn: uiCheckIn(ticket),
    initials: initialsFromName(name),
    avatarTone: typeTone[typeKey] || "blue",
    title: pickString(ticket.title, extra?.title),
    phone: pickString(ticket.phoneNo),
    jobTitle: pickString(ticket.jobTitle, extra?.jobTitle),
    country: pickString(ticket.country, extra?.country),
    city: pickString(ticket.city, extra?.city),
    dietary: pickString(ticket.dietary, extra?.dietary),
    accessibility: pickString(ticket.accessibility, extra?.accessibility),
    participationType: participationTypeOf(ticket),
  };
}

/** Load registrants via GET /engagements/{engagementID}/participants. */
export async function listEventParticipants(
  engagementId: string,
  options: ListEventParticipantsOptions = {},
): Promise<AddedParticipant[]> {
  const id = engagementId.trim();
  if (!id) return [];

  const params = new URLSearchParams();
  if (options.participationType?.trim()) params.set("participationType", options.participationType.trim());
  if (options.status?.trim()) params.set("status", options.status.trim());
  const qs = params.toString();
  const path = `/engagements/${encodeURIComponent(id)}/participants${qs ? `?${qs}` : ""}`;

  const token = getValidAuthToken();
  const payload = await apiRequest<unknown>(path, token ? { token } : {});
  return normalizeTickets(payload).map(toAddedParticipant);
}
