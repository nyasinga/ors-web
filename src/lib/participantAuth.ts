/**
 * Participant session helpers.
 * Login and refresh both hit POST /ticketing/register; storage is a cache only.
 */

import { API_BASE_URL, apiRequest, TENANT_ID } from "./api";

const TOKEN_KEY = "ors_participant_token";
const SESSION_KEY = "ors_participant_session";
const REMEMBER_KEY = "ors_participant_remember";
const CHANGE_EVENT = "ors-participant-auth-change";

export type ParticipantSession = {
  id: string;
  fullName: string;
  email?: string;
  passCodeHint?: string;
  method: "passcode" | "qr";
  token: string;
  signedInAt: string;
  passCode: string;
  reference: string;
  engagementID: string;
  participationType: string;
  ticketPrice: number;
  currency: string;
  status: string;
  photo: string;
  registeredAt: string;
};

export type ParticipantLoginInput = {
  passCode?: string;
  viaQr?: boolean;
  remember?: boolean;
};

function storage(remember: boolean) {
  return remember ? localStorage : sessionStorage;
}

function wipeKeys() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function isSession(value: unknown): value is ParticipantSession {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.token === "string" &&
    row.token.trim().length > 0 &&
    typeof row.fullName === "string" &&
    row.fullName.trim().length > 0 &&
    (row.method === "passcode" || row.method === "qr")
  );
}

function remembersSession() {
  return localStorage.getItem(REMEMBER_KEY) === "1";
}

export function saveParticipantSession(session: ParticipantSession, remember: boolean) {
  wipeKeys();
  const store = storage(remember);
  store.setItem(TOKEN_KEY, session.token);
  store.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  notify();
}

export function clearParticipantSession() {
  wipeKeys();
  localStorage.removeItem(REMEMBER_KEY);
  notify();
}

export function getParticipantToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getParticipantSession(): ParticipantSession | null {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** True when a usable participant session is present. */
export function hasParticipantSession(): boolean {
  return Boolean(getParticipantToken() && getParticipantSession());
}

function sessionFromTicketResponse(
  result: Record<string, unknown>,
  passCode: string,
  method: "passcode" | "qr",
  previous?: ParticipantSession | null,
): ParticipantSession {
  const ticket = (result.ticket || result) as Record<string, unknown>;
  const participant = (ticket.participant || ticket.user || ticket) as Record<string, unknown>;
  const resolvedPass = String(ticket.passCode || passCode || previous?.passCode || "");

  return {
    id: String(ticket.ticketID || previous?.id || `participant-${Date.now()}`),
    fullName: String(participant.fullName || previous?.fullName || "").trim() || "Participant",
    email: participant.email ? String(participant.email) : previous?.email,
    passCodeHint: resolvedPass ? `${resolvedPass.slice(0, 2)}••••` : previous?.passCodeHint,
    passCode: resolvedPass,
    reference: String(ticket.reference || previous?.reference || ""),
    engagementID: String(ticket.engagementID || previous?.engagementID || ""),
    participationType: String(ticket.participationType || previous?.participationType || ""),
    ticketPrice: Number(ticket.ticketPrice ?? previous?.ticketPrice ?? NaN),
    currency: String(ticket.currency || previous?.currency || "KES"),
    status: String(ticket.status || previous?.status || ""),
    registeredAt: String(ticket.registeredAt || previous?.registeredAt || ""),
    method: previous?.method || method,
    token: String(result.token || previous?.token || `participant.${Date.now()}`),
    signedInAt: previous?.signedInAt || new Date().toISOString(),
    photo: String(ticket.photo || previous?.photo || ""),
  };
}

export async function participantLogin(input: ParticipantLoginInput): Promise<ParticipantSession> {
  const passCode = (input.passCode || "").replace(/\D/g, "").slice(0, 6);
  const viaQr = Boolean(input.viaQr);

  if (!viaQr && passCode.length < 6) {
    throw new Error("Enter the 6-digit pass code from your email");
  }

  if (!passCode) {
    throw new Error("A valid ticket pass code is required");
  }

  const result = await apiRequest<Record<string, unknown>>("/ticketing/register", {
    method: "POST",
    body: { passCode },
  });

  const session = sessionFromTicketResponse(result, passCode, viaQr ? "qr" : "passcode");
  saveParticipantSession(session, Boolean(input.remember));
  return session;
}

/** Re-fetch ticket from API and refresh the cached session. */
export async function refreshParticipantSession(): Promise<ParticipantSession | null> {
  const current = getParticipantSession();
  const passCode = (current?.passCode || "").replace(/\D/g, "");
  if (!current || passCode.length < 6) return current;

  // Prefer GET /ticketing/{passCode} — lighter than POST /ticketing/register for revalidate.
  const result = await apiRequest<Record<string, unknown>>(`/ticketing/${passCode}`);

  const session = sessionFromTicketResponse(result, passCode, current.method, current);
  saveParticipantSession(session, remembersSession());
  return session;
}

export function participantDisplayName(session: ParticipantSession | null | undefined, fallback = "Participant") {
  return session?.fullName?.trim() || fallback;
}

export function participantAvatar(
  resourceID: string | undefined | null,
): string | undefined {
  return resourceID
    ? `${API_BASE_URL}/resources/download/${resourceID}?tenant-id=${TENANT_ID}`
    : undefined;
}

export function participantInitials(session: ParticipantSession | null | undefined) {
  const name = participantDisplayName(session, "");
  if (!name) return "P";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export { CHANGE_EVENT as PARTICIPANT_AUTH_CHANGE_EVENT };
