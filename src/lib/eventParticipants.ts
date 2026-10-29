/**
 * Admin participant list for an engagement.
 * Source of truth: GET /engagements/{engagementID}/participants
 * (EngagementTicketController.getParticipants)
 * @see https://ciprop.mustsacco.co.ke/explorer/#/EngagementTicketController
 */

import { API_BASE_URL, TENANT_ID, apiForm, apiRequest, toFormData } from "./api";
import { getValidAuthToken } from "./auth";
import type { AddedParticipant } from "../components/admin/AddParticipantModal";
import { toTicketingUserType, type ParticipationType } from "../data/registration";
import {
  canIssueEventPass,
  encodeVerifiedReference,
  resolveVerificationBucket,
  stampTicketVerified,
  stripVerifiedPrefix,
  verificationBucketLabel,
  type VerificationBucket,
} from "./paymentVerification";
import {
  encodeWaiverReference,
  parseWaiverFromTicket,
  type WaiverReason,
} from "./participantWaiver";

export type { VerificationBucket };
export { canIssueEventPass, verificationBucketLabel };

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
  transactionReference?: string;
  paymentReceiptURL?: string | null;
  paymentMode?: string;
  waiverReason?: string;
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

/**
 * Bank payment proof files are stored as resource IDs on `paymentReceiptURL`.
 * Download via GET /resources/download/{id}?tenant-id=ACA
 */
export function resolvePaymentProofUrl(paymentReceiptURL: string): string {
  const raw = paymentReceiptURL.trim();
  if (!raw) return "";
  if (/^(data:|blob:)/i.test(raw)) return raw;

  // Already a download URL (absolute or relative).
  if (/\/resources\/download\//i.test(raw)) {
    if (/^(https?:)/i.test(raw)) {
      return raw.includes("tenant-id=")
        ? raw
        : `${raw}${raw.includes("?") ? "&" : "?"}tenant-id=${encodeURIComponent(TENANT_ID)}`;
    }
    const base = API_BASE_URL.replace(/\/$/, "");
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    const withTenant = path.includes("tenant-id=")
      ? path
      : `${path}${path.includes("?") ? "&" : "?"}tenant-id=${encodeURIComponent(TENANT_ID)}`;
    return `${base}${withTenant}`;
  }

  // Full absolute URL to some other host — use as-is.
  if (/^(https?:)/i.test(raw)) return raw;

  // Resource id → /resources/download/{paymentReceiptURL}?tenant-id=ACA
  const id = raw.replace(/^\/+/, "").replace(/^resources\/download\//i, "");
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/resources/download/${id}?tenant-id=${encodeURIComponent(TENANT_ID)}`;
}

/** @deprecated Prefer resolvePaymentProofUrl for receipts. */
export function resolveTicketMediaUrl(url: string): string {
  return resolvePaymentProofUrl(url);
}

function collectProofUrls(ticket: EngagementParticipantTicket): string[] {
  const found = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      const resolved = resolvePaymentProofUrl(value.trim());
      if (resolved) found.add(resolved);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }
    const row = asRecord(value);
    if (!row) return;
    add(row.url);
    add(row.path);
    add(row.id);
    add(row.resourceID);
    add(row.resourceId);
    add(row.fileURL);
    add(row.fileUrl);
    add(row.location);
    add(row.href);
    add(row.paymentReceiptURL);
  };

  add(ticket.paymentReceiptURL);
  const extra = asRecord(ticket.extraData);
  if (extra) {
    add(extra.paymentReceiptURL);
    add(extra.paymentProof);
    add(extra.paymentProofURL);
    add(extra.paymentProofUrl);
    add(extra.receiptUrl);
    add(extra.receiptURL);
    add(extra["payment-proof"]);
    add(extra.paymentProofs);
    add(extra.files);
    add(extra.documents);
    add(extra.receipts);
  }
  return Array.from(found);
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
  return verificationBucketLabel(resolveVerificationBucket(ticket));
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

  const passCode = pickString(ticket.passCode).replace(/\D/g, "").slice(0, 6);
  const waiver = parseWaiverFromTicket(ticket);
  const bucket = resolveVerificationBucket(ticket);
  const txRef = pickString(ticket.transactionReference, waiver?.transactionReference);
  const proofUrls = collectProofUrls(ticket);
  const receiptUrl = proofUrls[0] || pickString(ticket.paymentReceiptURL);

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
    registeredAtIso: validWhen ? validWhen.toISOString() : undefined,
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
    passCode: passCode.length >= 6 ? passCode : undefined,
    ticketID: pickString(ticket.ticketID) || undefined,
    reference: pickString(ticket.reference),
    rawStatus: pickString(ticket.status).toLowerCase() || undefined,
    paymentMode: waiver?.paymentMode,
    waiverReason: waiver?.waiverReason,
    agencyName: waiver?.agencyName,
    sponsorTicketID: waiver?.sponsorTicketID,
    transactionReference: txRef || undefined,
    displayPaymentReference: stripVerifiedPrefix(txRef) || undefined,
    paymentReceiptURL: receiptUrl || undefined,
    paymentProofUrls: proofUrls.length ? proofUrls : undefined,
    verificationBucket: bucket,
    passAllowed: canIssueEventPass(ticket),
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

export type EngagementParticipantSummary = {
  total: number;
  pendingVerification: number;
  confirmed: number;
  waived: number;
  registered: number;
};

/**
 * Count participants for many engagements via GET …/participants (batched).
 * Used by the admin dashboard when engagement.registered is missing/0.
 */
export async function sumEngagementParticipantCounts(
  engagementIds: string[],
  options: { concurrency?: number } = {},
): Promise<{
  total: number;
  pendingVerification: number;
  confirmed: number;
  waived: number;
  byId: Record<string, number>;
}> {
  const ids = [...new Set(engagementIds.map((id) => id.trim()).filter(Boolean))];
  const byId: Record<string, number> = {};
  let pendingVerification = 0;
  let confirmed = 0;
  let waived = 0;
  if (!ids.length) {
    return { total: 0, pendingVerification: 0, confirmed: 0, waived: 0, byId };
  }

  const concurrency = Math.max(1, Math.min(options.concurrency ?? 6, 12));
  let cursor = 0;

  async function worker() {
    while (cursor < ids.length) {
      const index = cursor;
      cursor += 1;
      const id = ids[index];
      try {
        const rows = await listEventParticipants(id);
        byId[id] = rows.length;
        for (const row of rows) {
          if (row.status === "Pending verification") pendingVerification += 1;
          else if (row.status === "Confirmed") confirmed += 1;
          else if (row.status === "Waived" || row.status === "Complimentary") waived += 1;
        }
      } catch {
        byId[id] = 0;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, () => worker()));
  const total = Object.values(byId).reduce((sum, n) => sum + n, 0);
  return { total, pendingVerification, confirmed, waived, byId };
}

export type CreateAdminParticipantWaiver = {
  reason: WaiverReason;
  agencyName?: string;
  sponsorTicketID?: string;
};

export type CreateAdminParticipantInput = {
  engagementID: string;
  participationType: ParticipationType;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  organisation: string;
  jobTitle: string;
  country: string;
  city: string;
  dietary?: string;
  accessibility?: string;
  /** Optional ticket price; omit or 0 when admin is registering without charge. */
  ticketPrice?: number;
  /** When set, create as waived / complimentary (skips payment). */
  waiver?: CreateAdminParticipantWaiver;
};

/**
 * Admin creates a participant ticket via POST /ticketing (multipart — JSON returns 415).
 */
export async function createAdminParticipant(
  input: CreateAdminParticipantInput,
): Promise<AddedParticipant> {
  const engagementID = input.engagementID.trim();
  if (!engagementID) throw new Error("Engagement ID is required.");

  const token = getValidAuthToken();
  if (!token) throw new Error("Sign in as admin to add a participant.");

  const waiver = input.waiver;
  if (waiver?.reason === "gov_speaker" && !waiver.agencyName?.trim()) {
    throw new Error("Enter the government agency for this speaker waiver.");
  }
  if (waiver?.reason === "sponsor_allocation" && !waiver.sponsorTicketID?.trim()) {
    throw new Error("Select which sponsor this complimentary seat belongs to.");
  }

  const userType =
    waiver?.reason === "gov_speaker"
      ? "speaker"
      : toTicketingUserType(input.participationType);

  const paymentMode = waiver
    ? waiver.reason === "sponsor_allocation"
      ? "complimentary"
      : "waived"
    : undefined;
  const waiverRef = waiver
    ? encodeWaiverReference({
        reason: waiver.reason,
        agencyName: waiver.agencyName,
        sponsorTicketID: waiver.sponsorTicketID,
      })
    : undefined;
  const transactionReference =
    waiverRef || encodeVerifiedReference("ADMIN-ADD");

  // EngagementTicket model rejects unknown top-level props (userType, title,
  // organisation, jobTitle, country, city, paymentMode, …). Keep those in extraData.
  const body: Record<string, unknown> = {
    engagementID,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phoneNo: input.phone.trim(),
    participationType: userType,
    currency: "KES",
    ticketPrice: waiver
      ? 0
      : Number.isFinite(input.ticketPrice)
        ? Number(input.ticketPrice)
        : 0,
    status: "registered",
    transactionReference,
    extraData: {
      organisation: input.organisation.trim(),
      jobTitle: input.jobTitle.trim(),
      dietary: input.dietary || "",
      accessibility: input.accessibility || "",
      title: input.title.trim(),
      country: input.country.trim(),
      city: input.city.trim(),
      userType,
      paymentVerified: true,
      verifiedAt: new Date().toISOString(),
      source: waiver ? "admin-add-waiver" : "admin-add",
      ...(paymentMode ? { paymentMode } : {}),
      ...(waiver ? { waiverReason: waiver.reason } : {}),
      ...(waiver?.agencyName?.trim()
        ? { agencyName: waiver.agencyName.trim() }
        : {}),
      ...(waiver?.sponsorTicketID?.trim()
        ? { sponsorTicketID: waiver.sponsorTicketID.trim() }
        : {}),
    },
  };

  const result = await apiForm<Record<string, unknown>>("/ticketing", {
    method: "POST",
    token,
    formData: toFormData(body),
  });

  const ticket = (result.ticket || result) as EngagementParticipantTicket;
  const ticketID = pickString(ticket.ticketID);
  // Non-waiver admin adds get an explicit VERIFIED stamp; waivers use WAIVER-* refs.
  if (ticketID && !waiver) {
    try {
      await stampTicketVerified(ticketID, "ADMIN-ADD");
    } catch {
      // Ticket created; stamp is best-effort if reference endpoint rejects.
    }
  }

  return toAddedParticipant({
    ...ticket,
    engagementID: pickString(ticket.engagementID) || engagementID,
    fullName: pickString(ticket.fullName) || input.fullName.trim(),
    email: pickString(ticket.email) || input.email.trim(),
    phoneNo: pickString(ticket.phoneNo) || input.phone.trim(),
    participationType: pickString(ticket.participationType) || input.participationType,
    organisation: pickString(ticket.organisation, ticket.organization) || input.organisation.trim(),
    jobTitle: pickString(ticket.jobTitle) || input.jobTitle.trim(),
    country: pickString(ticket.country) || input.country.trim(),
    city: pickString(ticket.city) || input.city.trim(),
    title: pickString(ticket.title) || input.title.trim(),
    paymentMode: paymentMode || ticket.paymentMode,
    waiverReason: waiver?.reason || ticket.waiverReason,
    transactionReference,
    extraData: {
      ...(asRecord(ticket.extraData) || {}),
      paymentVerified: true,
      ...(paymentMode ? { paymentMode } : {}),
      ...(waiver ? { waiverReason: waiver.reason } : {}),
      ...(waiver?.agencyName?.trim()
        ? { agencyName: waiver.agencyName.trim() }
        : {}),
      ...(waiver?.sponsorTicketID?.trim()
        ? { sponsorTicketID: waiver.sponsorTicketID.trim() }
        : {}),
    },
  });
}

export type TogglePaymentResult = {
  ticket: EngagementParticipantTicket;
  /** True when status is issued / checked-in after the call. */
  paid: boolean;
  message?: string;
};

/**
 * Confirm / toggle payment for an engagement ticket.
 * GET /ticketing/{ticketID}/confirm (@authenticate('jwt')).
 *
 * Backend: registered = still pending approval; issued = confirmed.
 */
export async function toggleParticipantPayment(ticketID: string): Promise<TogglePaymentResult> {
  const id = ticketID.trim();
  if (!id) {
    throw new Error("A ticket ID is required to confirm payment.");
  }

  const token = getValidAuthToken();
  if (!token) {
    throw new Error("Sign in as admin to confirm payment.");
  }

  const result = await apiRequest<Record<string, unknown>>(
    `/ticketing/${encodeURIComponent(id)}/confirm`,
    { method: "GET", token },
  );

  const ticket = (result.ticket || result) as EngagementParticipantTicket;
  const status = pickString(ticket.status).toLowerCase();
  const message =
    typeof result.message === "string" && result.message.trim()
      ? result.message.trim()
      : undefined;

  // Still pending after a successful HTTP response → treat as failed confirm.
  // registered = proof submitted, awaiting admin; draft = not ready.
  if (status === "registered" || status === "draft") {
    throw new Error(
      message || "Payment was not confirmed — ticket is still pending. Try again.",
    );
  }

  // Confirm alone is the source of truth — do not PATCH /reference afterwards.
  const next: EngagementParticipantTicket = {
    ...ticket,
    ticketID: pickString(ticket.ticketID) || id,
    status: status || "issued",
    transactionReference: pickString(ticket.transactionReference),
    extraData: {
      ...(asRecord(ticket.extraData) || {}),
      paymentVerified: true,
      verifiedAt: new Date().toISOString(),
    },
  };

  return { ticket: next, paid: true, message };
}

/** @deprecated Prefer toggleParticipantPayment */
export const confirmParticipantPayment = toggleParticipantPayment;

/**
 * Cancel an engagement ticket (POST /ticketing with status=cancelled).
 * No dedicated cancel route is published in OpenAPI.
 */
export async function cancelParticipantTicket(
  ticketID: string,
  engagementID?: string,
): Promise<EngagementParticipantTicket> {
  const id = ticketID.trim();
  if (!id) throw new Error("A ticket ID is required to cancel.");

  const token = getValidAuthToken();
  if (!token) throw new Error("Sign in as admin to cancel a ticket.");

  const body: Record<string, unknown> = {
    ticketID: id,
    status: "cancelled",
  };
  if (engagementID?.trim()) body.engagementID = engagementID.trim();

  const result = await apiForm<Record<string, unknown>>(`/ticketing/${ticketID}`, {
    method: "PATCH",
    token,
    formData: toFormData(body),
  });

  const ticket = (result.ticket || result) as EngagementParticipantTicket;
  return {
    ...ticket,
    ticketID: pickString(ticket.ticketID) || id,
    status: pickString(ticket.status).toLowerCase() || "cancelled",
  };
}
